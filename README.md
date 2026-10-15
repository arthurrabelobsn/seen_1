# Seen

SEO no piloto automático: planeja, escreve, publica e mede artigos de blog nos sites dos clientes.

## Telas

| Tela | Rota | O que faz |
| --- | --- | --- |
| Login | `/login` | Entrar, criar conta, recuperar senha e trocar de usuário |
| Calendário | `/calendario` | Mês em tela cheia; cards com status, título, início do texto, volume e "Ver artigo"; arraste para reagendar; painel "Sem data" |
| Artigos | `/artigos` | Pastas (Todos, Recomendados, Favoritos, Agendados, Em produção, Publicados), oportunidade, dificuldade 0–10, volume e botão Agendar |
| Criar artigo | `/artigos/novo` | Escolhe uma keyword salva (traz as métricas dela), título, briefing e data |
| Editor | `/artigos/[id]` | Editor visual (títulos, negrito, itálico, sublinhado, links, listas, tabelas, imagens, gráficos), menu "Gerar com IA", score de SEO 0–100 com sugestões, agendar, favoritar, exportar Word/PDF/HTML |
| Keywords | `/keywords` | Adicionar em massa, gerar a partir de temas (IA), em alta, tabela com volume, tendência, dificuldade e oportunidade |
| Resultados | `/resultados` | Cliques, impressões, CTR e posição; gráficos diários; tabela por artigo |
| Site | `/site` | Visão geral, Marca e IA (descrição, tom de voz, estilo de imagem), Produtos e serviços, Conexões, Plano, Avançado |
| Perfil | `/perfil` | Foto, nome, empresa, senha |

**Prontos na interface, aguardando conexão:** IA (todas as ações do menu "Gerar com IA" e a geração de keywords), dados do Google (volume, dificuldade, tendência, Search Console) e os conectores de publicação. Os pontos de ligação ficam em:

- `src/app/(app)/artigos/ai-actions.ts` → `runAiAction`
- `src/app/(app)/keywords/actions.ts` → `generateKeywords`, `refreshKeywordMetrics`
- `src/lib/content.ts` → `computeOpportunity` (regra de oportunidade a partir de volume e dificuldade)

## Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts`)
- Supabase: autenticação, Postgres com RLS e Storage (bucket `media`)
- Tailwind CSS 4, TipTap (editor), Lucide (ícones), `html-to-docx` (Word)
- Fonte Satoshi, servida pelo Fontshare; Geist empacotada como reserva

## Banco de dados

Rode no Supabase (**SQL Editor → New query → cole o arquivo inteiro → Run**), nesta ordem:

1. `supabase/migrations/0001_schema_inicial.sql`
2. `supabase/migrations/0002_site_keywords_produtos.sql` (produtos, keywords com métricas, pastas de artigos, foto de perfil e o bucket de imagens)

Enquanto a 0002 não for aplicada, o app mostra um aviso no topo.

## Como rodar

```bash
npm install
cp .env.example .env.local   # URL e chave publishable do Supabase
npm run dev
```

No Supabase, em **Authentication → URL Configuration**, coloque a URL do site em *Site URL* e `<URL>/auth/callback` em *Redirect URLs*.

Para a confirmação por e-mail funcionar em qualquer navegador, troque o link do template **Authentication → Emails → Confirm signup** por:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/novo-site
```

## Estrutura

```
src/
  proxy.ts                     protege as rotas e renova a sessão
  app/
    login/                     login e ações de autenticação
    auth/callback/             destino dos links enviados por e-mail
    imprimir/[id]/             página limpa para salvar o artigo em PDF
    (app)/                     tudo que exige login, com o menu lateral
      calendario/ artigos/ keywords/ resultados/ site/ perfil/ novo-site/
  components/
    editor/                    editor visual, diálogos de link, imagem e gráfico
    sidebar.tsx                menu lateral, seletor de site, menu do usuário
  lib/
    seo.ts                     score de SEO on-page
    ai.ts                      catálogo das ações de IA
    supabase/                  clientes do Supabase (servidor e navegador)
public/brand/                  logos da Seen
supabase/migrations/           schema do banco
```
