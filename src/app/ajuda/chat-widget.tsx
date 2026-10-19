"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Mail, MessageCircle, X } from "lucide-react";
import { SeenIcon } from "@/components/brand";
import { answerQuestion, CONTATO, FAQ, type HelpArticle } from "@/lib/ajuda";

export const OPEN_CHAT = "seen:abrir-chat";

type Msg = { from: "bot" | "user"; text: string; articles?: HelpArticle[]; contact?: boolean };

const GREETING: Msg = { from: "bot", text: "Oi! Sou o assistente da Seen. Pergunte o que quiser sobre a plataforma, SEO ou GEO." };
const SUGGESTIONS = [FAQ[0].q, "Como conectar meu WordPress?", "Esqueci minha senha", FAQ[3].q];

/** Assistente de suporte: responde com as perguntas frequentes e os artigos da central. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_CHAT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT, onOpen);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    setText("");
    setMessages((m) => [...m, { from: "user", text: question }]);
    setTyping(true);
    const { faq, articles } = answerQuestion(question);
    let reply: Msg;
    if (faq) reply = { from: "bot", text: faq.a, articles: articles.slice(0, 2) };
    else if (articles.length) reply = { from: "bot", text: "Encontrei estes artigos que podem ajudar:", articles };
    else reply = { from: "bot", text: "Não encontrei uma resposta pronta para isso. A nossa equipe pode te ajudar:", contact: true };
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, reply]);
    }, 450);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Assistente da Seen"
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(620px,calc(100vh-120px))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_60px_-12px_rgba(0,30,90,0.35)] sm:inset-x-auto sm:right-6 sm:w-[380px]"
        >
          <div className="flex items-center gap-3 bg-brand px-4 py-3.5 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-white/15">
              <SeenIcon variant="white" className="h-3.5 w-auto" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold">Assistente da Seen</p>
              <p className="text-xs text-white/75">Responde na hora</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-white/15" aria-label="Fechar chat">
              <X className="size-5" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-canvas p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "flex justify-end" : ""}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.from === "user" ? "rounded-br-md bg-brand text-white" : "rounded-bl-md border border-line bg-surface"
                  }`}
                >
                  {m.text}
                  {m.articles && m.articles.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      {m.articles.map((a) => (
                        <Link
                          key={a.slug}
                          href={`/ajuda/${a.slug}`}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg border border-line bg-canvas px-2.5 py-2 text-[13px] font-medium text-brand hover:border-brand/40"
                        >
                          {a.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  {m.contact && <ContactButtons />}
                </div>
              </div>
            ))}
            {typing && (
              <div className="inline-flex gap-1 rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-3" aria-label="Digitando">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted/60" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </div>
            )}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => ask(s)}
                    className="rounded-full border border-brand/25 bg-surface px-3 py-1.5 text-left text-xs font-medium text-brand hover:bg-brand-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(text);
            }}
            className="flex items-center gap-2 border-t border-line bg-surface p-3"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva sua dúvida…"
              className="field h-10 flex-1 rounded-full px-4"
              aria-label="Sua pergunta"
            />
            <button type="submit" disabled={!text.trim()} className="grid size-10 place-items-center rounded-full bg-brand text-white disabled:opacity-40" aria-label="Enviar">
              <ArrowUp className="size-5" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-brand text-white shadow-[0_12px_28px_-8px_rgba(0,93,255,0.7)] transition hover:scale-105 hover:bg-brand-strong"
        aria-label={open ? "Fechar chat" : "Abrir chat de suporte"}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </>
  );
}

function ContactButtons() {
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      <a href={`mailto:${CONTATO.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[13px] font-medium text-brand">
        <Mail className="size-3.5" /> E-mail
      </a>
      {CONTATO.whatsapp && (
        <a
          href={`https://wa.me/${CONTATO.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-[13px] font-medium text-[#128c4a]"
        >
          <MessageCircle className="size-3.5" /> WhatsApp
        </a>
      )}
    </div>
  );
}
