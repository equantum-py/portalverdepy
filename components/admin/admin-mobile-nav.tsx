'use client';

import { ExternalLink, Leaf, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef } from 'react';

import { AdminLogoutButton } from '@/components/admin/admin-logout-button';
import { adminNavigation } from '@/lib/admin/navigation';
import { cn } from '@/lib/utils';

export function AdminMobileNav() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const activeItem = adminNavigation.find(({ href }) => pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`)));

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <div className="flex min-w-0 items-center gap-3 lg:hidden">
      <button type="button" aria-haspopup="dialog" aria-label="Abrir menú administrativo"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-900 text-white">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="min-w-0">
        <p className="text-xs text-slate-600">Portal Verde</p>
        <p className="truncate text-sm font-semibold text-slate-950">{activeItem?.title ?? 'Administración'}</p>
      </div>

      <dialog ref={dialog} aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[86%] max-w-sm overflow-visible bg-transparent p-0 backdrop:bg-black/55">
        <div className="flex h-full flex-col bg-[#0d2e1b] px-4 py-3 text-white [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex shrink-0 items-center justify-between gap-2">
            <h2 id={titleId} className="flex items-center gap-2 font-semibold">
              <Leaf className="h-5 w-5" aria-hidden="true" /> Administración
            </h2>
            <button type="button" autoFocus aria-label="Cerrar menú" onClick={() => dialog.current?.close()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Secciones del panel" className="my-3 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
            {adminNavigation.map((item) => {
              const Icon = item.icon;
              const active = item === activeItem;
              return (
                <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined}
                  onClick={() => dialog.current?.close()}
                  className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium',
                    active ? 'bg-white text-green-950' : 'text-white/80 hover:bg-white/10')}>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-white/15 pt-2">
            <Link href="/" target="_blank" rel="noopener" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-white/90">
              <ExternalLink className="h-5 w-5" aria-hidden="true" /> Ver sitio público
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </dialog>
    </div>
  );
}
