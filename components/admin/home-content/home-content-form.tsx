'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, Plus, Save, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { saveHomeContentAction } from "@/app/admin/(panel)/pagina-inicio/actions";
import { createClient } from "@/lib/supabase/client";
import { HomeHero } from "@/sections/home-hero";
import {
  homeContentSchema,
  type HomeContentValues,
} from "@/lib/home-content/schema";
const input =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm";
function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}
export function HomeContentForm({
  initialValues,
  categories,
  products,
}: {
  initialValues: HomeContentValues;
  categories: { id: string; name: string }[];
  products: { id: string; name: string }[];
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState<"desktop" | "mobile">("desktop");
  const { register, control, handleSubmit, watch, setValue } =
    useForm<HomeContentValues>({
      resolver: zodResolver(homeContentSchema),
      defaultValues: initialValues,
    });
  const nav = useFieldArray({ control, name: "navigation" }),
    tags = useFieldArray({ control, name: "tags" }),
    columns = useFieldArray({ control, name: "megaColumns" }),
    services = useFieldArray({ control, name: "megaServices" }),
    buttons = useFieldArray({ control, name: "buttons" }),
    sections = useFieldArray({ control, name: "sections" });
  async function submit(v: HomeContentValues) {
    setSaving(true);
    const result = await saveHomeContentAction(v);
    setSaving(false);
    setMessage(result.message);
  }
  const values = watch();
  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
            Contenido
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Página de inicio</h1>
        </div>
        <button
          disabled={saving}
          className="flex h-11 items-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar cambios
        </button>
      </header>
      {message && (
        <div
          role="status"
          className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800"
        >
          {message}
        </div>
      )}
      <div className="space-y-6">
        <Box title="Barra promocional">
          <label>
            <input type="checkbox" {...register("promoEnabled")} /> Activa
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Texto
              <input className={input} {...register("promoText")} />
            </label>
            <label>
              Icono
              <input className={input} {...register("promoIcon")} />
            </label>
            <label>
              Enlace
              <input className={input} {...register("promoUrl")} />
            </label>
            <label>
              Texto del botón
              <input className={input} {...register("promoButtonText")} />
            </label>
            <label>
              Velocidad
              <input
                type="number"
                className={input}
                {...register("promoSpeed", { valueAsNumber: true })}
              />
            </label>
            <div className="flex gap-5">
              <label>
                <input type="checkbox" {...register("promoScroll")} />{" "}
                Desplazamiento
              </label>
              <label>
                <input type="checkbox" {...register("promoNewTab")} /> Nueva
                pestaña
              </label>
            </div>
          </div>
        </Box>
        <Box title="Encabezado y logo">
          <div className="flex gap-5">
            <label>
              <input type="checkbox" {...register("logoEnabled")} /> Mostrar
              logo
            </label>
            <label>
              <input type="checkbox" {...register("whatsappEnabled")} />{" "}
              WhatsApp
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label>
              Logo desktop
              <input className={input} {...register("logoDesktopUrl")} />
            </label>
            <label>
              Logo mobile
              <input className={input} {...register("logoMobileUrl")} />
            </label>
            <label>
              Texto alternativo
              <input className={input} {...register("logoAlt")} />
            </label>
          </div>
          <ArrayEditor
            title="Navegación"
            fields={nav.fields}
            add={() =>
              nav.append({
                name: "Nuevo enlace",
                url: "/",
                sortOrder: nav.fields.length,
                isActive: true,
              })
            }
            remove={nav.remove}
          >
            {(field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-xl border p-3 md:grid-cols-5"
              >
                <input
                  className={input}
                  {...register(`navigation.${index}.name`)}
                />
                <input
                  className={input}
                  {...register(`navigation.${index}.url`)}
                />
                <input
                  type="number"
                  className={input}
                  {...register(`navigation.${index}.sortOrder`, {
                    valueAsNumber: true,
                  })}
                />
                <label>
                  <input
                    type="checkbox"
                    {...register(`navigation.${index}.isActive`)}
                  />{" "}
                  Activo
                </label>
                <Delete onClick={() => nav.remove(index)} />
              </div>
            )}
          </ArrayEditor>
        </Box>
        <Box title="Portada principal">
          <div className="grid gap-5 lg:grid-cols-2">
            <HeroImageUploader
              label="Imagen Desktop"
              recommendation="Recomendado: 1600 × 700 px, JPG, PNG o WebP."
              url={values.heroDesktopUrl}
              storagePath={values.heroDesktopPath}
              onChange={(url, path) => {
                setValue("heroDesktopUrl", url, { shouldDirty: true });
                setValue("heroDesktopPath", path, { shouldDirty: true });
              }}
            />
            <HeroImageUploader
              label="Imagen Mobile"
              recommendation="Recomendado: 800 × 1000 px, JPG, PNG o WebP."
              url={values.heroMobileUrl}
              storagePath={values.heroMobilePath}
              onChange={(url, path) => {
                setValue("heroMobileUrl", url, { shouldDirty: true });
                setValue("heroMobilePath", path, { shouldDirty: true });
              }}
            />
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Intensidad de sombra: {values.heroShadowIntensity}%
            <input
              type="range"
              min="0"
              max="100"
              className="mt-2 w-full accent-green-700"
              {...register("heroShadowIntensity", { valueAsNumber: true })}
            />
          </label>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="font-semibold text-slate-950">
              Contenido sobre el banner
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Elegí qué información se muestra encima de la fotografía.
            </p>
            <div className="mt-4 space-y-3">
              <Toggle
                label="Mostrar contenido sobre el banner"
                registration={register("heroContentEnabled")}
                checked={values.heroContentEnabled}
              />
              <div
                className={`grid gap-3 border-t pt-4 sm:grid-cols-2 ${values.heroContentEnabled ? "" : "pointer-events-none opacity-45"}`}
                aria-disabled={!values.heroContentEnabled}
              >
                <Toggle
                  label="Mostrar en Desktop"
                  registration={register("heroContentDesktop")}
                  checked={values.heroContentDesktop}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar en Mobile"
                  registration={register("heroContentMobile")}
                  checked={values.heroContentMobile}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar etiqueta"
                  registration={register("heroShowLabel")}
                  checked={values.heroShowLabel}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar título"
                  registration={register("heroShowTitle")}
                  checked={values.heroShowTitle}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar subtítulo"
                  registration={register("heroShowSubtitle")}
                  checked={values.heroShowSubtitle}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar descripción"
                  registration={register("heroShowDescription")}
                  checked={values.heroShowDescription}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar precio"
                  registration={register("heroShowPrice")}
                  checked={values.heroShowPrice}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label={"Mostrar “Instalación incluida”"}
                  registration={register("heroShowInstallationBadge")}
                  checked={values.heroShowInstallationBadge}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar botón principal"
                  registration={register("heroShowPrimaryButton")}
                  checked={values.heroShowPrimaryButton}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar botón secundario"
                  registration={register("heroShowSecondaryButton")}
                  checked={values.heroShowSecondaryButton}
                  disabled={!values.heroContentEnabled}
                />
                <Toggle
                  label="Mostrar beneficios"
                  registration={register("heroShowBenefits")}
                  checked={values.heroShowBenefits}
                  disabled={!values.heroContentEnabled}
                />
              </div>
            </div>
          </div>
        </Box>
        <Box title="Sección de servicios">
          <label>
            <input type="checkbox" {...register("servicesEnabled")} /> Sección
            activa
          </label>
          <label>
            Título
            <input className={input} {...register("servicesTitle")} />
          </label>
          <label>
            Descripción
            <textarea
              className={`${input} h-24 py-2`}
              {...register("servicesDescription")}
            />
          </label>
          <ArrayEditor
            title="Etiquetas"
            fields={tags.fields}
            add={() =>
              tags.append({
                label: "Nueva etiqueta",
                sortOrder: tags.fields.length,
                isActive: true,
              })
            }
            remove={tags.remove}
          >
            {(field, index) => (
              <div key={field.id} className="flex gap-2">
                <input className={input} {...register(`tags.${index}.label`)} />
                <input
                  type="number"
                  className={`${input} w-24`}
                  {...register(`tags.${index}.sortOrder`, {
                    valueAsNumber: true,
                  })}
                />
                <label>
                  <input
                    type="checkbox"
                    {...register(`tags.${index}.isActive`)}
                  />{" "}
                  Activa
                </label>
                <Delete onClick={() => tags.remove(index)} />
              </div>
            )}
          </ArrayEditor>
        </Box>
        <Box title="Mega menú">
          <label>
            <input type="checkbox" {...register("megaMenuEnabled")} /> Activo
          </label>
          <ArrayEditor
            title="Columnas"
            fields={columns.fields}
            add={() =>
              columns.append({
                title: "Columna",
                icon: "Leaf",
                categoryId: "",
                viewAllLabel: "Ver toda la categoría",
                viewAllUrl: "/shop",
                sortOrder: columns.fields.length,
                isActive: true,
                productIds: [],
              })
            }
            remove={columns.remove}
          >
            {(field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-xl border p-3 md:grid-cols-3"
              >
                <input
                  className={input}
                  {...register(`megaColumns.${index}.title`)}
                />
                <input
                  className={input}
                  {...register(`megaColumns.${index}.icon`)}
                />
                <select
                  className={input}
                  {...register(`megaColumns.${index}.categoryId`)}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <input
                  className={input}
                  {...register(`megaColumns.${index}.viewAllLabel`)}
                />
                <input
                  className={input}
                  {...register(`megaColumns.${index}.viewAllUrl`)}
                />
                <select
                  multiple
                  className="min-h-24 rounded-lg border p-2 text-sm"
                  {...register(`megaColumns.${index}.productIds`)}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <label>
                  <input
                    type="checkbox"
                    {...register(`megaColumns.${index}.isActive`)}
                  />{" "}
                  Activa
                </label>
                <Delete onClick={() => columns.remove(index)} />
              </div>
            )}
          </ArrayEditor>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              Título de servicios
              <input className={input} {...register("megaServicesTitle")} />
            </label>
            <label>
              Descripción
              <input
                className={input}
                {...register("megaServicesDescription")}
              />
            </label>
          </div>
          <ArrayEditor
            title="Servicios de la columna derecha"
            fields={services.fields}
            add={() =>
              services.append({
                title: "Servicio",
                description: "",
                icon: "Leaf",
                url: "/trabajos",
                sortOrder: services.fields.length,
                isActive: true,
              })
            }
            remove={services.remove}
          >
            {(field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-xl border p-3 md:grid-cols-3"
              >
                <input
                  className={input}
                  {...register(`megaServices.${index}.title`)}
                />
                <input
                  className={input}
                  {...register(`megaServices.${index}.description`)}
                />
                <input
                  className={input}
                  {...register(`megaServices.${index}.icon`)}
                />
                <input
                  className={input}
                  {...register(`megaServices.${index}.url`)}
                />
                <input
                  type="number"
                  className={input}
                  {...register(`megaServices.${index}.sortOrder`, {
                    valueAsNumber: true,
                  })}
                />
                <Delete onClick={() => services.remove(index)} />
              </div>
            )}
          </ArrayEditor>
        </Box>
        <Box title="Botones globales">
          <ArrayEditor
            title="Botones"
            fields={buttons.fields}
            add={() =>
              buttons.append({
                placement: "custom",
                text: "Nuevo botón",
                url: "/",
                linkType: "internal",
                icon: "",
                variant: "primary",
                sortOrder: buttons.fields.length,
                isActive: true,
                newTab: false,
              })
            }
            remove={buttons.remove}
          >
            {(field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-xl border p-3 md:grid-cols-4"
              >
                <input
                  className={input}
                  {...register(`buttons.${index}.text`)}
                />
                <input
                  className={input}
                  {...register(`buttons.${index}.url`)}
                />
                <select
                  className={input}
                  {...register(`buttons.${index}.linkType`)}
                >
                  <option value="internal">Interno</option>
                  <option value="external">Externo</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="anchor">Ancla</option>
                </select>
                <input
                  className={input}
                  {...register(`buttons.${index}.icon`)}
                />
                <input
                  className={input}
                  {...register(`buttons.${index}.variant`)}
                />
                <input
                  className={input}
                  {...register(`buttons.${index}.placement`)}
                />
                <label>
                  <input
                    type="checkbox"
                    {...register(`buttons.${index}.isActive`)}
                  />{" "}
                  Activo
                </label>
                <label>
                  <input
                    type="checkbox"
                    {...register(`buttons.${index}.newTab`)}
                  />{" "}
                  Nueva pestaña
                </label>
                <Delete onClick={() => buttons.remove(index)} />
              </div>
            )}
          </ArrayEditor>
        </Box>
        <Box title="Administración de secciones">
          <div className="space-y-2">
            {sections.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-2 rounded-xl border p-3 md:grid-cols-4"
              >
                <input
                  className={input}
                  {...register(`sections.${index}.title`)}
                />
                <input
                  type="number"
                  className={input}
                  {...register(`sections.${index}.sortOrder`, {
                    valueAsNumber: true,
                  })}
                />
                <label>
                  <input
                    type="checkbox"
                    {...register(`sections.${index}.isActive`)}
                  />{" "}
                  Activa
                </label>
                <span className="text-xs text-slate-400">
                  {values.sections[index]?.key}
                </span>
              </div>
            ))}
          </div>
        </Box>
        <Box title="Vista previa">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreview("desktop")}
              className="rounded-lg border px-3 py-2"
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setPreview("mobile")}
              className="rounded-lg border px-3 py-2"
            >
              Mobile
            </button>
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-xl border bg-white ${preview === "mobile" ? "max-w-sm" : "w-full"}`}
          >
            <div className="bg-green-50 p-2 text-center text-xs">
              {values.promoIcon} {values.promoText}
            </div>
            <HomeHero content={values} previewViewport={preview} />
          </div>
        </Box>
      </div>
    </form>
  );
}
function ArrayEditor({
  title,
  fields,
  add,
  children,
}: {
  title: string;
  fields: { id: string }[];
  add: () => void;
  remove: (index: number) => void;
  children: (field: { id: string }, index: number) => React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-sm text-green-700"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>
      <div className="space-y-2">{fields.map(children)}</div>
    </div>
  );
}
function Delete({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-red-600">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function Toggle({
  label,
  registration,
  checked,
  disabled = false,
}: {
  label: string;
  registration: UseFormRegisterReturn;
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200">
      <span>{label}</span>
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          aria-disabled={disabled}
          {...registration}
        />
        <span
          aria-hidden="true"
          className={`h-6 w-11 rounded-full transition ${checked ? "bg-green-700" : "bg-slate-300"}`}
        />
        <span
          aria-hidden="true"
          className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`}
        />
      </span>
    </label>
  );
}

