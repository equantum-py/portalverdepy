'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Check,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  useFieldArray,
  useForm,
  type UseFormRegisterReturn
} from 'react-hook-form';

import {
  createProductAction,
  updateProductAction
} from '@/app/admin/(panel)/productos/actions/product-actions';
import {
  generateProductCopyAction,
  type GeminiProductSuggestion
} from '@/app/admin/(panel)/productos/actions/gemini-product-actions';
import { ProductImageUploader } from '@/components/admin/products/product-image-uploader';
import {
  PRODUCT_UNITS,
  productFormSchema,
  type ProductFormInput,
  type ProductFormValues
} from '@/lib/products/schema';
import { createProductSlug } from '@/lib/products/slug';

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
  availableProducts?: { id: string; name: string; slug: string }[];
  mode?: 'create' | 'edit';
  productId?: string;
  initialValues?: ProductFormValues;
};

const inputClass =
  'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100';

const textareaClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-100';

const emptyProductValues: ProductFormValues = {
  name: '',
  slug: '',
  categoryId: '',
  shortDescription: '',
  description: '',
  unit: 'unidad',
  minOrderQuantity: 1,
  priceAmount: 1,
  currency: 'PYG',
  promoPrice: undefined,
  promoStartsAt: '',
  promoEndsAt: '',
  isActive: true,
  isFeatured: false,
  priceTiers: [],
  images: [],
  features: [{ value: '' }],
  specifications: [{ key: '', value: '' }],
  recommendations: [{ value: '' }],
  relatedProductSlugs: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  mainImageAlt: '',
  canonicalUrl: ''
};

