"use client";
import {
  Copy,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  createHeroSlideAction,
  deleteHeroSlideAction,
  reorderHeroSlidesAction,
  saveHeroCarouselSettingsAction,
  updateHeroSlideAction,
} from "@/app/admin/(panel)/pagina-inicio/actions";
import type {
  HeroCarouselSettings,
  HeroSlide,
} from "@/lib/home-content/hero-schema";
import { heroSlideSchema } from "@/lib/home-content/hero-schema";
import { HomeHeroCarousel } from "@/sections/home-hero-carousel";
import { HeroImageUploader } from "./hero-image-uploader";

type Props = {
  initialSlides: HeroSlide[];
  initialSettings: HeroCarouselSettings;
};
const field =
  "mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm";
function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-green-700"
      />
    </label>
  );
}
function newSlide(sortOrder: number): HeroSlide {
  return {
    id: crypto.randomUUID(),
    name: "Nueva diapositiva",
    isActive: true,
    sortOrder,
    desktopUrl: "",
    desktopPath: "",
    mobileUrl: "",
    mobilePath: "",
    altText: "Portal Verde",
    contentEnabled: true,
    contentDesktop: true,
    contentMobile: true,
    showLabel: false,
    label: "",
    showTitle: true,
    title: "Nueva diapositiva",
    showSubtitle: false,
    subtitle: "",
    showDescription: false,
    description: "",
    showPrice: false,
    priceText: "",
    showInstallationBadge: false,
    installationBadgeText: "",
    showPrimaryButton: false,
    primaryButtonText: "",
    primaryButtonUrl: "",
    primaryButtonNewTab: false,
    showSecondaryButton: false,
    secondaryButtonText: "",
    secondaryButtonUrl: "",
    secondaryButtonNewTab: false,
    showBenefits: false,
    benefits: [],
    alignment: "left",
    overlayEnabled: true,
    overlayIntensity: 60,
  };
}
export function HeroCarouselEditor({ initialSlides, initialSettings }: Props) {
  const [slides, setSlides] = useState(() =>
    [...initialSlides].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [selected, setSelected] = useState(initialSlides[0]?.id ?? "");
  const [draft, setDraft] = useState<HeroSlide | undefined>(
    initialSlides.find((s) => s.id === selected),
  );
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [play, setPlay] = useState(false);
  const current = useMemo(
    () => draft ?? slides.find((s) => s.id === selected),
    [draft, slides, selected],
  );
  function choose(slide: HeroSlide) {
    setSelected(slide.id);
    setDraft({ ...slide, benefits: [...slide.benefits] });
    setMessage("");
  }
  function patch(values: Partial<HeroSlide>) {
    if (current) setDraft({ ...current, ...values });
  }
  async function save() {
    if (!current) return;
    const parsed = heroSlideSchema.safeParse(current);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Revisá los campos.");
      return;
    }
    setBusy(true);
    const result = await updateHeroSlideAction(parsed.data);
    setBusy(false);
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
    if (result.success)
      setSlides((v) =>
        v
          .map((s) => (s.id === current.id ? parsed.data : s))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
  }
  async function add() {
    const slide = newSlide(slides.length);
    setBusy(true);
    const result = await createHeroSlideAction(slide);
    setBusy(false);
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
    if (result.success) {
      setSlides((v) => [...v, slide]);
      choose(slide);
    }
  }
  async function duplicate() {
    if (!current) return;
    const copy = {
      ...current,
      id: crypto.randomUUID(),
      name: `${current.name} Copia`,
      sortOrder: current.sortOrder + 1,
      benefits: [...current.benefits],
    };
    const shifted = slides.map((s) =>
      s.sortOrder > current.sortOrder
        ? { ...s, sortOrder: s.sortOrder + 1 }
        : s,
    );
    setBusy(true);
    const result = await createHeroSlideAction(copy);
    if (result.success) {
      await reorderHeroSlidesAction(
        shifted.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
      );
      setSlides([...shifted, copy].sort((a, b) => a.sortOrder - b.sortOrder));
      choose(copy);
    }
    setBusy(false);
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
  }
  async function remove() {
    if (!current || !window.confirm("¿Eliminar esta diapositiva?")) return;
    if (
      slides.filter((s) => s.isActive).length === 1 &&
      !window.confirm(
        "Es la única diapositiva activa. El carrusel quedará sin diapositivas activas. ¿Continuar?",
      )
    )
      return;
    setBusy(true);
    const result = await deleteHeroSlideAction(current.id);
    setBusy(false);
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
    if (result.success) {
      const next = slides.filter((s) => s.id !== current.id);
      setSlides(next);
      if (next[0]) choose(next[0]);
      else {
        setSelected("");
        setDraft(undefined);
      }
    }
  }
  async function move(index: number, direction: number) {
    const target = index + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((s, i) => ({ ...s, sortOrder: i }));
    setSlides(ordered);
    if (current) setDraft(ordered.find((s) => s.id === current.id));
    const result = await reorderHeroSlidesAction(
      ordered.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
    );
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
  }
  async function saveSettings() {
    setBusy(true);
    const result = await saveHeroCarouselSettingsAction(settings);
    setBusy(false);
    setMessage(
      result.message ??
        (result.success
          ? "Cambios guardados."
          : "No se pudieron guardar los cambios."),
    );
  }
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Carrusel principal</h2>
          <p className="text-sm text-slate-500">
            Administrá la portada como una colección ordenada de diapositivas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void add()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          Agregar diapositiva
        </button>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside>
          <h3 className="mb-2 font-semibold">Diapositivas</h3>
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`rounded-xl border p-3 ${selected === slide.id ? "border-green-600 bg-green-50" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => choose(slide)}
                  className="flex w-full items-center gap-2 text-left"
                >
                  <GripVertical className="h-4 w-4 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {index + 1}. {slide.name}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${slide.isActive ? "bg-green-600" : "bg-slate-300"}`}
                  />
                </button>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Orden: {slide.sortOrder + 1}
                  </span>
                  <span>
                    <button
                      type="button"
                      aria-label="Subir"
                      onClick={() => void move(index, -1)}
                      className="p-1"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar"
                      onClick={() => void move(index, 1)}
                      className="p-1"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <div className="space-y-5">
          <div className="rounded-xl border bg-slate-50 p-4">
            <h3 className="font-semibold">Configuración</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Switch
                label="Carrusel activo"
                checked={settings.carouselEnabled}
                onChange={(v) =>
                  setSettings({ ...settings, carouselEnabled: v })
                }
              />
              <Switch
                label="Cambio automático"
                checked={settings.carouselAutoplay}
                onChange={(v) =>
                  setSettings({ ...settings, carouselAutoplay: v })
                }
              />
              <label className="text-sm">
                Cambiar cada (segundos)
                <input
                  className={field}
                  type="number"
                  min={3}
                  max={30}
                  value={settings.carouselInterval / 1000}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      carouselInterval: Number(e.target.value) * 1000,
                    })
                  }
                />
              </label>
              <Switch
                label="Permitir navegación manual"
                checked={settings.carouselManualNavigation}
                onChange={(v) =>
                  setSettings({ ...settings, carouselManualNavigation: v })
                }
              />
              <Switch
                label="Mostrar flechas"
                checked={settings.carouselShowArrows}
                onChange={(v) =>
                  setSettings({ ...settings, carouselShowArrows: v })
                }
              />
              <Switch
                label="Mostrar indicadores"
                checked={settings.carouselShowDots}
                onChange={(v) =>
                  setSettings({ ...settings, carouselShowDots: v })
                }
              />
              <Switch
                label="Pausar al pasar el cursor"
                checked={settings.carouselPauseOnHover}
                onChange={(v) =>
                  setSettings({ ...settings, carouselPauseOnHover: v })
                }
              />
              <Switch
                label="Repetir carrusel"
                checked={settings.carouselLoop}
                onChange={(v) => setSettings({ ...settings, carouselLoop: v })}
              />
            </div>
            <button
              type="button"
              onClick={() => void saveSettings()}
              disabled={busy}
              className="mt-3 rounded-lg border border-green-700 px-3 py-2 text-sm font-semibold text-green-700"
            >
              Guardar configuración
            </button>
          </div>
          {current ? (
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Editar diapositiva</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void duplicate()}
                    className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                  >
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  Nombre interno
                  <input
                    className={field}
                    value={current.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  Orden
                  <input
                    className={field}
                    type="number"
                    min={0}
                    value={current.sortOrder}
                    onChange={(e) =>
                      patch({ sortOrder: Number(e.target.value) })
                    }
                  />
                </label>
                <Switch
                  label="Diapositiva activa"
                  checked={current.isActive}
                  onChange={(v) => patch({ isActive: v })}
                />
                <label className="text-sm">
                  Texto alternativo
                  <input
                    className={field}
                    value={current.altText}
                    onChange={(e) => patch({ altText: e.target.value })}
                  />
                </label>
              </div>
              <div className="grid gap-3 xl:grid-cols-2">
                <HeroImageUploader
                  slideId={current.id}
                  variant="desktop"
                  url={current.desktopUrl}
                  path={current.desktopPath}
                  onChange={(desktopUrl, desktopPath) =>
                    patch({ desktopUrl, desktopPath })
                  }
                />
                <HeroImageUploader
                  slideId={current.id}
                  variant="mobile"
                  url={current.mobileUrl}
                  path={current.mobilePath}
                  onChange={(mobileUrl, mobilePath) =>
                    patch({ mobileUrl, mobilePath })
                  }
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <Switch
                  label="Mostrar contenido"
                  checked={current.contentEnabled}
                  onChange={(v) => patch({ contentEnabled: v })}
                />
                <Switch
                  label="Contenido Desktop"
                  checked={current.contentDesktop}
                  onChange={(v) => patch({ contentDesktop: v })}
                />
                <Switch
                  label="Contenido Mobile"
                  checked={current.contentMobile}
                  onChange={(v) => patch({ contentMobile: v })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ["showLabel", "label", "Etiqueta"],
                    ["showTitle", "title", "Título"],
                    ["showSubtitle", "subtitle", "Subtítulo"],
                    ["showDescription", "description", "Descripción"],
                    ["showPrice", "priceText", "Precio"],
                    [
                      "showInstallationBadge",
                      "installationBadgeText",
                      "Instalación incluida",
                    ],
                  ] as const
                ).map(([show, key, label]) => (
                  <div key={key}>
                    <Switch
                      label={`Mostrar ${label.toLowerCase()}`}
                      checked={current[show]}
                      onChange={(v) => patch({ [show]: v })}
                    />
                    <input
                      className={field}
                      value={current[key]}
                      onChange={(e) => patch({ [key]: e.target.value })}
                      placeholder={label}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    [
                      "showPrimaryButton",
                      "primaryButtonText",
                      "primaryButtonUrl",
                      "primaryButtonNewTab",
                      "Botón principal",
                    ],
                    [
                      "showSecondaryButton",
                      "secondaryButtonText",
                      "secondaryButtonUrl",
                      "secondaryButtonNewTab",
                      "Botón secundario",
                    ],
                  ] as const
                ).map(([show, textKey, urlKey, tabKey, label]) => (
                  <div key={show} className="space-y-2 rounded-lg border p-3">
                    <Switch
                      label={`Mostrar ${label.toLowerCase()}`}
                      checked={current[show]}
                      onChange={(v) => patch({ [show]: v })}
                    />
                    <input
                      className={field}
                      value={current[textKey]}
                      onChange={(e) => patch({ [textKey]: e.target.value })}
                      placeholder="Texto"
                    />
                    <input
                      className={field}
                      value={current[urlKey]}
                      onChange={(e) => patch({ [urlKey]: e.target.value })}
                      placeholder="Enlace"
                    />
                    <Switch
                      label="Abrir en nueva pestaña"
                      checked={current[tabKey]}
                      onChange={(v) => patch({ [tabKey]: v })}
                    />
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Switch
                    label="Mostrar beneficios"
                    checked={current.showBenefits}
                    onChange={(v) => patch({ showBenefits: v })}
                  />
                  <textarea
                    className="mt-2 min-h-24 w-full rounded-lg border p-3 text-sm"
                    value={current.benefits.join("\n")}
                    onChange={(e) =>
                      patch({
                        benefits: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    placeholder="Un beneficio por línea"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">
                    Alineación
                    <select
                      className={field}
                      value={current.alignment}
                      onChange={(e) =>
                        patch({
                          alignment: e.target.value as HeroSlide["alignment"],
                        })
                      }
                    >
                      <option value="left">Izquierda</option>
                      <option value="center">Centro</option>
                      <option value="right">Derecha</option>
                    </select>
                  </label>
                  <Switch
                    label="Mostrar sombra"
                    checked={current.overlayEnabled}
                    onChange={(v) => patch({ overlayEnabled: v })}
                  />
                  <label className="text-sm">
                    Intensidad: {current.overlayIntensity}%
                    <input
                      type="range"
                      min={0}
                      max={90}
                      value={current.overlayIntensity}
                      onChange={(e) =>
                        patch({ overlayIntensity: Number(e.target.value) })
                      }
                      className="w-full accent-green-700"
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Guardar diapositiva
                </button>
              </div>
            </div>
          ) : (
            <p className="rounded-xl border p-6 text-center text-sm text-slate-500">
              Agregá una diapositiva para comenzar.
            </p>
          )}
          <div className="rounded-xl border p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setViewport("desktop")}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setViewport("mobile")}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Mobile
              </button>
              <button
                type="button"
                onClick={() => setPlay((v) => !v)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                {play ? "Ver seleccionada" : "Reproducir carrusel"}
              </button>
            </div>
            <div className={viewport === "mobile" ? "mx-auto max-w-sm" : ""}>
              {play ? (
                <HomeHeroCarousel
                  slides={slides}
                  settings={settings}
                  previewViewport={viewport}
                />
              ) : (
                current && (
                  <HomeHeroCarousel
                    slides={[{ ...current, isActive: true }]}
                    settings={{ ...settings, carouselEnabled: true }}
                    previewViewport={viewport}
                  />
                )
              )}
            </div>
          </div>
          {message && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
