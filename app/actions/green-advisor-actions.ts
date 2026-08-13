'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { getPublicProducts } from '@/lib/products/catalog-products';
import { createClient } from '@/lib/supabase/server';

const requestSchema = z.object({
  message: z.string().trim().min(2).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(900)
  })).max(6).default([])
});

const responseSchema = z.object({
  answer: z.string().trim().min(1).max(1400),
  recommendedProductSlugs: z.array(z.string()).max(3).default([]),
  whatsappMessage: z.string().trim().min(1).max(700),
  needsHuman: z.boolean().default(false)
});

export type GreenAdvisorReply = z.infer<typeof responseSchema>;
export type GreenAdvisorResult =
  | { success: true; reply: GreenAdvisorReply }
  | { success: false; message: string };

const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}

type AdvisorProduct = {
  name: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  includesInstallation: boolean;
  publishedAsAvailable: boolean;
};

type AdvisorPlant = { name: string; variant: string | null };

function createVerifiedFallback(
  message: string,
  catalog: AdvisorProduct[] = [],
  plants: AdvisorPlant[] = []
): GreenAdvisorReply {
  const query = message.toLocaleLowerCase('es-PY');
  const whatsappMessage = `Hola, Portal Verde. Quiero consultar sobre: ${message}`;

  if (/^(hola|hol[aá]|buen(?:os|as)|qué tal|que tal)/i.test(query)) {
    return {
      answer: '¡Hola! ¿Cómo estás? Soy asesor de Portal Verde. Contame, ¿qué necesitás para tu jardín?',
      recommendedProductSlugs: [],
      whatsappMessage,
      needsHuman: false
    };
  }

  if (query.includes('césped') || query.includes('cesped') || query.includes('pasto')) {
    const grass = catalog.filter((product) =>
      product.category.toLocaleLowerCase('es-PY').includes('césped') ||
      product.category.toLocaleLowerCase('es-PY').includes('cesped')
    ).slice(0, 3);
    return {
      answer: `Claro que sí. Para ayudarte a elegir bien, primero contame: ¿cuántos m² necesitás cubrir?${grass.length ? ` Tenemos ${grass.map((product) => product.name).join(', ')}.` : ''}`,
      recommendedProductSlugs: grass.map((product) => product.slug),
      whatsappMessage,
      needsHuman: true
    };
  }

  if (query.includes('planta') || query.includes('vivero')) {
    const plantNames = plants.slice(0, 6).map((plant) =>
      plant.variant ? `${plant.name} (${plant.variant})` : plant.name
    );
    return {
      answer: plantNames.length
        ? `Sí, tenemos varias opciones. Algunas son: ${plantNames.join(', ')}. ¿Buscás una planta grande, mediana o chica?`
        : 'Sí, contamos con plantas en el Vivero Digital. ¿Buscás una planta grande, mediana o chica?',
      recommendedProductSlugs: [],
      whatsappMessage,
      needsHuman: true
    };
  }

  if (/(riego|mantenimiento|piscina|paisajismo|visita técnica|visita tecnica|servicio)/i.test(query)) {
    return {
      answer: 'Sí, hacemos paisajismo, mantenimiento de jardines y piscinas, riego automático y visitas técnicas. ¿Cuál de estos servicios necesitás?',
      recommendedProductSlugs: [],
      whatsappMessage,
      needsHuman: true
    };
  }

  return {
    answer: 'Claro, te ayudo. Contame un poco más: ¿estás buscando césped, plantas o algún servicio para tu jardín?',
    recommendedProductSlugs: [],
    whatsappMessage,
    needsHuman: false
  };
}

