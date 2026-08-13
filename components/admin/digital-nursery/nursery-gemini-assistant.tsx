'use client';

import { Check, Eye, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';

import {
  generateNurseryCopyAction,
  reviewNurseryImageAction,
  type NurseryImageReview,
  type NurseryGeminiSuggestion
} from '@/app/admin/(panel)/vivero-digital/gemini-actions';

function formValue(form: HTMLFormElement, name: string) {
  return String(new FormData(form).get(name) ?? '').trim();
}

function setFormValue(form: HTMLFormElement, name: string, value: string) {
  const field = form.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function NurseryGeminiAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestion, setSuggestion] = useState<NurseryGeminiSuggestion | null>(null);
  const [isReviewingImage, setIsReviewingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState('');
  const [imageReview, setImageReview] = useState<NurseryImageReview | null>(null);

  async function generate(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest('form');
    if (!form) return;

    setMessage('');
    setSuggestion(null);
    setIsGenerating(true);
    const result = await generateNurseryCopyAction({
      name: formValue(form, 'name'),
      variant: formValue(form, 'variant'),
      category: formValue(form, 'category'),
      description: formValue(form, 'description')
    });
    setIsGenerating(false);

    if (!result.success) {
      setMessage(result.message);
      return;
    }
    setSuggestion(result.suggestion);
  }

  function apply(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest('form');
    if (!form || !suggestion) return;
    setFormValue(form, 'description', suggestion.description);
    setFormValue(form, 'whatsapp_message', suggestion.whatsappMessage);
    setSuggestion(null);
    setMessage('Propuesta aplicada. Revisá los textos antes de guardar.');
  }

  async function reviewImage(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest('form');
    if (!form) return;
    setImageMessage('');
    setImageReview(null);
    setIsReviewingImage(true);
    const result = await reviewNurseryImageAction({
      name: formValue(form, 'name'),
      imageUrl: formValue(form, 'image_url')
    });
    setIsReviewingImage(false);
    if (!result.success) {
      setImageMessage(result.message);
      return;
    }
    setImageReview(result.review);
  }

  return (
    <div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-emerald-950"><Sparkles className="h-5 w-5" />Asistente Gemini</p>
          <p className="mt-1 text-sm text-emerald-900/70">Mejora la descripción y prepara la consulta de WhatsApp. No guarda automáticamente.</p>
        </div>
        <button type="button" onClick={generate} disabled={isGenerating} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {isGenerating ? 'Generando…' : 'Generar con Gemini'}
        </button>
      </div>
      {message ? <p className="mt-3 text-sm font-medium text-emerald-900">{message}</p> : null}
      {suggestion ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-sm">
          <p className="font-semibold text-slate-900">Vista previa</p>
          <p className="mt-3 font-semibold text-slate-700">Descripción</p>
          <p className="mt-1 text-slate-600">{suggestion.description}</p>
          <p className="mt-3 font-semibold text-slate-700">Mensaje de WhatsApp</p>
          <p className="mt-1 text-slate-600">{suggestion.whatsappMessage}</p>
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={apply} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800"><Check className="h-4 w-4" />Aplicar propuesta</button>
            <button type="button" onClick={() => setSuggestion(null)} className="h-10 rounded-xl border border-slate-200 px-4 font-semibold text-slate-700">Descartar</button>
          </div>
        </div>
      ) : null}
      <div className="mt-4 border-t border-emerald-200 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-semibold text-emerald-950"><Eye className="h-5 w-5" />Revisión de fotografía</p>
            <p className="mt-1 text-sm text-emerald-900/70">Detecta problemas visuales. No cambia ni elimina la imagen.</p>
          </div>
          <button type="button" onClick={reviewImage} disabled={isReviewingImage} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-60">
            {isReviewingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            {isReviewingImage ? 'Analizando…' : 'Analizar fotografía'}
          </button>
        </div>
        {imageMessage ? <p className="mt-3 text-sm font-medium text-emerald-900">{imageMessage}</p> : null}
        {imageReview ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4 text-sm">
            <p className="font-semibold capitalize text-slate-900">Resultado: {imageReview.status}</p>
            <p className="mt-2 text-slate-600">{imageReview.summary}</p>
            {imageReview.strengths.length ? <div className="mt-3"><p className="font-semibold text-slate-700">Puntos favorables</p><ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">{imageReview.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
            {imageReview.issues.length ? <div className="mt-3"><p className="font-semibold text-slate-700">A revisar</p><ul className="mt-1 list-disc space-y-1 pl-5 text-slate-600">{imageReview.issues.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
