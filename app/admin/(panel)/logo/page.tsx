import { LogoUploader } from '@/components/admin/home-content/logo-uploader';
import { getHomeContent } from '@/lib/home-content/public';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LogoPage() {
  const content = await getHomeContent();

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
          Identidad visual
        </p>

        <h1 className="mt-2 text-3xl font-semibold">
          Logo del sitio
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Adjuntá y reemplazá el logo para escritorio y celular sin copiar URLs ni rutas de Storage.
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <LogoUploader
          initialEnabled={content.logoEnabled}
          initialDesktopUrl={content.logoDesktopUrl}
          initialDesktopPath={content.logoDesktopPath}
          initialMobileUrl={content.logoMobileUrl}
          initialMobilePath={content.logoMobilePath}
          initialAlt={content.logoAlt}
        />
      </section>
    </main>
  );
}
