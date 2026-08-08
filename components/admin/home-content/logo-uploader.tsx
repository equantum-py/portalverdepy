'use client';

import { ImageIcon, Loader2, Save, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { saveLogoSettingsAction } from '@/app/admin/(panel)/pagina-inicio/logo-actions';
import { createClient } from '@/lib/supabase/client';

type LogoUploaderProps = {
  initialEnabled: boolean;
  initialDesktopUrl: string;
  initialDesktopPath: string;
  initialMobileUrl: string;
  initialMobilePath: string;
  initialAlt: string;
};

type UploadKind = 'desktop' | 'mobile';

const BUCKET = 'home-content-images';

export function LogoUploader({
  initialEnabled,
  initialDesktopUrl,
  initialDesktopPath,
  initialMobileUrl,
  initialMobilePath,
  initialAlt,
}: LogoUploaderProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [desktopUrl, setDesktopUrl] = useState(initialDesktopUrl);
  const [desktopPath, setDesktopPath] = useState(initialDesktopPath);
  const [mobileUrl, setMobileUrl] = useState(initialMobileUrl);
  const [mobilePath, setMobilePath] = useState(initialMobilePath);
  const [alt, setAlt] = useState(initialAlt);
  const [busy, setBusy] = useState<UploadKind | 'save' | null>(null);
  const [message, setMessage] = useState('');
  const desktopInput = useRef<HTMLInputElement>(null);
  const mobileInput = useRef<HTMLInputElement>(null);

  async function upload(kind: UploadKind, file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Seleccioná un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('La imagen no puede superar 5 MB.');
      return;
    }

    setBusy(kind);
    setMessage('');

    try {
      const supabase = createClient();
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
      const path = `logos/${kind}-${Date.now()}.${extension}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

      if (kind === 'desktop') {
        setDesktopUrl(data.publicUrl);
        setDesktopPath(path);
      } else {
        setMobileUrl(data.publicUrl);
        setMobilePath(path);
      }

      setMessage(
        kind === 'desktop'
          ? 'Logo de escritorio adjuntado. Guardá el logo para aplicarlo.'
          : 'Logo móvil adjuntado. Guardá el logo para aplicarlo.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudo subir la imagen.',
      );
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setBusy('save');
    setMessage('');

    const result = await saveLogoSettingsAction({
      enabled,
      desktopUrl,
      desktopPath,
      mobileUrl,
      mobilePath,
      alt,
    });

    setMessage(result.message);
    setBusy(null);
  }

  function clear(kind: UploadKind) {
    if (kind === 'desktop') {
      setDesktopUrl('');
      setDesktopPath('');
      if (desktopInput.current) desktopInput.current.value = '';
    } else {
      setMobileUrl('');
      setMobilePath('');
      if (mobileInput.current) mobileInput.current.value = '';
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          Mostrar logo
        </label>

        <button
          type="button"
          onClick={() => void save()}
          disabled={busy !== null}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-green-700 px-4 text-sm font-semibold text-white transition hover:bg-green-800 disabled:opacity-60"
        >
          {busy === 'save' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar logo
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <LogoCard
          title="Logo Desktop"
          help="Tamaño recomendado: 600 × 200 px. Fondo transparente. PNG, WEBP o SVG. Máximo 5 MB."
          url={desktopUrl}
          loading={busy === 'desktop'}
          inputRef={desktopInput}
          onFile={(file) => void upload('desktop', file)}
          onClear={() => clear('desktop')}
        />

        <LogoCard
          title="Logo Mobile"
          help="Tamaño recomendado: 400 × 160 px. Fondo transparente. Puede ser una versión compacta. Máximo 5 MB."
          url={mobileUrl}
          loading={busy === 'mobile'}
          inputRef={mobileInput}
          onFile={(file) => void upload('mobile', file)}
          onClear={() => clear('mobile')}
        />
      </div>

      <label className="block text-sm text-slate-700">
        <span className="font-medium">Texto alternativo del logo</span>
        <input
          value={alt}
          onChange={(event) => setAlt(event.target.value)}
          placeholder="Ej.: Portal Verde"
          className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
        />
      </label>

      {message ? (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </div>
      ) : null}
    </div>
  );
}

function LogoCard({
  title,
  help,
  url,
  loading,
  inputRef,
  onFile,
  onClear,
}: {
  title: string;
  help: string;
  url: string;
  loading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (file?: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">{help}</p>
      </div>

      <div className="flex min-h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white p-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="max-h-28 max-w-full object-contain" />
        ) : (
          <div className="text-center text-slate-400">
            <ImageIcon className="mx-auto h-8 w-8" />
            <p className="mt-2 text-xs">Todavía no hay una imagen adjunta</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(event) => onFile(event.target.files?.[0])}
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-green-700 bg-white px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {url ? 'Reemplazar imagen' : 'Adjuntar imagen'}
        </button>

        {url ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Quitar ${title}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
