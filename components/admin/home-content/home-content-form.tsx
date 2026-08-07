<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h3 className="font-semibold text-slate-900">
        Contenido sobre el banner
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        Elegí qué información acompaña a la fotografía.
      </p>
    </div>

    <Toggle
      label="Mostrar contenido sobre el banner"
      checked={values.heroContentEnabled}
      registration={register('heroContentEnabled')}
    />
  </div>

  <fieldset
    disabled={!values.heroContentEnabled}
    className="mt-4 border-t border-slate-200 pt-4 disabled:cursor-not-allowed disabled:opacity-40"
  >
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      Mostrar contenido en
    </p>

    <div className="mb-5 flex flex-wrap gap-3">
      <Toggle
        label="Desktop"
        checked={values.heroContentDesktop}
        registration={register('heroContentDesktop')}
      />

      <Toggle
        label="Mobile"
        checked={values.heroContentMobile}
        registration={register('heroContentMobile')}
      />
    </div>

    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      Elementos visibles
    </p>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Toggle
        label="Etiqueta"
        checked={values.heroShowLabel}
        registration={register('heroShowLabel')}
      />

      <Toggle
        label="Título"
        checked={values.heroShowTitle}
        registration={register('heroShowTitle')}
      />

      <Toggle
        label="Subtítulo"
        checked={values.heroShowSubtitle}
        registration={register('heroShowSubtitle')}
      />

      <Toggle
        label="Descripción"
        checked={values.heroShowDescription}
        registration={register('heroShowDescription')}
      />

      <Toggle
        label="Precio"
        checked={values.heroShowPrice}
        registration={register('heroShowPrice')}
      />

      <Toggle
        label="Instalación incluida"
        checked={values.heroShowInstallationBadge}
        registration={register('heroShowInstallationBadge')}
      />

      <Toggle
        label="Botón principal"
        checked={values.heroShowPrimaryButton}
        registration={register('heroShowPrimaryButton')}
      />

      <Toggle
        label="Botón secundario"
        checked={values.heroShowSecondaryButton}
        registration={register('heroShowSecondaryButton')}
      />

      <Toggle
        label="Beneficios"
        checked={values.heroShowBenefits}
        registration={register('heroShowBenefits')}
      />
    </div>
  </fieldset>
</div>