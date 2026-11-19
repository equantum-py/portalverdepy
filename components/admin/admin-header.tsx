import { Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';

type AdminHeaderProps = {
  fullName: string;
  role: string;
};

export function AdminHeader({
  fullName,
  role
}: AdminHeaderProps) {
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-16 lg:min-h-[72px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AdminMobileNav />

          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-slate-950">
              Panel administrativo
            </p>

            <p className="truncate text-xs text-slate-500">
              Gestión de Portal Verde
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
          >
            Ver sitio
            <ExternalLink className="h-4 w-4" />
          </Link>

          <button
            type="button"
            aria-label="Notificaciones"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:inline-flex"
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 items-center gap-2 rounded-xl bg-slate-100 p-1.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-700 text-xs font-semibold text-white">
              {initials || 'PV'}
            </span>

            <div className="hidden min-w-0 pr-2 md:block">
              <p className="max-w-44 truncate text-xs font-semibold text-slate-900">
                {fullName}
              </p>

              <p className="text-[10px] capitalize text-slate-500">
                {role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
