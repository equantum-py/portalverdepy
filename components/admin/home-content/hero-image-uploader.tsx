"use client";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  slideId: string;
  variant: "desktop" | "mobile";
  url: string;
  path: string;
  onChange: (url: string, path: string) => void;
};
export function HeroImageUploader({
  slideId,
  variant,
  url,
  path,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const desktop = variant === "desktop";
  const label = desktop ? "Imagen Desktop" : "Imagen Mobile";
  const size = desktop ? "1920 × 650" : "750 × 507";
  async function upload(file: File) {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Usá una imagen JPG, PNG o WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB.");
      return;
    }
    setLoading(true);
    const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
    const nextPath = `hero-slides/${slideId}/${variant}/${crypto.randomUUID()}.${extension}`;
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from("home-content-images")
      .upload(nextPath, file);
    if (uploadError) setError(uploadError.message);
    else {
      const { data } = supabase.storage
        .from("home-content-images")
        .getPublicUrl(nextPath);
      onChange(data.publicUrl, nextPath);
    }
    setLoading(false);
  }
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="font-medium">{label}</p>
      <p className="text-xs text-slate-500">
        Tamaño recomendado: {size} px · JPG, PNG o WebP · máximo 5 MB
      </p>
      <div
        className={`relative mt-2 overflow-hidden rounded-lg bg-slate-100 ${desktop ? "aspect-[1920/650]" : "aspect-[750/507]"}`}
      >
        {url ? (
          <Image
            src={url}
            alt={`Vista previa ${label}`}
            fill
            unoptimized
            className="object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-2 flex gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {url ? "Reemplazar" : "Seleccionar imagen"}
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
        </label>
        {url && (
          <button
            type="button"
            onClick={() => onChange("", "")}
            className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        )}
      </div>
      <input type="hidden" value={path} readOnly />
    </div>
  );
}
