'use client';

import Link from 'next/link';
import { AtSign, ChevronDown, Clock3, Mail, MapPin, Phone, Share2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { createWhatsAppUrl, siteConfig } from '@/lib/site-config';
import { WhatsAppIcon } from '@/components/icons';

const whatsappUrl = createWhatsAppUrl(
  'Hola, equipo de Portal Verde. Estoy visitando su página web y quisiera recibir asesoramiento sobre sus productos y servicios. ¿Podrían ayudarme? Gracias.'
);

type FooterSection = 'navigation' | 'services' | 'contact';

const NavigationLinks = () => (
  <ul className="space-y-3 text-sm text-white/70">
    <li><Link href="/">Inicio</Link></li>
    <li><Link href="/shop">Catálogo</Link></li>
    <li><Link href="/trabajos">Trabajos realizados</Link></li>
    <li><Link href="/cart">Mi presupuesto</Link></li>
  </ul>
);

const Services = () => (
  <ul className="space-y-3 text-sm text-white/70">
    {['Paisajismo','Mantenimiento de jardín','Mantenimiento de piscina','Riego automático','Visita técnica'].map((service) => <li key={service}><a href={createWhatsAppUrl(`Hola, quiero consultar por el servicio de ${service}.`)} target="_blank" rel="noopener noreferrer">{service}</a></li>)}
  </ul>
);

const Contact = () => (
  <ul className="space-y-4 text-sm text-white/70">
    <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />{siteConfig.contact.coverage}</li>
    <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /><a href={`tel:${siteConfig.contact.phoneRaw}`}>{siteConfig.contact.phoneDisplay}</a></li>
    <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /><a href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a></li>
    <li className="flex items-start gap-3"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />{siteConfig.contact.schedule}</li>
  </ul>
);

export function Footer() {
  const [openSection, setOpenSection] = useState<FooterSection | null>(null);
  const toggleSection = (section: FooterSection) => setOpenSection((current) => current === section ? null : section);

  return (
    <footer className="mt-10 bg-brand-950 text-white">
      <div className="container-shell pt-6 sm:pt-10">
        <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 sm:rounded-3xl sm:px-8 sm:py-9 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-200 sm:text-xs">¿Necesitás ayuda?</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight sm:mt-2 sm:text-3xl">Te ayudamos a elegir la mejor solución para tu espacio</h2>
            <p className="mt-2 text-xs leading-5 text-white/65 sm:mt-3 sm:text-base sm:leading-6">Nuestro equipo puede orientarte sobre productos, cantidades e instalación.</p>
          </div>
          <div className="mt-4 grid gap-2 sm:mt-6 sm:flex sm:flex-row lg:mt-0 lg:shrink-0">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white transition hover:bg-[#20bd5a]"><WhatsAppIcon className="h-4 w-4" />Hablar con un asesor</a>
            <Link href="/cart" className="hidden min-h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-950 sm:inline-flex">Ver mi presupuesto</Link>
          </div>
        </section>
      </div>

      <div className="container-shell py-8 md:hidden">
        <div className="inline-flex rounded-xl bg-white px-3 py-2"><Logo /></div>
        <p className="mt-3 max-w-xs text-xs leading-5 text-white/60">Productos, instalación y soluciones para jardines y espacios verdes.</p>
        <div className="mt-4 flex items-center gap-2">
          <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Portal Verde" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5"><AtSign className="h-4 w-4" /></a>
          <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de Portal Verde" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5"><Share2 className="h-4 w-4" /></a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366]"><WhatsAppIcon className="h-4 w-4" /></a>
        </div>
        <div className="mt-7 divide-y divide-white/10 border-y border-white/10">
          {([['navigation','Navegación',<NavigationLinks key="nav" />],['services','Servicios',<Services key="services" />],['contact','Contacto',<Contact key="contact" />]] as const).map(([id,label,content]) => (
            <div key={id}><button type="button" onClick={() => toggleSection(id)} className="flex w-full items-center justify-between py-4 text-left"><span className="text-sm font-semibold">{label}</span><ChevronDown className={cn('h-4 w-4 transition', openSection === id && 'rotate-180')} /></button><div className={cn('grid overflow-hidden transition-all duration-300', openSection === id ? 'grid-rows-[1fr] pb-4' : 'grid-rows-[0fr]')}><div className="min-h-0">{content}</div></div></div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 text-[11px] text-white/55">
          {['Atención personalizada','Presupuestos claros','Instalación profesional'].map((text) => <p key={text} className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-brand-300" />{text}</p>)}
        </div>
      </div>

      <div className="container-shell hidden gap-10 py-14 md:grid md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div><div className="inline-flex rounded-2xl bg-white px-3 py-2"><Logo /></div><p className="mt-4 max-w-sm text-sm leading-6 text-white/65">Productos, instalación, mantenimiento y soluciones para transformar jardines y espacios verdes.</p><div className="mt-5 flex items-center gap-2"><a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram de Portal Verde" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"><AtSign className="h-4 w-4" /></a><a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook de Portal Verde" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5"><Share2 className="h-4 w-4" /></a><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]"><WhatsAppIcon className="h-4 w-4" /></a></div></div>
        <div><h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Navegación</h3><div className="mt-4"><NavigationLinks /></div></div>
        <div><h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Servicios</h3><div className="mt-4"><Services /></div></div>
        <div><h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">Contacto</h3><div className="mt-4"><Contact /></div></div>
      </div>

      <div className="border-t border-white/10"><div className="container-shell flex flex-col gap-3 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"><p>© {new Date().getFullYear()} Portal Verde. Todos los derechos reservados.</p><a href="https://www.equantum.com.py/" target="_blank" rel="noopener noreferrer" className="transition hover:text-white/70">Desarrollado por eQuantum</a></div><div className="flex flex-wrap gap-x-4 gap-y-2"><Link href="/terminos">Términos</Link><Link href="/privacidad">Privacidad</Link><Link href="/cookies">Cookies</Link></div></div></div>
    </footer>
  );
}
