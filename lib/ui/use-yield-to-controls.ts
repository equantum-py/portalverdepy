'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Los elementos flotantes (burbuja de WhatsApp, Asesor Verde) no deben tapar CTA ni selectores en
 * mobile. Un elemento fijo siempre pasa por encima del contenido al hacer scroll, así que la regla es:
 * mientras el usuario se desplaza se muestran; cuando el scroll se detiene y el flotante tapa el centro de un control
 * interactivo o una parte sustancial (≥30 %) de su área, se aparta (opacity 0, sin eventos) hasta el siguiente scroll.
 * Solo aplica en mobile (<640 px). No toca el tracking ni el DOM de los CTA.
 */
const CONTROLS = 'a[href], button, input, select, textarea, [role="button"]';
const COVERED_RATIO = 0.3;
const IDLE_MS = 160;

export function useYieldToControls(ref: RefObject<HTMLElement | null>, enabled = true) {
  const [yielded, setYielded] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setYielded(false);
      return;
    }

    const media = window.matchMedia('(max-width: 639px)');
    let timer: number | undefined;

    const evaluate = () => {
      const el = ref.current;
      if (!el || !media.matches || el.contains(document.activeElement)) {
        setYielded(false);
        return;
      }

      const box = el.getBoundingClientRect();
      const covers = Array.from(document.querySelectorAll<HTMLElement>(CONTROLS)).some((control) => {
        if (control.closest('[data-floating-widget], header')) return false;
        const rect = control.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        const width = Math.min(box.right, rect.right) - Math.max(box.left, rect.left);
        const height = Math.min(box.bottom, rect.bottom) - Math.max(box.top, rect.top);
        if (width <= 0 || height <= 0) return false;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const coversCenter = cx >= box.left && cx <= box.right && cy >= box.top && cy <= box.bottom;
        return coversCenter || (width * height) / (rect.width * rect.height) >= COVERED_RATIO;
      });

      setYielded(covers);
    };

    const onMove = () => {
      setYielded(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(evaluate, IDLE_MS);
    };

    onMove();
    window.addEventListener('scroll', onMove, { passive: true });
    window.addEventListener('resize', onMove);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onMove);
      window.removeEventListener('resize', onMove);
    };
  }, [ref, enabled]);

  return yielded;
}
