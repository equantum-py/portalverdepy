'use server';

import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const inputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  variant: z.string().trim().max(120).default(''),
  category: z.string().trim().min(1).max(120),
  description: z.string().trim().max(3000).default('')
});

const suggestionSchema = z.object({
  description: z.string().trim().min(1).max(1000),
  whatsappMessage: z.string().trim().min(1).max(500)
});

const imageReviewInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  imageUrl: z.string().url()
});

const imageReviewSchema = z.object({
  status: z.enum(['apta', 'revisar', 'reemplazar']),
  summary: z.string().trim().min(1).max(400),
  strengths: z.array(z.string().trim().min(1).max(160)).max(4),
  issues: z.array(z.string().trim().min(1).max(200)).max(6)
});

export type NurseryGeminiSuggestion = z.infer<typeof suggestionSchema>;
export type NurseryImageReview = z.infer<typeof imageReviewSchema>;

type Result =
  | { success: true; suggestion: NurseryGeminiSuggestion }
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

export async function generateNurseryCopyAction(input: unknown): Promise<Result> {
  try {
    await requireAdministrator();
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, message: 'Completá primero el nombre y el tipo.' };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, message: 'Gemini todavía no está configurado en este entorno.' };
    }

    const plant = parsed.data;
    const prompt = `Actuá como redactor ecommerce de Portal Verde Paraguay.
Mejorá la descripción pública y prepará un mensaje de consulta por WhatsApp.

Nombre real: ${plant.name}
Tamaño o variante informado: ${plant.variant || 'No informado'}
Tipo: ${plant.category}
Descripción actual: ${plant.description || 'Vacía'}

Reglas obligatorias:
- Conservá exactamente el nombre y la especie; no los corrijas ni sustituyas.
- No inventes toxicidad, cuidados, riego, luz, origen, tamaño, disponibilidad, precio,
  propiedades botánicas, ubicación recomendada ni usos que no estén escritos en los datos.
- La descripción debe ser comercial, neutral y verificable, de máximo 450 caracteres.
- No describas la fotografía porque no la estás analizando.
- El mensaje de WhatsApp debe ser breve, amable y pedir disponibilidad e información.
- Usá español paraguayo natural.`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                whatsappMessage: { type: 'string' }
              },
              required: ['description', 'whatsappMessage']
            }
          }
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('Gemini Vivero API error:', response.status, await response.text());
      if (response.status === 401 || response.status === 403) {
        return { success: false, message: 'Google rechazó la clave de Gemini.' };
      }
      if (response.status === 429) {
        return { success: false, message: 'Gemini alcanzó temporalmente el límite de uso.' };
      }
      return { success: false, message: 'Gemini no pudo generar el contenido. Intentá nuevamente.' };
    }

    const payload = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, message: 'Gemini respondió sin contenido.' };

    const suggestion = suggestionSchema.safeParse(JSON.parse(text));
    if (!suggestion.success) {
      return { success: false, message: 'La propuesta llegó incompleta. Volvé a intentar.' };
    }

    return { success: true, suggestion: suggestion.data };
  } catch (error) {
    console.error('Error al usar Gemini en Vivero Digital:', error);
    return { success: false, message: error instanceof Error ? error.message : 'No se pudo usar Gemini.' };
  }
}

export async function reviewNurseryImageAction(input: unknown): Promise<
  | { success: true; review: NurseryImageReview }
  | { success: false; message: string }
> {
  try {
    await requireAdministrator();
    const parsed = imageReviewInputSchema.safeParse(input);
    if (!parsed.success) return { success: false, message: 'Esta planta todavía no tiene una fotografía válida.' };

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, message: 'Gemini todavía no está configurado en este entorno.' };

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || new URL(parsed.data.imageUrl).host !== new URL(supabaseUrl).host) {
      return { success: false, message: 'Por seguridad, solo se pueden analizar fotografías almacenadas por Portal Verde.' };
    }

    const imageResponse = await fetch(parsed.data.imageUrl, { cache: 'no-store' });
    if (!imageResponse.ok) return { success: false, message: 'No se pudo descargar la fotografía para analizarla.' };

    const mimeType = imageResponse.headers.get('content-type')?.split(';')[0] ?? '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      return { success: false, message: 'La fotografía debe estar en JPG, PNG o WebP.' };
    }

    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    if (bytes.length > 5 * 1024 * 1024) return { success: false, message: 'La fotografía supera 5 MB.' };

    const prompt = `Analizá esta fotografía de catálogo de la planta “${parsed.data.name}”.
Evaluá únicamente la calidad visual de presentación ecommerce: nitidez aparente, desenfoque,
pixelado visible, encuadre, centrado, partes importantes cortadas, margen alrededor de la planta,
uniformidad del fondo beige, iluminación, escala y presencia de logos o textos.
No identifiques ni corrijas la especie. No inventes resolución ni dimensiones exactas.
Estado: "apta" si puede publicarse profesionalmente; "revisar" si conviene corregir detalles;
"reemplazar" solo si el problema visual es grave. Sé concreto y escribí en español sencillo.`;

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [
            { text: prompt },
            { inlineData: { mimeType, data: bytes.toString('base64') } }
          ] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['apta', 'revisar', 'reemplazar'] },
                summary: { type: 'string' },
                strengths: { type: 'array', items: { type: 'string' } },
                issues: { type: 'array', items: { type: 'string' } }
              },
              required: ['status', 'summary', 'strengths', 'issues']
            }
          }
        }),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      console.error('Gemini image review error:', response.status, await response.text());
      if (response.status === 429) return { success: false, message: 'Gemini alcanzó temporalmente el límite de uso.' };
      return { success: false, message: 'Gemini no pudo analizar la fotografía. Intentá nuevamente.' };
    }

    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: false, message: 'Gemini respondió sin un análisis.' };

    const review = imageReviewSchema.safeParse(JSON.parse(text));
    if (!review.success) return { success: false, message: 'El análisis llegó incompleto. Volvé a intentar.' };
    return { success: true, review: review.data };
  } catch (error) {
    console.error('Error al analizar fotografía con Gemini:', error);
    return { success: false, message: error instanceof Error ? error.message : 'No se pudo analizar la fotografía.' };
  }
}
