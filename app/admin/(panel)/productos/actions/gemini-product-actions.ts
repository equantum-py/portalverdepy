'use server';

import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  name: z.string().trim().min(2).max(160),
  category: z.string().trim().max(120).default(''),
  unit: z.string().trim().max(40).default('unidad'),
  shortDescription: z.string().trim().max(500).default(''),
  description: z.string().trim().max(5000).default('')
});

const suggestionSchema = z.object({
  shortDescription: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(3000),
  seoTitle: z.string().trim().min(1).max(60),
  seoDescription: z.string().trim().min(1).max(160),
  seoKeywords: z.string().trim().min(1).max(500),
  mainImageAlt: z.string().trim().min(1).max(180)
});

export type GeminiProductSuggestion = z.infer<typeof suggestionSchema>;

type Result =
  | { success: true; suggestion: GeminiProductSuggestion }
  | { success: false; message: string };

async function requireAdministrator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Tu sesión venció. Volvé a iniciar sesión.');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' || !profile.is_active) {
    throw new Error('No tenés permisos para usar el asistente de IA.');
  }
}

export async function generateProductCopyAction(input: unknown): Promise<Result> {
  try {
    await requireAdministrator();

    const parsed = requestSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Escribí primero el nombre del producto.' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, message: 'Gemini todavía no está configurado en este entorno.' };
    }

    const product = parsed.data;
    const prompt = `Actuá como redactor ecommerce y especialista SEO de Portal Verde Paraguay.
Creá contenido claro, comercial, profesional y comprobable para este producto.
Usá español paraguayo natural con voseo moderado. No inventes precios, disponibilidad,
propiedades técnicas, instalación incluida ni beneficios que no estén en los datos.

Producto: ${product.name}
Categoría: ${product.category || 'Sin especificar'}
Unidad de venta: ${product.unit}
Descripción corta actual: ${product.shortDescription || 'Vacía'}
Descripción completa actual: ${product.description || 'Vacía'}

Reglas: descripción corta de máximo 220 caracteres; descripción completa de 1 a 3 párrafos
breves; título SEO de máximo 60 caracteres incluyendo Paraguay cuando resulte natural;
meta descripción de máximo 160 caracteres; palabras clave separadas por comas; texto
alternativo descriptivo, sin repetir palabras innecesariamente.`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                shortDescription: { type: 'string' },
                description: { type: 'string' },
                seoTitle: { type: 'string' },
                seoDescription: { type: 'string' },
                seoKeywords: { type: 'string' },
                mainImageAlt: { type: 'string' }
              },
              required: ['shortDescription', 'description', 'seoTitle', 'seoDescription', 'seoKeywords', 'mainImageAlt']
            }
          }
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);

      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Google rechazó la clave de Gemini. Revisá que sea válida y tenga acceso a Gemini API.' };
      }

      if (response.status === 429) {
        return { success: false, message: 'Gemini alcanzó temporalmente el límite de uso. Esperá un momento y volvé a intentar.' };
      }

      if (response.status === 400) {
        return { success: false, message: 'Gemini rechazó la solicitud. Actualizá la página e intentá nuevamente.' };
      }

      return { success: false, message: 'Gemini no está disponible en este momento. Intentá nuevamente.' };
    }

    const payload = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, message: 'Gemini respondió sin contenido.' };

    const suggestion = suggestionSchema.safeParse(JSON.parse(text));
    if (!suggestion.success) {
      console.error('Respuesta inválida de Gemini:', suggestion.error.flatten());
      return { success: false, message: 'La propuesta de Gemini llegó incompleta. Volvé a intentar.' };
    }

    return { success: true, suggestion: suggestion.data };
  } catch (error) {
    console.error('Error al usar Gemini:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'No se pudo usar Gemini.'
    };
  }
}