export function ProductForm({
  categories,
  availableProducts = [],
  mode = 'create',
  productId,
  initialValues
}: ProductFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(
    mode === 'edit'
  );
  const [serverMessage, setServerMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isGeneratingCopy, setIsGeneratingCopy] = useState(false);
  const [geminiMessage, setGeminiMessage] = useState('');
  const [geminiSuggestion, setGeminiSuggestion] = useState<GeminiProductSuggestion | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<
    ProductFormInput,
    unknown,
    ProductFormValues
  >({
    resolver: zodResolver(productFormSchema),
    defaultValues: initialValues ?? emptyProductValues
  });

  const name = watch('name');
  const images = (watch('images') ?? []).map((image) => ({
    ...image,
    altText: image.altText ?? ''
  }));
  const seoTitle = watch('seoTitle');
  const seoDescription = watch('seoDescription');
  const relatedProductSlugs = watch('relatedProductSlugs') ?? [];
  const configuredPriceTiers = watch('priceTiers') ?? [];
  const categoryId = watch('categoryId');
  const shortDescription = watch('shortDescription');
  const description = watch('description');
  const unit = watch('unit');

  async function generateWithGemini() {
    setGeminiMessage('');
    setGeminiSuggestion(null);
    setIsGeneratingCopy(true);

    const category = categories.find((item) => item.id === categoryId)?.name ?? '';
    const result = await generateProductCopyAction({
      name,
      category,
      unit,
      shortDescription,
      description
    });

    setIsGeneratingCopy(false);
    if (!result.success) {
      setGeminiMessage(result.message);
      return;
    }

    setGeminiSuggestion(result.suggestion);
  }

  function applyGeminiSuggestion() {
    if (!geminiSuggestion) return;

    for (const [field, value] of Object.entries(geminiSuggestion)) {
      setValue(field as keyof ProductFormValues, value, {
        shouldDirty: true,
        shouldValidate: true
      });
    }

    setGeminiMessage('Propuesta aplicada. Revisá los campos antes de guardar.');
    setGeminiSuggestion(null);
  }

  useEffect(() => {
    if (!slugEdited) {
      setValue('slug', createProductSlug(name), {
        shouldValidate: true
      });
    }
  }, [name, setValue, slugEdited]);

  const priceTiers = useFieldArray({
    control,
    name: 'priceTiers'
  });

  const features = useFieldArray({
    control,
    name: 'features'
  });

  const specifications = useFieldArray({
    control,
    name: 'specifications'
  });

  const recommendations = useFieldArray({
    control,
    name: 'recommendations'
  });

  function invalidSubmit(formErrors: typeof errors) {
    console.error('Errores del formulario de producto:', formErrors);

    const firstError = Object.values(formErrors)
      .map((error) => error?.message)
      .find((message): message is string => Boolean(message));

    setServerMessage(
      firstError ||
        'Hay campos incompletos o con datos inválidos. Revisá los campos marcados en rojo.'
    );

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function submit(values: ProductFormValues) {
    if (isSaving) {
      return;
    }

    setServerMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const result =
        mode === 'edit' && productId
          ? await updateProductAction(productId, values)
          : await createProductAction(values);

      if (!result.success) {
        setServerMessage(
          result.message || 'No se pudo guardar el producto.'
        );

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        return;
      }

      reset(values);

      setSuccessMessage(
        mode === 'edit'
          ? 'Producto actualizado correctamente.'
          : 'Producto creado correctamente.'
      );

      router.refresh();

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error('Error al guardar el producto:', error);

      setServerMessage(
        'Ocurrió un error al guardar el producto. Intentá nuevamente.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit, invalidSubmit)}
      noValidate
      className="mx-auto w-full max-w-[1100px]"
    >
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin/productos"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
            {mode === 'edit'
              ? 'Editar producto'
              : 'Nuevo producto'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {mode === 'edit'
              ? 'Actualizá la información comercial del producto.'
              : 'Completá la información comercial del producto.'}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isSaving
            ? 'Guardando...'
            : mode === 'edit'
              ? 'Actualizar producto'
              : 'Guardar producto'}
        </button>
      </div>

      {successMessage ? (
        <div
          role="status"
          className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          ✅ {successMessage}
        </div>
      ) : null}

      {serverMessage ? (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverMessage}
        </div>
      ) : null}

      <div className="space-y-6">
        <Section
          title="Productos relacionados"
          description="Seleccioná productos complementarios para mostrar en la ficha pública."
        >
          {availableProducts.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableProducts
                .filter((product) => product.id !== productId)
                .map((product) => (
                  <label key={product.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={relatedProductSlugs.includes(product.slug)}
                      onChange={(event) => setValue(
                        'relatedProductSlugs',
                        event.target.checked
                          ? [...relatedProductSlugs, product.slug]
                          : relatedProductSlugs.filter((slug) => slug !== product.slug),
                        { shouldDirty: true, shouldValidate: true }
                      )}
                    />
                    {product.name}
                  </label>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hay otros productos disponibles.</p>
          )}
        </Section>

        <Section
          title="Información básica"
          description="Nombre, categoría, descripción y forma de venta."
        >
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold text-emerald-950">
                  <Sparkles className="h-5 w-5 text-emerald-700" />
                  Asistente Gemini
                </div>
                <p className="mt-1 text-sm leading-6 text-emerald-900/75">
                  Genera descripciones y SEO. No guarda ni publica nada automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={generateWithGemini}
                disabled={isGeneratingCopy || name.trim().length < 2}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isGeneratingCopy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGeneratingCopy ? 'Generando…' : 'Generar con Gemini'}
              </button>
            </div>

            {geminiMessage ? <p className="mt-3 text-sm font-medium text-emerald-900">{geminiMessage}</p> : null}

            {geminiSuggestion ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                <p className="font-semibold text-slate-900">Vista previa de la propuesta</p>
                <dl className="mt-3 space-y-3 text-sm">
                  <div><dt className="font-semibold text-slate-700">Descripción corta</dt><dd className="mt-1 text-slate-600">{geminiSuggestion.shortDescription}</dd></div>
                  <div><dt className="font-semibold text-slate-700">Descripción completa</dt><dd className="mt-1 whitespace-pre-line text-slate-600">{geminiSuggestion.description}</dd></div>
                  <div><dt className="font-semibold text-slate-700">SEO</dt><dd className="mt-1 text-slate-600">{geminiSuggestion.seoTitle} — {geminiSuggestion.seoDescription}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={applyGeminiSuggestion} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800">
                    <Check className="h-4 w-4" /> Aplicar propuesta
                  </button>
                  <button type="button" onClick={() => setGeminiSuggestion(null)} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Descartar
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nombre" error={errors.name?.message}>
              <input
                {...register('name')}
                className={inputClass}
                placeholder="Ej.: Césped Esmeralda"
              />
            </Field>

            <Field label="Slug" error={errors.slug?.message}>
              <input
                {...register('slug', {
                  onChange: () => setSlugEdited(true)
                })}
                className={inputClass}
                placeholder="cesped-esmeralda"
              />
            </Field>

            <Field
              label="Categoría"
              error={errors.categoryId?.message}
            >
              <select
                {...register('categoryId')}
                className={inputClass}
              >
                <option value="">Seleccionar categoría</option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Unidad de venta">
              <select
                {...register('unit')}
                className={inputClass}
              >
                {PRODUCT_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Cantidad mínima"
              error={errors.minOrderQuantity?.message}
            >
              <input
                {...register('minOrderQuantity', {
                  valueAsNumber: true
                })}
                type="number"
                min="0.01"
                step="0.01"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5 space-y-5">
            <Field
              label="Descripción corta"
              error={errors.shortDescription?.message}
            >
              <textarea
                {...register('shortDescription')}
                rows={3}
                className={textareaClass}
              />
            </Field>

            <Field
              label="Descripción completa"
              error={errors.description?.message}
            >
              <textarea
                {...register('description')}
                rows={7}
                className={textareaClass}
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Precios"
          description="Precio base, promoción y escalas por cantidad."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Precio base"
              error={errors.priceAmount?.message}
            >
              <input
                {...register('priceAmount', {
                  valueAsNumber: true
                })}
                type="number"
                min="1"
                className={inputClass}
              />
            </Field>

            <Field label="Moneda">
              <select
                {...register('currency')}
                className={inputClass}
              >
                <option value="PYG">Guaraníes</option>
                <option value="USD">Dólares</option>
              </select>
            </Field>

            <Field
              label="Precio promocional"
              error={errors.promoPrice?.message}
            >
              <input
                {...register('promoPrice', {
                  setValueAs: (value) =>
                    value === '' ? undefined : Number(value)
                })}
                type="number"
                min="1"
                className={inputClass}
                placeholder="Opcional"
              />
            </Field>

            <Field label="Inicio de promoción">
              <input
                {...register('promoStartsAt')}
                type="datetime-local"
                className={inputClass}
              />
            </Field>

            <Field
              label="Fin de promoción"
              error={errors.promoEndsAt?.message}
            >
              <input
                {...register('promoEndsAt')}
                type="datetime-local"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-6">
            <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <input type="checkbox" checked={configuredPriceTiers.length > 0} onChange={(event) => event.target.checked ? priceTiers.append({ minQuantity: Number(watch('minOrderQuantity') || 1), maxQuantity: undefined, priceAmount: Number(watch('priceAmount') || 1), isPromo: false, label: '' }) : priceTiers.replace([])} className="mt-1 h-4 w-4 accent-green-700" />
              <span><strong className="block text-sm text-green-950">Activar precios por escala</strong><span className="mt-1 block text-xs leading-5 text-green-800">La calculadora aparecerá en la página del producto. Al desactivar, se utilizará el precio normal.</span></span>
            </label>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Escalas de precio
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Agregá precios diferentes según la cantidad.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  priceTiers.append({
                    minQuantity: 1,
                    maxQuantity: undefined,
                    priceAmount: 1,
                    isPromo: false,
                    label: ''
                  })
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-green-200 px-4 text-sm font-semibold text-green-700"
              >
                <Plus className="h-4 w-4" />
                Agregar escala
              </button>
            </div>

            {errors.priceTiers?.message ? (
              <p className="mt-3 text-sm text-red-600">
                {errors.priceTiers.message}
              </p>
            ) : null}

            <div className="mt-4 space-y-3">
              {priceTiers.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                >
                  <input
                    {...register(
                      `priceTiers.${index}.minQuantity`,
                      { valueAsNumber: true }
                    )}
                    type="number"
                    min="0.01"
                    placeholder="Desde"
                    className={inputClass}
                  />

                  <input
                    {...register(
                      `priceTiers.${index}.maxQuantity`,
                      {
                        setValueAs: (value) =>
                          value === ''
                            ? undefined
                            : Number(value)
                      }
                    )}
                    type="number"
                    min="0.01"
                    placeholder="Hasta"
                    className={inputClass}
                  />

                  <input
                    {...register(
                      `priceTiers.${index}.priceAmount`,
                      { valueAsNumber: true }
                    )}
                    type="number"
                    min="1"
                    placeholder="Precio"
                    className={inputClass}
                  />

                  <input
                    {...register(
                      `priceTiers.${index}.label`
                    )}
                    placeholder="Etiqueta"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={() => priceTiers.remove(index)}
                    className="mt-2 inline-flex h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600"
                    aria-label="Eliminar escala"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          title="Imágenes"
          description="Seleccioná imágenes desde tu computadora. La imagen principal se utilizará en el catálogo y la página del producto."
        >
          <ProductImageUploader
            productName={name}
            value={images.map((image) => ({
              ...image,
              storagePath: image.storagePath ?? '',
            }))}
            onChange={(nextImages) =>
              setValue('images', nextImages, {
                shouldDirty: true,
                shouldValidate: true
              })
            }
          />

          {errors.images?.message ? (
            <p className="mt-3 text-sm text-red-600">
              {errors.images.message}
            </p>
          ) : null}
        </Section>


        <DynamicTextSection
          title="Características"
          description="Principales beneficios o atributos."
          fields={features.fields}
          register={register}
          fieldName="features"
          onAdd={() => features.append({ value: '' })}
          onRemove={features.remove}
        />

        <Section
          title="Especificaciones"
          description="Información técnica en formato nombre y valor."
        >
          <button
            type="button"
            onClick={() =>
              specifications.append({
                key: '',
                value: ''
              })
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-green-200 px-4 text-sm font-semibold text-green-700"
          >
            <Plus className="h-4 w-4" />
            Agregar especificación
          </button>

          <div className="mt-4 space-y-3">
            {specifications.fields.map((field, index) => (
              <div
                key={field.id}
                className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  {...register(
                    `specifications.${index}.key`
                  )}
                  placeholder="Ej.: Tipo"
                  className={inputClass}
                />

                <input
                  {...register(
                    `specifications.${index}.value`
                  )}
                  placeholder="Ej.: Césped natural"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={() =>
                    specifications.remove(index)
                  }
                  className="mt-2 inline-flex h-11 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600"
                  aria-label="Eliminar especificación"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <DynamicTextSection
          title="Recomendaciones"
          description="Consejos comerciales o técnicos."
          fields={recommendations.fields}
          register={register}
          fieldName="recommendations"
          onAdd={() =>
            recommendations.append({ value: '' })
          }
          onRemove={recommendations.remove}
        />

        <Section
          title="SEO"
          description="Información para Google y redes sociales."
        >
          <div className="space-y-5">
            <Field label="Título SEO">
              <input
                {...register('seoTitle')}
                className={inputClass}
              />

              <p className="mt-1 text-xs text-slate-500">
                {seoTitle?.length ?? 0}/60 caracteres
              </p>
            </Field>

            <Field label="Meta descripción">
              <textarea
                {...register('seoDescription')}
                rows={4}
                className={textareaClass}
              />

              <p className="mt-1 text-xs text-slate-500">
                {seoDescription?.length ?? 0}/160 caracteres
              </p>
            </Field>

            <Field label="Palabras clave">
              <input
                {...register('seoKeywords')}
                className={inputClass}
                placeholder="césped, jardín, paisajismo"
              />
            </Field>

            <Field label="Texto alternativo de imagen">
              <input
                {...register('mainImageAlt')}
                className={inputClass}
              />
            </Field>

            <Field
              label="Canonical"
              error={errors.canonicalUrl?.message}
            >
              <input
                {...register('canonicalUrl')}
                className={inputClass}
                placeholder="https://portalverde.com.py/product/..."
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Publicación"
          description="Controlá la visibilidad del producto."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <ToggleField
              title="Producto activo"
              description="Visible en el catálogo público."
              registration={register('isActive')}
            />

            <ToggleField
              title="Producto destacado"
              description="Mostrar con mayor prioridad."
              registration={register('isFeatured')}
            />
          </div>
        </Section>
      </div>

      <div className="sticky bottom-0 mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 bg-[#f4f7f4]/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Link
          href="/admin/productos"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700"
        >
          Cancelar
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-green-700 px-5 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isSaving
            ? 'Guardando...'
            : mode === 'edit'
              ? 'Actualizar producto'
              : 'Guardar producto'}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-semibold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="pt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
      </span>

      {children}

      {error ? (
        <span className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function DynamicTextSection({
  title,
  description,
  fields,
  register,
  fieldName,
  onAdd,
  onRemove
}: {
  title: string;
  description: string;
  fields: { id: string }[];
  register: ReturnType<
    typeof useForm<ProductFormInput>
  >['register'];
  fieldName: 'features' | 'recommendations';
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <Section title={title} description={description}>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-green-200 px-4 text-sm font-semibold text-green-700"
      >
        <Plus className="h-4 w-4" />
        Agregar
      </button>

      <div className="mt-4 space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex items-start gap-3"
          >
            <input
              {...register(`${fieldName}.${index}.value`)}
              className={inputClass}
              placeholder="Escribí el contenido"
            />

            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-2 inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-red-200 px-3 text-red-600"
              aria-label="Eliminar elemento"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ToggleField({
  title,
  description,
  registration
}: {
  title: string;
  description: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
      <input
        type="checkbox"
        {...registration}
        className="mt-1 h-4 w-4 accent-green-700"
      />

      <span>
        <span className="block text-sm font-semibold text-slate-900">
          {title}
        </span>

        <span className="mt-1 block text-xs text-slate-500">
          {description}
        </span>
      </span>
    </label>
  );
}
