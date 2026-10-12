export type Platform = "wordpress" | "github" | "webhook" | "shopify" | "nuvemshop" | "outro";

export type ArticleStatus = "ideia" | "rascunho" | "aprovado" | "agendado" | "publicado";

export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
};

export type Site = {
  id: string;
  name: string;
  url: string;
  platform: Platform;
  niche: string | null;
  audience: string | null;
  business_facts: string | null;
  competitors: string[];
  tone: string;
  language: string;
  posts_per_week: number;
  autopublish: boolean;
  connection_status: "desconectado" | "conectado" | "erro";
  gsc_property: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  site_id: string;
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
  created_at: string;
  updated_at: string;
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

export const PLATFORM_LABEL: Record<Platform, string> = {
  wordpress: "WordPress",
  github: "GitHub + Vercel (site estático)",
  webhook: "Webhook (qualquer site)",
  shopify: "Shopify",
  nuvemshop: "Nuvemshop",
  outro: "Outra plataforma",
};
