'use client';

import { CheckCircle2, ExternalLink, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

import { saveServiceBannerAction, type ServiceBannerInput } from '@/app/admin/(panel)/banners-servicios/actions';
import { SectionBannerUploader } from './section-banner-uploader';

export function ServiceBannersManager({ initialBanners }: { initialBanners: ServiceBannerInput[] }) {
  const [banners, setBanners] = useState(initialBanners);

  function update(index: number, values: Partial<ServiceBannerInput>) {
    setBanners((current) => current.map((banner, itemIndex) => itemIndex === index ? { ...banner, ...values } : banner));
  }

  return <div className="space-y-6">
    <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-950">
      <strong>¿Dónde aparecen?</strong> Los dos banners se muestran juntos en la Home, después de Plantas y antes de Paisajismo.
    </div>
    {banners.map((banner, index) => <ServiceBannerCard key={banner.key} number={index + 1} banner={banner} onChange={(values) => update(index, values)} />)}
  </div>;
}

function ServiceBannerCard({ number, banner, onChange }: { number: number; banner: ServiceBannerInput; onChange: (values: Partial<ServiceBannerInput>) => void }) {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function save() {
    setSaving(true); setResult(null);
    const response = await saveServiceBannerAction(banner);
    setResult(response); setSaving(false);
  }

  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-4">
      <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 font-bold text-white">{number}</span><div><p className="text-xs font-semibold uppercase tracking-wider text-green-700">Banner de servicio</p><h2 className="text-xl font-semibold text-slate-950">{banner.title}</h2></div></div>
      <label className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold"><input type="checkbox" checked={banner.isActive} onChange={(event) => onChange({ isActive: event.target.checked })} /> Mostrar en la Home</label>
    </header>
    <div className="space-y-7 p-5 sm:p-6">
      <Step number="1" title="Cargá las imágenes"><p className="mt-1 text-sm text-slate-500">El texto comercial debe estar incluido en la imagen. La web no agregará títulos encima. Desktop: 1200 × 500 px · Mobile: 800 × 800 px · JPG, PNG o WebP · máximo 5 MB.</p><div className="mt-4 grid gap-5 lg:grid-cols-2"><SectionBannerUploader layout="service" sectionKey={banner.key} variant="desktop" url={banner.desktopUrl} path={banner.desktopPath} onChange={(image) => onChange({ desktopUrl: image.url, desktopPath: image.path })} /><SectionBannerUploader layout="service" sectionKey={banner.key} variant="mobile" url={banner.mobileUrl} path={banner.mobilePath} onChange={(image) => onChange({ mobileUrl: image.url, mobilePath: image.path })} /></div></Step>
      <Step number="2" title="Revisá el enlace de WhatsApp"><div className="mt-2 flex gap-2"><input value={banner.link} onChange={(event) => onChange({ link: event.target.value })} className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm" /><a href={banner.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold"><ExternalLink className="h-4 w-4" /> Probar</a></div></Step>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">{result ? <p className={`flex items-center gap-2 text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-600'}`}>{result.success ? <CheckCircle2 className="h-4 w-4" /> : null}{result.message}</p> : <span />}<button type="button" onClick={save} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Guardando...' : 'Guardar banner'}</button></div>
    </div>
  </section>;
}

function Step({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <div><div className="flex items-center gap-2"><span className="text-xs font-bold text-green-700">PASO {number}</span><h3 className="font-semibold text-slate-900">{title}</h3></div>{children}</div>; }
