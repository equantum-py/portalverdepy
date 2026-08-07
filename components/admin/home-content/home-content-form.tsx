'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn,
} from 'react-hook-form';

import { saveHomeContentAction } from '@/app/admin/(panel)/pagina-inicio/actions';
import { HeroImageUploader } from './hero-image-uploader';
import { HomeHero } from '@/sections/home-hero';
import {
  homeContentSchema,
  type HomeContentValues,
} from '@/lib/home-content/schema';

const input =
  'mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm';

type CategoryOption = {
  id: string;
  name: string;
};

type ProductOption = {
  id: string;
  name: string;
};

type HomeContentFormProps = {
  initialValues: HomeContentValues;
  categories: CategoryOption[];
  products: ProductOption[];
};

export function HomeContentForm({
  initialValues,
  categories,
  products,
}: HomeContentFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<
    'desktop' | 'mobile'
  >('desktop');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<HomeContentValues>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: initialValues,
  });

  const nav = useFieldArray({
    control,
    name: 'navigation',
  });

  const tags = useFieldArray({
    control,
    name: 'tags',
  });

  const columns = useFieldArray({
    control,
    name: 'megaColumns',
  });

  const services = useFieldArray({
    control,
    name: 'megaServices',
  });

  const buttons = useFieldArray({
    control,
    name: 'buttons',
  });

  const sections = useFieldArray({
    control,
    name: 'sections',
  });

  const values = watch();

  async function submit(data: HomeContentValues) {
    setSaving(true);
    setMessage('');

    try {
      const result =
        await saveHomeContentAction(data);

      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios.',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="mx-auto max-w-6xl"
    >
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-green-700">
            Contenido
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Página de inicio
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Administrá el contenido principal del Home,
            navegación, servicios, botones y secciones.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex h-11 items-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {saving
            ? 'Guardando...'
            : 'Guardar cambios'}
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
        {/* BARRA PROMOCIONAL */}
        <Box title="Barra promocional">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('promoEnabled')}
            />
            Barra promocional activa
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Texto">
              <input
                className={input}
                {...register('promoText')}
              />
            </Field>

            <Field label="Icono">
              <input
                className={input}
                {...register('promoIcon')}
              />
            </Field>

            <Field label="Enlace">
              <input
                className={input}
                {...register('promoUrl')}
              />
            </Field>

            <Field label="Texto del botón">
              <input
                className={input}
                {...register('promoButtonText')}
              />
            </Field>

            <Field label="Velocidad">
              <input
                type="number"
                className={input}
                {...register('promoSpeed', {
                  valueAsNumber: true,
                })}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-5 pt-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register('promoScroll')}
                />
                Desplazamiento
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  {...register('promoNewTab')}
                />
                Nueva pestaña
              </label>
            </div>
          </div>
        </Box>

        {/* LOGO Y WHATSAPP */}
        <Box title="Encabezado, logo y WhatsApp">
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('logoEnabled')}
              />
              Mostrar logo
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('whatsappEnabled')}
              />
              WhatsApp activo
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Logo Desktop">
              <input
                className={input}
                {...register('logoDesktopUrl')}
              />
            </Field>

            <Field label="Ruta Storage Desktop">
              <input
                className={input}
                {...register('logoDesktopPath')}
              />
            </Field>

            <Field label="Logo Mobile">
              <input
                className={input}
                {...register('logoMobileUrl')}
              />
            </Field>

            <Field label="Ruta Storage Mobile">
              <input
                className={input}
                {...register('logoMobilePath')}
              />
            </Field>

            <Field label="Texto alternativo del logo">
              <input
                className={input}
                {...register('logoAlt')}
              />
            </Field>
          </div>

          <div className="grid gap-4 border-t pt-4 md:grid-cols-2">
            <Field label="Texto de WhatsApp">
              <input
                className={input}
                {...register('whatsappText')}
              />
            </Field>

            <Field label="Enlace de WhatsApp">
              <input
                className={input}
                {...register('whatsappUrl')}
              />
            </Field>
          </div>

          <ArrayEditor
            title="Navegación"
            fields={nav.fields}
            add={() =>
              nav.append({
                name: 'Nuevo enlace',
                url: '/',
                linkType: 'internal',
                targetId: '',
                newTab: false,
                sortOrder: nav.fields.length,
                isActive: true,
              })
            }
          >
            {(field, index) => {
              const linkType =
                values.navigation?.[index]?.linkType ??
                'internal';

              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Nombre">
                      <input
                        className={input}
                        {...register(
                          `navigation.${index}.name`,
                        )}
                      />
                    </Field>

                    <Field label="Tipo de enlace">
                      <select
                        className={input}
                        {...register(
                          `navigation.${index}.linkType`,
                        )}
                      >
                        <option value="internal">
                          Página interna
                        </option>

                        <option value="category">
                          Categoría
                        </option>

                        <option value="product">
                          Producto
                        </option>

                        <option value="whatsapp">
                          WhatsApp
                        </option>

                        <option value="external">
                          Enlace externo
                        </option>
                      </select>
                    </Field>

                    {(linkType === 'internal' ||
                      linkType === 'whatsapp' ||
                      linkType === 'external') && (
                      <Field label="Enlace">
                        <input
                          className={input}
                          {...register(
                            `navigation.${index}.url`,
                          )}
                        />
                      </Field>
                    )}

                    {linkType === 'category' && (
                      <Field label="Categoría">
                        <select
                          className={input}
                          {...register(
                            `navigation.${index}.targetId`,
                          )}
                        >
                          <option value="">
                            Seleccionar categoría
                          </option>

                          {categories.map(
                            (category) => (
                              <option
                                key={category.id}
                                value={category.id}
                              >
                                {category.name}
                              </option>
                            ),
                          )}
                        </select>
                      </Field>
                    )}

                    {linkType === 'product' && (
                      <Field label="Producto">
                        <select
                          className={input}
                          {...register(
                            `navigation.${index}.targetId`,
                          )}
                        >
                          <option value="">
                            Seleccionar producto
                          </option>

                          {products.map((product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    )}

                    <Field label="Orden">
                      <input
                        type="number"
                        className={input}
                        {...register(
                          `navigation.${index}.sortOrder`,
                          {
                            valueAsNumber: true,
                          },
                        )}
                      />
                    </Field>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-5">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          {...register(
                            `navigation.${index}.isActive`,
                          )}
                        />
                        Activo
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          {...register(
                            `navigation.${index}.newTab`,
                          )}
                        />
                        Nueva pestaña
                      </label>
                    </div>

                    <Delete
                      onClick={() =>
                        nav.remove(index)
                      }
                    />
                  </div>
                </div>
              );
            }}
          </ArrayEditor>
        </Box>

        {/* HERO */}
        <Box title="Portada principal">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('heroEnabled')}
            />
            Portada activa
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Título principal">
              <input
                className={input}
                {...register('heroTitle')}
              />
            </Field>

            <Field label="Subtítulo">
              <input
                className={input}
                {...register('heroSubtitle')}
              />
            </Field>

            <Field label="Descripción">
              <textarea
                className={`${input} h-24 py-2`}
                {...register('heroDescription')}
              />
            </Field>

            <Field label="Texto alternativo">
              <input
                className={input}
                {...register('heroAlt')}
              />
            </Field>

            <HeroImageUploader
              label="Imagen Desktop"
              recommendedSize="1920 × 650 px"
              aspect="desktop"
              url={values.heroDesktopUrl}
              path={values.heroDesktopPath}
              onChange={({ url, path }) => {
                setValue('heroDesktopUrl', url, { shouldDirty: true });
                setValue('heroDesktopPath', path, { shouldDirty: true });
              }}
            />

            <HeroImageUploader
              label="Imagen Mobile"
              recommendedSize="1080 × 1350 px"
              aspect="mobile"
              url={values.heroMobileUrl}
              path={values.heroMobilePath}
              onChange={({ url, path }) => {
                setValue('heroMobileUrl', url, { shouldDirty: true });
                setValue('heroMobilePath', path, { shouldDirty: true });
              }}
            />

            <Field label="Alineación">
              <select
                className={input}
                {...register('heroAlignment')}
              >
                <option value="left">
                  Izquierda
                </option>
                <option value="center">
                  Centro
                </option>
                <option value="right">
                  Derecha
                </option>
              </select>
            </Field>

            <Field label={`Intensidad de sombra: ${values.heroOverlayIntensity}%`}>
              <input
                type="range"
                min={0}
                max={90}
                className="mt-3 h-2 w-full cursor-pointer accent-green-700"
                {...register(
                  'heroOverlayIntensity',
                  {
                    valueAsNumber: true,
                  },
                )}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('heroOverlay')}
            />
            Aplicar sombra sobre la imagen
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
                registration={register('heroContentEnabled')}
                checked={values.heroContentEnabled}
              />

              <div
                className={`grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3 ${
                  values.heroContentEnabled
                    ? ''
                    : 'pointer-events-none opacity-45'
                }`}
                aria-disabled={!values.heroContentEnabled}
              >
                <Toggle
                  label="Mostrar en Desktop"
                  registration={register('heroContentDesktop')}
                  checked={values.heroContentDesktop}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar en Mobile"
                  registration={register('heroContentMobile')}
                  checked={values.heroContentMobile}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar etiqueta"
                  registration={register('heroShowLabel')}
                  checked={values.heroShowLabel}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar título"
                  registration={register('heroShowTitle')}
                  checked={values.heroShowTitle}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar subtítulo"
                  registration={register('heroShowSubtitle')}
                  checked={values.heroShowSubtitle}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar descripción"
                  registration={register('heroShowDescription')}
                  checked={values.heroShowDescription}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar precio"
                  registration={register('heroShowPrice')}
                  checked={values.heroShowPrice}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar “Instalación incluida”"
                  registration={register('heroShowInstallationBadge')}
                  checked={values.heroShowInstallationBadge}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar botón principal"
                  registration={register('heroShowPrimaryButton')}
                  checked={values.heroShowPrimaryButton}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar botón secundario"
                  registration={register('heroShowSecondaryButton')}
                  checked={values.heroShowSecondaryButton}
                  disabled={!values.heroContentEnabled}
                />

                <Toggle
                  label="Mostrar beneficios"
                  registration={register('heroShowBenefits')}
                  checked={values.heroShowBenefits}
                  disabled={!values.heroContentEnabled}
                />
              </div>
            </div>
          </div>
        </Box>

        {/* SERVICIOS */}
        <Box title="Sección de servicios">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('servicesEnabled')}
            />
            Sección activa
          </label>

          <Field label="Título">
            <input
              className={input}
              {...register('servicesTitle')}
            />
          </Field>

          <Field label="Descripción">
            <textarea
              className={`${input} h-24 py-2`}
              {...register('servicesDescription')}
            />
          </Field>

          <ArrayEditor
            title="Etiquetas"
            fields={tags.fields}
            add={() =>
              tags.append({
                label: 'Nueva etiqueta',
                icon: 'Leaf',
                sortOrder: tags.fields.length,
                isActive: true,
              })
            }
          >
            {(field, index) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_180px_100px_auto_auto]"
              >
                <input
                  className={input}
                  placeholder="Etiqueta"
                  {...register(
                    `tags.${index}.label`,
                  )}
                />

                <input
                  className={input}
                  placeholder="Icono"
                  {...register(
                    `tags.${index}.icon`,
                  )}
                />

                <input
                  type="number"
                  className={input}
                  {...register(
                    `tags.${index}.sortOrder`,
                    {
                      valueAsNumber: true,
                    },
                  )}
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...register(
                      `tags.${index}.isActive`,
                    )}
                  />
                  Activa
                </label>

                <Delete
                  onClick={() =>
                    tags.remove(index)
                  }
                />
              </div>
            )}
          </ArrayEditor>
        </Box>

        {/* MEGA MENU */}
        <Box title="Mega menú">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              {...register('megaMenuEnabled')}
            />
            Mega menú activo
          </label>

          <ArrayEditor
            title="Columnas"
            fields={columns.fields}
            add={() =>
              columns.append({
                title: 'Columna',
                icon: 'Leaf',
                categoryId: '',
                viewAllLabel:
                  'Ver toda la categoría',
                viewAllUrl: '/shop',
                sortOrder:
                  columns.fields.length,
                isActive: true,
                productIds: [],
              })
            }
          >
            {(field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Título">
                    <input
                      className={input}
                      {...register(
                        `megaColumns.${index}.title`,
                      )}
                    />
                  </Field>

                  <Field label="Icono">
                    <input
                      className={input}
                      {...register(
                        `megaColumns.${index}.icon`,
                      )}
                    />
                  </Field>

                  <Field label="Categoría">
                    <select
                      className={input}
                      {...register(
                        `megaColumns.${index}.categoryId`,
                      )}
                    >
                      <option value="">
                        Sin categoría
                      </option>

                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>

                  <Field label="Texto Ver todos">
                    <input
                      className={input}
                      {...register(
                        `megaColumns.${index}.viewAllLabel`,
                      )}
                    />
                  </Field>

                  <Field label="Enlace Ver todos">
                    <input
                      className={input}
                      {...register(
                        `megaColumns.${index}.viewAllUrl`,
                      )}
                    />
                  </Field>

                  <Field label="Orden">
                    <input
                      type="number"
                      className={input}
                      {...register(
                        `megaColumns.${index}.sortOrder`,
                        {
                          valueAsNumber: true,
                        },
                      )}
                    />
                  </Field>
                </div>

                <Field label="Productos">
                  <select
                    multiple
                    className="mt-1 min-h-32 w-full rounded-lg border border-slate-200 p-2 text-sm"
                    {...register(
                      `megaColumns.${index}.productIds`,
                    )}
                  >
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register(
                        `megaColumns.${index}.isActive`,
                      )}
                    />
                    Activa
                  </label>

                  <Delete
                    onClick={() =>
                      columns.remove(index)
                    }
                  />
                </div>
              </div>
            )}
          </ArrayEditor>

          <div className="grid gap-4 border-t pt-5 md:grid-cols-2">
            <Field label="Título de servicios">
              <input
                className={input}
                {...register('megaServicesTitle')}
              />
            </Field>

            <Field label="Descripción">
              <input
                className={input}
                {...register(
                  'megaServicesDescription',
                )}
              />
            </Field>
          </div>

          <ArrayEditor
            title="Servicios del mega menú"
            fields={services.fields}
            add={() =>
              services.append({
                title: 'Servicio',
                description: '',
                icon: 'Leaf',
                url: '/trabajos',
                sortOrder:
                  services.fields.length,
                isActive: true,
              })
            }
          >
            {(field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-3"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Título">
                    <input
                      className={input}
                      {...register(
                        `megaServices.${index}.title`,
                      )}
                    />
                  </Field>

                  <Field label="Descripción">
                    <input
                      className={input}
                      {...register(
                        `megaServices.${index}.description`,
                      )}
                    />
                  </Field>

                  <Field label="Icono">
                    <input
                      className={input}
                      {...register(
                        `megaServices.${index}.icon`,
                      )}
                    />
                  </Field>

                  <Field label="Enlace">
                    <input
                      className={input}
                      {...register(
                        `megaServices.${index}.url`,
                      )}
                    />
                  </Field>

                  <Field label="Orden">
                    <input
                      type="number"
                      className={input}
                      {...register(
                        `megaServices.${index}.sortOrder`,
                        {
                          valueAsNumber: true,
                        },
                      )}
                    />
                  </Field>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register(
                        `megaServices.${index}.isActive`,
                      )}
                    />
                    Activo
                  </label>

                  <Delete
                    onClick={() =>
                      services.remove(index)
                    }
                  />
                </div>
              </div>
            )}
          </ArrayEditor>
        </Box>

        {/* BOTONES */}
        <Box title="Botones globales">
          <ArrayEditor
            title="Botones"
            fields={buttons.fields}
            add={() =>
              buttons.append({
                placement: 'custom',
                text: 'Nuevo botón',
                url: '/',
                linkType: 'internal',
                icon: '',
                variant: 'primary',
                sortOrder:
                  buttons.fields.length,
                isActive: true,
                newTab: false,
              })
            }
          >
            {(field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <Field label="Texto">
                    <input
                      className={input}
                      {...register(
                        `buttons.${index}.text`,
                      )}
                    />
                  </Field>

                  <Field label="Enlace">
                    <input
                      className={input}
                      {...register(
                        `buttons.${index}.url`,
                      )}
                    />
                  </Field>

                  <Field label="Tipo">
                    <select
                      className={input}
                      {...register(
                        `buttons.${index}.linkType`,
                      )}
                    >
                      <option value="internal">
                        Interno
                      </option>
                      <option value="external">
                        Externo
                      </option>
                      <option value="whatsapp">
                        WhatsApp
                      </option>
                      <option value="anchor">
                        Ancla
                      </option>
                    </select>
                  </Field>

                  <Field label="Icono">
                    <input
                      className={input}
                      {...register(
                        `buttons.${index}.icon`,
                      )}
                    />
                  </Field>

                  <Field label="Estilo">
                    <input
                      className={input}
                      {...register(
                        `buttons.${index}.variant`,
                      )}
                    />
                  </Field>

                  <Field label="Ubicación">
                    <input
                      className={input}
                      {...register(
                        `buttons.${index}.placement`,
                      )}
                    />
                  </Field>

                  <Field label="Orden">
                    <input
                      type="number"
                      className={input}
                      {...register(
                        `buttons.${index}.sortOrder`,
                        {
                          valueAsNumber: true,
                        },
                      )}
                    />
                  </Field>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex gap-5">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        {...register(
                          `buttons.${index}.isActive`,
                        )}
                      />
                      Activo
                    </label>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        {...register(
                          `buttons.${index}.newTab`,
                        )}
                      />
                      Nueva pestaña
                    </label>
                  </div>

                  <Delete
                    onClick={() =>
                      buttons.remove(index)
                    }
                  />
                </div>
              </div>
            )}
          </ArrayEditor>
        </Box>

        {/* SECCIONES */}
        <Box title="Administración de secciones">
          <p className="text-sm text-slate-500">
            Activá, desactivá y cambiá el orden de
            aparición de las secciones del Home.
          </p>

          <div className="space-y-2">
            {sections.fields.map(
              (field, index) => (
                <div
                  key={field.id}
                  className="grid items-center gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_120px_120px]"
                >
                  <input
                    className={input}
                    {...register(
                      `sections.${index}.title`,
                    )}
                  />

                  <input
                    type="number"
                    className={input}
                    {...register(
                      `sections.${index}.sortOrder`,
                      {
                        valueAsNumber: true,
                      },
                    )}
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      {...register(
                        `sections.${index}.isActive`,
                      )}
                    />
                    Activa
                  </label>
                </div>
              ),
            )}
          </div>
        </Box>

        {/* PREVIEW */}
        <Box title="Vista previa">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setPreview('desktop')
              }
              className={`rounded-lg border px-3 py-2 text-sm ${
                preview === 'desktop'
                  ? 'border-green-700 bg-green-50 text-green-800'
                  : ''
              }`}
            >
              Desktop
            </button>

            <button
              type="button"
              onClick={() =>
                setPreview('mobile')
              }
              className={`rounded-lg border px-3 py-2 text-sm ${
                preview === 'mobile'
                  ? 'border-green-700 bg-green-50 text-green-800'
                  : ''
              }`}
            >
              Mobile
            </button>
          </div>

          <div
            className={`mx-auto overflow-hidden rounded-xl border bg-white ${
              preview === 'mobile'
                ? 'max-w-sm'
                : 'w-full'
            }`}
          >
            {values.promoEnabled && (
              <div className="bg-green-50 p-2 text-center text-xs text-green-900">
                {values.promoIcon}{' '}
                {values.promoText}
              </div>
            )}

            {values.heroEnabled && (
              <HomeHero
                content={values}
                previewViewport={preview}
              />
            )}

            {values.servicesEnabled && (
              <div className="p-5">
                <Eye className="h-5 w-5 text-green-700" />

                <h3 className="mt-5 font-bold">
                  {values.servicesTitle}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {values.servicesDescription}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {values.tags
                    .filter(
                      (tag) => tag.isActive,
                    )
                    .map((tag, index) => (
                      <span
                        key={`${tag.label}-${index}`}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-800"
                      >
                        {tag.label}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </Box>
      </div>
    </form>
  );
}

function Box({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <div className="mt-4 space-y-4">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm text-slate-700">
      <span className="font-medium">
        {label}
      </span>

      {children}
    </label>
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
  children: (
    field: { id: string },
    index: number,
  ) => ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">
          {title}
        </h3>

        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>

      <div className="space-y-3">
        {fields.map(children)}
      </div>
    </div>
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
    <label
      className={`flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 text-sm font-medium shadow-sm ring-1 ring-slate-200 ${
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer'
      }`}
    >
      <span>{label}</span>

      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-green-700' : 'bg-slate-300'
        }`}
      >
        <input
          type="checkbox"
          disabled={disabled}
          className="peer sr-only"
          {...registration}
        />

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </label>
  );
}

function Delete({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Eliminar"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}