function HeroImageUploader({
  label,
  recommendation,
  url,
  storagePath,
  onChange,
}: {
  label: string;
  recommendation: string;
  url: string;
  storagePath: string;
  onChange: (url: string, path: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fallback = label.includes("Mobile")
    ? "/images/banners/slide-2-mobile.webp"
    : "/images/banners/slide-2-desktop.webp";

  async function upload(file: File) {
    setUploading(true);
    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const path = `home/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from("hero-images")
      .upload(path, file, { upsert: false });
    if (!error) {
      if (storagePath) {
        await supabase.storage.from("hero-images").remove([storagePath]);
      }
      const { data } = supabase.storage.from("hero-images").getPublicUrl(path);
      onChange(data.publicUrl, path);
    }
    setUploading(false);
  }

  async function remove() {
    if (storagePath) {
      await createClient().storage.from("hero-images").remove([storagePath]);
    }
    onChange(fallback, "");
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-1 text-xs text-slate-500">{recommendation}</p>
      <div className="relative mt-3 aspect-[16/7] overflow-hidden rounded-xl bg-slate-100">
        <Image
          src={url || fallback}
          alt={`Vista previa de ${label}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="mt-3 flex gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {storagePath ? "Reemplazar" : "Subir imagen"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        </label>
        {storagePath && (
          <button
            type="button"
            onClick={() => void remove()}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
}
