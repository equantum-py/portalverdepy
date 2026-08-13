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

export type NurseryGeminiSuggestion = z.infer<typeof suggestionSchema>;

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
  propiedades botánicas ni usos que no estén escritos en los datos.
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
