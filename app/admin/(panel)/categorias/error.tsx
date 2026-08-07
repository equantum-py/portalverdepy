'use client';
export default function ErrorState({ reset }: { reset: () => void }) { return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700"><h2 className="font-semibold">No se pudo cargar Categorías</h2><button onClick={reset} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm text-white">Reintentar</button></div>; }
