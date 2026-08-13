'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ExternalLink, Leaf, Loader2, MessageCircle, Send, X } from 'lucide-react';

import { askGreenAdvisor, type GreenAdvisorReply } from '@/app/actions/green-advisor-actions';
import { createWhatsAppUrl } from '@/lib/site-config';

type Message = { role: 'user' | 'assistant'; content: string; reply?: GreenAdvisorReply };

const suggestions = [
  '¿Qué césped me conviene?',
  '¿Qué plantas tienen disponibles?',
  'Quiero instalar riego automático',
  'Necesito mantenimiento de jardín'
];

export function GreenAdvisor() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, sending]);

  useEffect(() => {
    document.documentElement.dataset.greenAdvisorOpen = String(open);
    return () => {
      delete document.documentElement.dataset.greenAdvisorOpen;
    };
  }, [open]);

  if (pathname.startsWith('/admin')) return null;

  async function submitQuestion(question: string) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || sending) return;
    setError('');
    setInput('');
    setSending(true);
    const history = messages.slice(-6).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: 'user', content: cleanQuestion }]);

    const minimumTypingTime = new Promise((resolve) => window.setTimeout(resolve, 1200));
    const [result] = await Promise.all([
      askGreenAdvisor({ message: cleanQuestion, history }),
      minimumTypingTime
    ]);
    if (result.success) {
      setMessages((current) => [...current, { role: 'assistant', content: result.reply.answer, reply: result.reply }]);
    } else {
      setError(result.message);
    }
    setSending(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuestion(input);
  }

  const latestReply = [...messages].reverse().find((message) => message.reply)?.reply;
  const fallbackMessage = messages.findLast((message) => message.role === 'user')?.content;
  const whatsappUrl = createWhatsAppUrl(
    latestReply?.whatsappMessage || `Hola, Portal Verde. Quiero consultar sobre: ${fallbackMessage || 'sus productos y servicios'}`
  );

  return (
    <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-[70] sm:bottom-28 sm:right-6">
      {open ? (
        <section
          role="dialog"
          aria-label="Asesor de Portal Verde"
          className="mb-3 flex h-[min(620px,calc(100dvh-10rem))] w-[calc(100vw-1.5rem)] max-w-[410px] flex-col overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-[#0b3d24] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Leaf className="h-5 w-5" /></span>
              <div><h2 className="font-semibold">Asesor de Portal Verde</h2><p className="text-xs text-emerald-100">Atención y orientación online</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar atención online" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"><X className="h-5 w-5" /></button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f7faf7] p-4">
            <div className="max-w-[90%] rounded-2xl rounded-tl-md border border-emerald-100 bg-white p-3 text-sm leading-relaxed text-slate-700">
              ¡Hola! ¿Cómo estás? Contame qué necesitás para tu jardín y te ayudo.
            </div>

            {messages.length === 0 ? (
              <div className="grid gap-2 pt-1">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => void submitQuestion(suggestion)} className="min-h-11 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-left text-sm font-medium text-emerald-900 hover:bg-emerald-50">
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[88%]' : 'max-w-[92%]'}>
                <div className={message.role === 'user' ? 'whitespace-pre-line rounded-2xl rounded-tr-md bg-emerald-700 p-3 text-sm leading-relaxed text-white' : 'whitespace-pre-line rounded-2xl rounded-tl-md border border-emerald-100 bg-white p-3 text-sm leading-relaxed text-slate-700'}>
                  {message.content}
                </div>
                {message.reply?.recommendedProductSlugs.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.reply.recommendedProductSlugs.map((slug) => (
                      <Link key={slug} href={`/product/${slug}`} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-800">
                        Ver producto <ExternalLink className="h-3 w-3" />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {sending ? <div className="flex w-fit items-center gap-2 rounded-2xl rounded-tl-md border border-emerald-100 bg-white p-3 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />Escribiendo…</div> : null}
            {error ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</div> : null}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-3">
            {messages.length || error ? (
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="mb-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
                <MessageCircle className="h-4 w-4" /> Continuar por WhatsApp
              </a>
            ) : null}
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label className="sr-only" htmlFor="green-advisor-question">Tu consulta</label>
              <textarea id="green-advisor-question" value={input} onChange={(event) => setInput(event.target.value)} maxLength={500} rows={1} placeholder="Escribí tu consulta…" className="min-h-11 max-h-28 flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
              <button type="submit" disabled={sending || input.trim().length < 2} aria-label="Enviar consulta" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </form>
            <p className="mt-2 text-center text-[10px] text-slate-500">La orientación es informativa. Confirmá disponibilidad y presupuesto con un asesor.</p>
          </div>
        </section>
      ) : null}

      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? 'Cerrar atención online' : 'Abrir Atención 24/7'} className="ml-auto flex min-h-12 items-center gap-2 rounded-full bg-[#0b3d24] px-4 font-semibold text-white shadow-xl transition hover:bg-[#126235]">
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}<span>{open ? 'Cerrar' : 'Atención 24/7'}</span>
      </button>
    </div>
  );
}
