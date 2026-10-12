// Checklist de SEO on-page calculado no navegador enquanto o artigo é editado.

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function countWords(markdown: string) {
  const text = markdown.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`\-[\]()!|]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
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
  content: string;
  siteUrl: string;
};

export type SeoCheck = { id: string; label: string; ok: boolean; detail?: string };

export function seoChecklist(a: SeoInput): SeoCheck[] {
  const kw = norm(a.focusKeyword.trim());
  const hasKw = kw.length > 0;
  const title = a.metaTitle || a.title;
  const words = countWords(a.content);
  const firstWords = norm(a.content.split(/\s+/).slice(0, 100).join(" "));
  const h2 = (a.content.match(/^##\s+/gm) ?? []).length;
  const host = (() => {
    try {
      return new URL(a.siteUrl).host;
    } catch {
      return "";
    }
  })();
  const links = [...a.content.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
  const internal = links.filter((l) => l.startsWith("/") || (host && l.includes(host))).length;

  return [
    { id: "kw", label: "Palavra-chave principal definida", ok: hasKw },
    {
      id: "title-len",
      label: "Título SEO entre 30 e 60 caracteres",
      ok: title.length >= 30 && title.length <= 60,
      detail: `${title.length} caracteres`,
    },
    { id: "kw-title", label: "Palavra-chave no título", ok: hasKw && norm(title).includes(kw) },
    {
      id: "meta-len",
      label: "Meta description entre 120 e 160 caracteres",
      ok: a.metaDescription.length >= 120 && a.metaDescription.length <= 160,
      detail: `${a.metaDescription.length} caracteres`,
    },
    { id: "kw-meta", label: "Palavra-chave na meta description", ok: hasKw && norm(a.metaDescription).includes(kw) },
    { id: "kw-slug", label: "Palavra-chave na URL", ok: hasKw && a.slug.includes(slugify(a.focusKeyword)) },
    { id: "kw-intro", label: "Palavra-chave nas primeiras 100 palavras", ok: hasKw && firstWords.includes(kw) },
    { id: "h2", label: "Pelo menos 3 subtítulos (##)", ok: h2 >= 3, detail: `${h2} encontrados` },
    { id: "words", label: "Pelo menos 800 palavras", ok: words >= 800, detail: `${words} palavras` },
    { id: "internal", label: "Pelo menos 2 links internos", ok: internal >= 2, detail: `${internal} encontrados` },
  ];
}
