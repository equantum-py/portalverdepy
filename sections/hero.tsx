import Link from 'next/link';

export function HeroSection() {
  const whatsappNumber = '595984053683';
  const message = 'Hola, quiero consultar sobre césped e instalación.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="rounded-3xl bg-ink px-6 py-14 text-white sm:px-10 lg:px-14">
          
          {/* Etiqueta */}
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Portal Verde
          </p>

          {/* Título */}
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            Renová tu jardín con césped premium
          </h1>

          {/* Subtexto */}
          <p className="mt-4 max-w-xl text-sm text-white/80 sm:text-base">
            Venta e instalación de césped natural en Asunción y Gran Asunción.
          </p>

          {/* Beneficios (CLAVE para conversión) */}
          <p className="mt-3 text-xs text-white/70 sm:text-sm">
            ✔ Instalación incluida &nbsp; • &nbsp; ✔ Entrega rápida &nbsp; • &nbsp; ✔ Atención por WhatsApp
          </p>

          {/* Botones */}
          <div className="mt-8 flex flex-wrap gap-3">
            
            {/* CTA principal */}
            <a
              href={whatsappUrl}
              target="_blank"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink"
            >
              Solicitar cotización
            </a>

            {/* CTA secundario */}
            <Link
              href="/shop"
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold"
            >
              Ver catálogo
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}