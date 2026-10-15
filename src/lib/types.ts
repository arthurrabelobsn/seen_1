export type Platform = "wordpress" | "github" | "webhook" | "shopify" | "nuvemshop" | "outro";

export type ArticleStatus = "ideia" | "rascunho" | "aprovado" | "agendado" | "publicado";

export type Opportunity = "baixa" | "media" | "alta";

export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  avatar_url: string | null;
};

export type Site = {
  id: string;
  name: string;
  url: string;
  platform: Platform;
  niche: string | null;
  audience: string | null;
  description: string | null;
  business_facts: string | null;
  competitors: string[];
  tone: string;
  language: string;
  image_style: string;
  plan: string;
  brand_words: string[];
  banned_words: string[];
  cta_text: string | null;
  posts_per_week: number;
  autopublish: boolean;
  connection_status: "desconectado" | "conectado" | "erro";
  gsc_property: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  site_id: string;
  keyword_id: string | null;
  title: string;
  slug: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[];
  brief: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  status: ArticleStatus;
  scheduled_for: string | null;
  published_at: string | null;
  published_url: string | null;
  word_count: number;
  starred: boolean;
  volume: number | null;
  difficulty: number | null;
  opportunity: Opportunity | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
};

export type Keyword = {
  id: string;
  site_id: string;
  term: string;
  volume: number | null;
  difficulty: number | null;
  intent: "informacional" | "comercial" | "transacional" | "navegacional" | null;
  opportunity: Opportunity | null;
  trend: number[] | null;
  cpc: number | null;
  cluster: string | null;
  source: "manual" | "sugerida" | "gerada" | "search_console";
  status: "sugerida" | "salva" | "em_uso" | "descartada";
  seed: string | null;
  metrics_updated_at: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  site_id: string;
  kind: "produto" | "servico";
  name: string;
  description: string | null;
  price: number | null;
  url: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string;
};

export type Metric = {
  article_id: string | null;
  date: string;
  clicks: number;
  impressions: number;
  position: number | null;
};

export const STATUS_LABEL: Record<ArticleStatus, string> = {
  ideia: "Ideia",
  rascunho: "Rascunho",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
};

export const STATUS_ORDER: ArticleStatus[] = ["ideia", "rascunho", "aprovado", "agendado", "publicado"];

export const OPPORTUNITY_LABEL: Record<Opportunity, string> = { baixa: "Baixa", media: "Média", alta: "Alta" };

export const PLATFORM_LABEL: Record<Platform, string> = {
  wordpress: "WordPress",
  github: "GitHub + Vercel (site estático)",
  webhook: "Webhook (qualquer site)",
  shopify: "Shopify",
  nuvemshop: "Nuvemshop",
  outro: "Outra plataforma",
};

export const TONES = [
  { value: "profissional", label: "Profissional", example: "Explicamos cada etapa com clareza e dados." },
  { value: "proximo", label: "Próximo e acolhedor", example: "Sabe aquela dúvida que todo mundo tem? Bora resolver." },
  { value: "tecnico", label: "Técnico e detalhado", example: "A métrica considera três variáveis principais…" },
  { value: "descontraido", label: "Descontraído", example: "Spoiler: dá pra fazer isso em 10 minutos." },
  { value: "vendedor", label: "Persuasivo", example: "Se você quer resultado rápido, comece por aqui." },
];

export const IMAGE_STYLES = [
  { value: "realista", label: "Realista", hint: "Fotografia natural" },
  { value: "minimalista", label: "Minimalista", hint: "Formas simples, muito respiro" },
  { value: "cartoon", label: "Cartoon", hint: "Traço divertido e colorido" },
  { value: "ilustracao", label: "Ilustração flat", hint: "Vetores com cores chapadas" },
  { value: "3d", label: "3D", hint: "Objetos renderizados, luz suave" },
  { value: "aquarela", label: "Aquarela", hint: "Textura artesanal" },
];
