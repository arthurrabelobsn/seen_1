// Score de SEO on-page, calculado no navegador enquanto o artigo é editado.
import { toHtml, toPlainText } from "./content";

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function countWords(content: string) {
  return toPlainText(content).split(/\s+/).filter(Boolean).length;
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export type SeoInput = {
  title: string;
  slug: string;
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  content: string; // HTML ou Markdown
  siteUrl: string;
};

export type SeoCheck = {
  id: string;
  group: "palavra-chave" | "conteudo" | "metadados" | "links e midia";
  label: string;
  tip: string;
  ok: boolean;
  weight: number;
  detail?: string;
};

export function seoChecklist(a: SeoInput): SeoCheck[] {
  const html = toHtml(a.content);
  const text = toPlainText(a.content);
  const words = text.split(/\s+/).filter(Boolean);
  const kw = norm(a.focusKeyword.trim());
  const hasKw = kw.length > 0;
  const title = a.metaTitle || a.title;
  const normText = norm(text);
  const firstWords = norm(words.slice(0, 100).join(" "));

  const kwCount = hasKw ? normText.split(kw).length - 1 : 0;
  const kwWords = kw.split(/\s+/).filter(Boolean).length || 1;
  const density = words.length ? ((kwCount * kwWords) / words.length) * 100 : 0;

  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => norm(m[1].replace(/<[^>]+>/g, "")));
  const h3Count = (html.match(/<h3[\s>]/gi) ?? []).length;

  const host = (() => {
    try {
      return new URL(a.siteUrl).host;
    } catch {
      return "";
    }
  })();
  const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map((m) => m[1]);
  const internal = hrefs.filter((h) => h.startsWith("/") || (host && h.includes(host))).length;
  const external = hrefs.filter((h) => /^https?:\/\//.test(h) && !(host && h.includes(host))).length;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const imgsWithAlt = imgs.filter((i) => /alt="[^"]+"/.test(i)).length;

  const sentences = text.split(/[.!?]+\s/).filter((s) => s.trim().split(/\s+/).length > 2);
  const avgSentence = sentences.length ? words.length / sentences.length : 0;
  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length);
  const longParagraphs = paragraphs.filter((n) => n > 120).length;

  return [
    { id: "kw", group: "palavra-chave", weight: 10, label: "Palavra-chave principal definida", tip: "Defina o termo que a pessoa digita no Google.", ok: hasKw },
    { id: "kw-title", group: "palavra-chave", weight: 10, label: "Palavra-chave no título", tip: "Coloque a palavra-chave no título, de preferência no começo.", ok: hasKw && norm(title).includes(kw) },
    { id: "kw-intro", group: "palavra-chave", weight: 8, label: "Palavra-chave nas primeiras 100 palavras", tip: "Cite a palavra-chave logo no primeiro parágrafo.", ok: hasKw && firstWords.includes(kw) },
    { id: "kw-h2", group: "palavra-chave", weight: 5, label: "Palavra-chave em um subtítulo", tip: "Use a palavra-chave (ou variação) em pelo menos um H2.", ok: hasKw && h2s.some((h) => h.includes(kw)) },
    {
      id: "kw-density",
      group: "palavra-chave",
      weight: 6,
      label: "Densidade da palavra-chave entre 0,5% e 2,5%",
      tip: density > 2.5 ? "A palavra-chave aparece demais. Troque algumas por sinônimos." : "Cite a palavra-chave mais vezes, de forma natural.",
      ok: hasKw && density >= 0.5 && density <= 2.5,
      detail: hasKw ? `${density.toFixed(1).replace(".", ",")}% · ${kwCount}×` : undefined,
    },
    { id: "kw-slug", group: "palavra-chave", weight: 5, label: "Palavra-chave na URL", tip: "Use a palavra-chave no slug, sem palavras de ligação.", ok: hasKw && a.slug.includes(slugify(a.focusKeyword)) },

    { id: "words", group: "conteudo", weight: 10, label: "Pelo menos 800 palavras", tip: "Artigos completos tendem a ranquear melhor. Aprofunde os tópicos.", ok: words.length >= 800, detail: `${words.length} palavras` },
    { id: "h2", group: "conteudo", weight: 8, label: "Pelo menos 3 subtítulos (H2)", tip: "Divida o texto em seções com H2 para facilitar a leitura.", ok: h2s.length >= 3, detail: `${h2s.length} H2 · ${h3Count} H3` },
    { id: "readability", group: "conteudo", weight: 5, label: "Frases curtas (média até 22 palavras)", tip: "Quebre frases longas. Leitura fácil prende o leitor.", ok: words.length > 0 && avgSentence <= 22, detail: avgSentence ? `${Math.round(avgSentence)} palavras/frase` : undefined },
    { id: "paragraphs", group: "conteudo", weight: 3, label: "Parágrafos sem paredes de texto", tip: "Parágrafos com mais de 120 palavras cansam. Divida-os.", ok: words.length > 0 && longParagraphs === 0, detail: longParagraphs ? `${longParagraphs} longos` : undefined },

    { id: "title-len", group: "metadados", weight: 6, label: "Título SEO entre 30 e 60 caracteres", tip: "Títulos muito longos são cortados no Google.", ok: title.length >= 30 && title.length <= 60, detail: `${title.length} caracteres` },
    { id: "meta-len", group: "metadados", weight: 6, label: "Meta description entre 120 e 160 caracteres", tip: "Resuma o artigo e convide ao clique.", ok: a.metaDescription.length >= 120 && a.metaDescription.length <= 160, detail: `${a.metaDescription.length} caracteres` },
    { id: "kw-meta", group: "metadados", weight: 4, label: "Palavra-chave na meta description", tip: "O Google destaca em negrito o termo buscado.", ok: hasKw && norm(a.metaDescription).includes(kw) },

    { id: "internal", group: "links e midia", weight: 6, label: "Pelo menos 2 links internos", tip: "Linke outras páginas e produtos do seu site.", ok: internal >= 2, detail: `${internal} internos` },
    { id: "external", group: "links e midia", weight: 2, label: "Pelo menos 1 link para fonte externa", tip: "Cite uma fonte confiável para reforçar autoridade.", ok: external >= 1, detail: `${external} externos` },
    { id: "images", group: "links e midia", weight: 5, label: "Pelo menos 1 imagem", tip: "Imagens ajudam a leitura e aparecem no Google Imagens.", ok: imgs.length >= 1, detail: `${imgs.length} imagens` },
    { id: "alt", group: "links e midia", weight: 3, label: "Todas as imagens com texto alternativo", tip: "Descreva cada imagem no texto alternativo (alt).", ok: imgs.length > 0 && imgsWithAlt === imgs.length, detail: imgs.length ? `${imgsWithAlt}/${imgs.length}` : undefined },
  ];
}

export function seoScore(checks: SeoCheck[]) {
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const got = checks.reduce((s, c) => s + (c.ok ? c.weight : 0), 0);
  return Math.round((got / total) * 100);
}

export function scoreLabel(score: number) {
  if (score >= 85) return { text: "Excelente", color: "text-good", stroke: "var(--color-good)" };
  if (score >= 65) return { text: "Bom", color: "text-brand", stroke: "var(--color-brand)" };
  if (score >= 40) return { text: "Pode melhorar", color: "text-warn", stroke: "var(--color-warn)" };
  return { text: "Fraco", color: "text-bad", stroke: "var(--color-bad)" };
}
