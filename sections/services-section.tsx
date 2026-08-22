import {getHomeContent} from '@/lib/home-content/public';
export async function ServicesSection() {
  const content=await getHomeContent(); if(!content.servicesEnabled)return null;
  const whatsappNumber = '595984053683';
  const message = 'Hola, quiero consultar sobre servicios de Portal Verde.';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const primaryButton=content.buttons.find(button=>button.placement==='services-primary'&&button.isActive);
  const secondaryButton=content.buttons.find(button=>button.placement==='services-secondary'&&button.isActive);

  return (
    <section className="rounded-xl border border-border bg-white p-4 sm:p-5">
      
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr] items-center">
        
        {/* Texto */}
        <div>
          <h2 className="text-lg font-bold text-text-strong sm:text-xl">
            {content.servicesTitle}
          </h2>

          <p className="mt-1 text-sm text-text-soft">
            {content.servicesDescription}
          </p>

          <div className="mt-3 flex gap-2">
            {primaryButton&&<a
              href={primaryButton.url||whatsappUrl}
              target={primaryButton.newTab?'_blank':undefined}
              className="rounded-md bg-dark-green px-4 py-2 text-xs font-semibold text-white hover:bg-primary"
            >
              {primaryButton.text}
            </a>}

            {secondaryButton&&<a
              href={secondaryButton.url}
              target={secondaryButton.newTab?'_blank':undefined}
              className="rounded-md border px-4 py-2 text-xs font-semibold"
            >
              {secondaryButton.text}
            </a>}
          </div>
        </div>

        {/* Servicios tipo tags */}
        <div className="flex flex-wrap gap-2">
          {content.tags.filter(item=>item.isActive).sort((a,b)=>a.sortOrder-b.sortOrder).map((item) => (
            <span
              key={item.label}
              className="rounded-full bg-soft-green px-3 py-1 text-xs font-semibold text-dark-green"
            >
              {item.label}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
