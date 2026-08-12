'use client';

import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { useRef, useState, useTransition } from 'react';

import { importProductsCsvAction } from '@/app/admin/(panel)/productos/actions/bulk-product-actions';

type ExportProduct = {
  name: string;
  slug: string;
  category: string;
  price: number;
  unit: string;
  isActive: boolean;
  inStock: boolean;
  shortDescription: string;
  description: string;
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
};

type Props = { products: ExportProduct[] };

const HEADERS = [
  'name', 'slug', 'category', 'price', 'currency', 'unit',
  'min_order_quantity', 'promo_price', 'short_description', 'description',
  'image_url', 'features', 'specifications', 'recommendations',
  'is_active', 'in_stock', 'is_featured', 'includes_installation',
  'seo_title', 'seo_description', 'seo_keywords', 'main_image_alt', 'canonical_url'
];

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename: string, rows: unknown[][]) {
  const csv = '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function ProductBulkTools({ products }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function exportProducts() {
    downloadCsv('portal-verde-productos.csv', [
      HEADERS,
      ...products.map((product) => [
        product.name, product.slug, product.category, product.price, 'PYG', product.unit || 'unidad',
        1, '', product.shortDescription, product.description, product.imageUrl,
        '', '', '', product.isActive, product.inStock, false, false,
        product.seoTitle, product.seoDescription, '', product.name, ''
      ])
    ]);
  }

  function downloadTemplate() {
    downloadCsv('plantilla-importacion-productos-portal-verde.csv', [
      HEADERS,
      [
        'Piedra de ejemplo', 'piedra-de-ejemplo', 'Paisajismo', '35000', 'PYG', 'kg',
        '1', '', 'Descripción corta', 'Descripción completa del producto',
        'https://ejemplo.com/imagen.webp', 'Ideal para jardín|Fácil aplicación',
        'Presentación:Bolsa|Peso:30 kg', 'Consultar cantidad necesaria|Verificar disponibilidad',
        'false', 'true', 'false', 'false', 'Piedra para jardín en Paraguay',
        'Piedra decorativa para jardines y paisajismo.', 'piedra jardín|paisajismo Paraguay',
        'Piedra decorativa para jardín', ''
      ]
    ]);
  }

  async function importFile() {
    if (!file) return;
    const text = await file.text();
    startTransition(async () => {
      const result = await importProductsCsvAction(text);
      setMessage(result.message);
      setErrors(result.errors.slice(0, 20));
      if (result.success) {
        setFile(null);
        if (fileRef.current) fileRef.current.value = '';
        window.location.reload();
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={exportProducts} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
        <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-semibold text-green-800 transition hover:bg-green-100">
          <Upload className="h-4 w-4" /> Importar productos
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Importación masiva de productos</h2>
                <p className="mt-1 text-sm text-slate-500">Subí un CSV de hasta 1.000 productos. Si el slug ya existe, el producto se actualiza.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>

            <button type="button" onClick={downloadTemplate} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-green-700 hover:text-green-800">
              <FileSpreadsheet className="h-4 w-4" /> Descargar plantilla CSV
            </button>

            <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-5">
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-600" />
              <p className="mt-3 text-xs leading-5 text-slate-500">Categoría: usá el nombre existente. Listas: separá valores con |. Especificaciones: Nombre:Valor|Nombre:Valor. Los productos nuevos quedan inactivos si is_active está vacío o en false.</p>
            </div>

            {message ? <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{message}</div> : null}
            {errors.length ? (
              <div className="mt-3 max-h-40 overflow-auto rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                {errors.map((error) => <p key={error}>{error}</p>)}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">Cancelar</button>
              <button type="button" disabled={!file || pending} onClick={importFile} className="min-h-11 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                {pending ? 'Importando...' : 'Importar productos'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