export async function askGreenAdvisor(input: unknown): Promise<GreenAdvisorResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, message: 'Escribí una consulta breve para poder ayudarte.' };
  }

  const requestHeaders = await headers();
  const visitorKey = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
  if (isRateLimited(visitorKey)) {
    return { success: false, message: 'Recibimos varias consultas seguidas. Esperá un minuto y volvé a intentar.' };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { success: false, message: 'La atención de Portal Verde todavía no está disponible en este entorno.' };
  }

  try {
    const [products, nurseryResult] = await Promise.all([
      getPublicProducts(),
      (async () => {
        const supabase = await createClient();
        return supabase
          .from('digital_nursery_items')
          .select('name,variant,description')
          .eq('is_active', true)
          .eq('is_published', true)
          .order('sort_order', { ascending: true })
          .limit(60);
      })()
    ]);

    const catalog = products.slice(0, 30).map((product) => ({
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description.slice(0, 180),
      price: product.price,
      unit: product.unit ?? 'unidad',
      includesInstallation: Boolean(product.includesInstallation),
      publishedAsAvailable: product.inStock !== false
    }));

    const plants = (nurseryResult.data ?? []).slice(0, 30).map((plant) => ({
      name: plant.name,
      variant: plant.variant
    }));

    const validSlugs = new Set(catalog.map((product) => product.slug));
    const conversation = [...parsed.data.history, { role: 'user' as const, content: parsed.data.message }];
    const prompt = `Sos un asesor comercial humano de Portal Verde Paraguay atendiendo por chat. Respondé como una persona paraguaya amable, cercana y vendedora, sin sonar robótico ni exagerado.

REGLAS OBLIGATORIAS:
- Usá únicamente la información incluida en CONTEXTO. No inventes productos, precios, stock, promociones, cobertura, plazos ni condiciones.
- Un producto activo/publicado no garantiza stock inmediato. Ante disponibilidad, presupuesto, medidas del terreno o diagnóstico, indicá que debe confirmarlo un asesor por WhatsApp.
- Para recomendar césped, si faltan datos preguntá por superficie, cantidad de sol, uso y estado del terreno.
- Césped Maní no incluye preparación del terreno. Los demás céspedes con instalación incluyen preparación básica. Malezas importantes, retiro o destoconado de árboles, nivelaciones complejas, relleno de pozos y aporte extraordinario de suelo se inspeccionan y cotizan aparte.
- Para plantas, no inventes cuidados específicos si no están en el contexto.
- Respondé muy breve: entre 1 y 3 frases, máximo 55 palabras.
- Hacé solamente una pregunta por respuesta para que la conversación avance paso a paso.
- Usá expresiones naturales como "claro que sí", "contame" o "perfecto" cuando correspondan, sin repetirlas demasiado.
- No hagas listas largas ni expliques todo de una vez. Primero entendé qué necesita el cliente y luego orientalo.
- recommendedProductSlugs solo puede contener slugs exactos del catálogo.
- whatsappMessage debe resumir la consulta para que el cliente la envíe a Portal Verde, sin afirmar que ya compró o reservó.
- Si el pedido está fuera del contexto, decí con transparencia que un asesor humano debe confirmarlo.

SERVICIOS:
Paisajismo; mantenimiento de jardines; mantenimiento de piscinas; instalación de riego automático; visita técnica. Todos se consultan y cotizan por WhatsApp. Cobertura informada: Asunción y Gran Asunción.

CATÁLOGO ACTIVO:
${JSON.stringify(catalog)}

PLANTAS PUBLICADAS EN VIVERO DIGITAL:
${JSON.stringify(plants)}

CONVERSACIÓN:
${JSON.stringify(conversation)}

Devolvé exclusivamente JSON válido con esta forma:
{"answer":"...","recommendedProductSlugs":[],"whatsappMessage":"Hola, Portal Verde...","needsHuman":false}`;

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
                answer: { type: 'string' },
                recommendedProductSlugs: {
                  type: 'array',
                  items: { type: 'string' }
                },
                whatsappMessage: { type: 'string' },
                needsHuman: { type: 'boolean' }
              },
              required: [
                'answer',
                'recommendedProductSlugs',
                'whatsappMessage',
                'needsHuman'
              ]
            },
            temperature: 0.2,
            maxOutputTokens: 700
          }
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(18_000)
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Green Advisor Gemini error:', response.status, errorBody);
      if (response.status === 401 || response.status === 403) {
        return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };
      }
      if (response.status === 429) {
        return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };
      }
      if (response.status === 400) {
        return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };
      }
      return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };
    }

    const payload = await response.json();
    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };

    const normalizedText = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    const reply = responseSchema.safeParse(JSON.parse(normalizedText));
    if (!reply.success) {
      console.error('Invalid Green Advisor response:', reply.error.flatten());
      return { success: true, reply: createVerifiedFallback(parsed.data.message, catalog, plants) };
    }

    return {
      success: true,
      reply: {
        ...reply.data,
        recommendedProductSlugs: reply.data.recommendedProductSlugs.filter((slug) => validSlugs.has(slug))
      }
    };
  } catch (error) {
    console.error('Green Advisor error:', error);
    if (error instanceof Error && error.name === 'TimeoutError') {
      return { success: true, reply: createVerifiedFallback(parsed.data.message) };
    }
    return { success: true, reply: createVerifiedFallback(parsed.data.message) };
  }
}
