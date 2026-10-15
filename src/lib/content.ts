import { marked } from "marked";
import type { Opportunity } from "./types";

/**
 * Os primeiros artigos foram salvos em Markdown; os novos são HTML (editor visual).
 * Esta função devolve sempre HTML.
 */
export function toHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("<")) return trimmed;
  return marked.parse(trimmed, { async: false }) as string;
}

/** Texto puro, sem tags. Serve para resumo, contagem de palavras e checagens de SEO. */
export function toPlainText(content: string) {
  return toHtml(content)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<\/(p|h[1-6]|li|tr|blockquote|div)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function excerpt(content: string, max = 120) {
  const text = toPlainText(content).replace(/\s+/g, " ");
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, "") + "…" : text;
}

/**
 * Oportunidade a partir de volume e dificuldade (0–10).
 * Muito buscado e pouco disputado = alta. Regra simples, ajustável quando os dados do Google entrarem.
 */
export function computeOpportunity(volume: number | null, difficulty: number | null): Opportunity | null {
  if (volume == null || difficulty == null) return null;
  const demand = volume >= 1000 ? 3 : volume >= 200 ? 2 : volume >= 30 ? 1 : 0;
  const ease = difficulty <= 3 ? 3 : difficulty <= 5 ? 2 : difficulty <= 7 ? 1 : 0;
  const score = demand + ease;
  return score >= 5 ? "alta" : score >= 3 ? "media" : "baixa";
}
