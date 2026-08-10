'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { saveHomeContentAction } from '@/app/admin/(panel)/pagina-inicio/actions';
import { SectionBannerUploader } from './section-banner-uploader';
import { homeContentSchema, type HomeContentValues } from '@/lib/home-content/schema';

const input = 'mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm';

type CategoryOption = { id: string; name: string; slug: string };
type HomeContentFormProps = { initialValues: HomeContentValues; categories?: CategoryOption[] };

export function HomeContentForm({ initialValues, categories = [] }: HomeContentFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const { register, control, handleSubmit, watch, setValue } = useForm<HomeContentValues>({ resolver: zodResolver(homeContentSchema), defaultValues: initialValues });
  const tags = useFieldArray({ control, name: 'tags' });
  const sections = useFieldArray({ control, name: 'sections' });
  const values = watch();

  async function submit(data: HomeContentValues) {
    setSaving(true); setMessage('');
    try { const result = await saveHomeContentAction(data); setMessage(result.message); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.'); }
    finally { setSaving(false); }
  }

  const editableSections = sections.fields.map((field, index) => ({ field, index })).filter(({ index }) => values.sections[index]?.key !== 'hero');

  function addProductSection() {
    const next = sections.fields.length;
    sections.append({
      key: `category-products-${Date.now()}`,
      title: 'Nueva sección de productos',
      sortOrder: next,
      isActive: true,
      sectionType: 'banner-products',
      categorySlug: categories[0]?.slug ?? '',
      bannerDesktopUrl: '', bannerDesktopPath: '', bannerMobileUrl: '', bannerMobilePath: '',
      productLimit: 3,
      showViewAll: true,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-widest text-green-700">Contenido</p><h1 className="mt-2 text-3xl font-semibold">Página de inicio</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Administrá la barra promocional, servicios, productos y el orden de las secciones del Home.</p></div>
        <button type="submit" disabled={saving} className="flex h-11 items-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Guardando...' : 'Guardar cambios'}</button>
      </header>
      {message ? <div role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{message}</div> : null}

      <div className="space-y-6">
        <Box title="Barra promocional">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('promoEnabled')} /> Barra promocional activa</label>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Texto"><input className={input} {...register('promoText')} /></Field><Field label="Icono"><input className={input} {...register('promoIcon')} /></Field><Field label="Enlace"><input className={input} {...register('promoUrl')} /></Field><Field label="Texto del botón"><input className={input} {...register('promoButtonText')} /></Field><Field label="Velocidad"><input type="number" className={input} {...register('promoSpeed', { valueAsNumber: true })} /></Field>
            <div className="flex flex-wrap items-center gap-5 pt-6"><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('promoScroll')} /> Desplazamiento</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('promoNewTab')} /> Nueva pestaña</label></div>
          </div>
        </Box>

        <Box title="Sección de servicios">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('servicesEnabled')} /> Sección activa</label>
          <Field label="Título"><input className={input} {...register('servicesTitle')} /></Field>
          <Field label="Descripción"><textarea className={`${input} h-24 py-2`} {...register('servicesDescription')} /></Field>
          <ArrayEditor title="Etiquetas" fields={tags.fields} add={() => tags.append({ label: 'Nueva etiqueta', icon: 'Leaf', sortOrder: tags.fields.length, isActive: true })}>
            {(field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_180px_100px_auto_auto]"><input className={input} placeholder="Etiqueta" {...register(`tags.${index}.label`)} /><input className={input} placeholder="Icono" {...register(`tags.${index}.icon`)} /><input type="number" className={input} {...register(`tags.${index}.sortOrder`, { valueAsNumber: true })} /><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register(`tags.${index}.isActive`)} /> Activa</label><Delete onClick={() => tags.remove(index)} /></div>}
          </ArrayEditor>
        </Box>

        <Box title="Administración de secciones">
          <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">Activá, ordená y configurá las secciones del Home. También podés crear bloques de categoría con banner + productos.</p><button type="button" onClick={addProductSection} className="inline-flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100"><Plus className="h-4 w-4" /> Agregar sección de productos</button></div>
          <div className="space-y-4">
            {editableSections.map(({ field, index }) => {
              const section = values.sections[index];
              const isBanner = section?.sectionType === 'banner-products';
              return <div key={field.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="grid items-end gap-3 md:grid-cols-[1fr_150px_150px_auto_auto]">
                  <Field label="Título"><input className={input} {...register(`sections.${index}.title`)} /></Field>
                  <Field label="Orden"><input type="number" className={input} {...register(`sections.${index}.sortOrder`, { valueAsNumber: true })} /></Field>
                  <Field label="Diseño"><select className={input} {...register(`sections.${index}.sectionType`)}><option value="standard">Estándar</option><option value="banner-products">Banner + productos</option></select></Field>
                  <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" {...register(`sections.${index}.isActive`)} /> Activa</label>
                  {isBanner ? <Delete onClick={() => sections.remove(index)} /> : <span />}
                </div>
                {isBanner ? <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Categoría"><select className={input} {...register(`sections.${index}.categorySlug`)}><option value="">Seleccionar categoría</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.name}</option>)}</select></Field>
                    <Field label="Cantidad de productos"><select className={input} {...register(`sections.${index}.productLimit`, { valueAsNumber: true })}>{[2,3,4,5,6,7,8].map((n) => <option key={n} value={n}>{n} productos</option>)}</select></Field>
                    <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" {...register(`sections.${index}.showViewAll`)} /> Mostrar “Ver todos”</label>
                  </div>
                  <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <SectionBannerUploader sectionKey={section.key} variant="desktop" url={section.bannerDesktopUrl} path={section.bannerDesktopPath} onChange={(image) => { setValue(`sections.${index}.bannerDesktopUrl`, image.url, { shouldDirty: true }); setValue(`sections.${index}.bannerDesktopPath`, image.path, { shouldDirty: true }); }} />
                    <SectionBannerUploader sectionKey={section.key} variant="mobile" url={section.bannerMobileUrl} path={section.bannerMobilePath} onChange={(image) => { setValue(`sections.${index}.bannerMobileUrl`, image.url, { shouldDirty: true }); setValue(`sections.${index}.bannerMobilePath`, image.path, { shouldDirty: true }); }} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Desktop: banner vertical al costado de los productos. Mobile: banner horizontal encima de los productos.</p>
                </div> : null}
              </div>;
            })}
          </div>
        </Box>

        <Box title="Vista previa del contenido"><div className="overflow-hidden rounded-xl border bg-white">{values.promoEnabled ? <div className="bg-green-50 p-2 text-center text-xs text-green-900">{values.promoIcon} {values.promoText}</div> : null}{values.servicesEnabled ? <div className="p-5"><Eye className="h-5 w-5 text-green-700" /><h3 className="mt-5 font-semibold">{values.servicesTitle}</h3><p className="mt-1 text-sm text-slate-500">{values.servicesDescription}</p></div> : null}</div></Box>
      </div>
    </form>
  );
}

function Box({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4 space-y-4">{children}</div></section>; }
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block text-sm text-slate-700"><span className="font-medium">{label}</span>{children}</label>; }
function ArrayEditor({ title, fields, add, children }: { title: string; fields: { id: string }[]; add: () => void; children: (field: { id: string }, index: number) => ReactNode }) { return <div><div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-semibold">{title}</h3><button type="button" onClick={add} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"><Plus className="h-4 w-4" /> Agregar</button></div><div className="space-y-3">{fields.map(children)}</div></div>; }
function Delete({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} aria-label="Eliminar" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>; }
