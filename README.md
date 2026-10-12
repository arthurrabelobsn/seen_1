# Rankflow

Piloto automático de SEO: planeja, escreve, publica e mede artigos de blog nos sites dos clientes.

> "Rankflow" é um nome provisório. Troque em `src/app/layout.tsx`, `src/app/login/page.tsx` e `src/components/sidebar.tsx`.

## O que já existe (Fase 1, parte 1)

| Tela | Rota | O que faz |
| --- | --- | --- |
| Login | `/login` | Entrar, criar conta e recuperar senha (Supabase Auth, e-mail e senha) |
| Calendário | `/calendario` | Mês com os artigos por data; arraste para reagendar ou para "Sem data" |
| Artigos | `/artigos` | Lista com filtro por status e busca |
| Criar artigo | `/artigos/novo` | Palavra-chave, título, briefing e data |
| Editor | `/artigos/[id]` | Markdown com prévia, campos de SEO, prévia no Google e checklist on-page com nota |
| Resultados | `/resultados` | Cliques, impressões, CTR e posição; gráficos diários; tabela por artigo com oportunidades (posições 5 a 20) |
| Configurações do site | `/configuracoes` | Site, plataforma, dados do negócio, concorrentes, tom de voz, ritmo e publicação automática |
| Perfil | `/perfil` | Nome, empresa, troca de senha |

Um usuário pode ter vários sites; o seletor fica no menu lateral.

**Ainda não ligado (próximas etapas):** geração de texto com IA, conectores de publicação (WordPress, GitHub), Search Console. Enquanto o Search Console não está conectado, a tela de Resultados tem um botão para carregar dados de exemplo.

## Stack

- Next.js 16 (App Router, Server Actions, `proxy.ts` no lugar do antigo middleware)
- Supabase: autenticação + Postgres com RLS
- Tailwind CSS 4, ícones Lucide, Markdown com `marked`

## Como rodar

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (região São Paulo).
2. **SQL Editor → New query**: cole o conteúdo de `supabase/migrations/0001_schema_inicial.sql` e clique em **Run**.
3. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (depois troque pela URL da Vercel)
   - *Redirect URLs*: adicione `http://localhost:3000/auth/callback` e, depois do deploy, `https://SEU-DOMINIO/auth/callback`
4. Opcional, para testar mais rápido: **Authentication → Sign In / Providers → Email** e desligue *Confirm email*. Assim a conta entra direto, sem o link de confirmação.

### 2. Projeto local

```bash
npm install
cp .env.example .env.local   # preencha a URL e a chave do Supabase
npm run dev
```

Abra http://localhost:3000, crie sua conta e cadastre o primeiro site.

### 3. Deploy na Vercel

1. Importe o repositório do GitHub na Vercel.
2. Em *Environment Variables*, adicione as mesmas variáveis do `.env.local`.
3. Depois do primeiro deploy, adicione a URL da Vercel no *Site URL* e nos *Redirect URLs* do Supabase.

## Estrutura

```
src/
  proxy.ts                    protege as rotas e renova a sessão
  app/
    login/                    tela de login e ações de autenticação
    auth/callback/            destino dos links enviados por e-mail
    (app)/                    tudo que exige login, com o menu lateral
      calendario/  artigos/  resultados/  configuracoes/  perfil/
  components/                 menu lateral, cabeçalho, gráfico
  lib/
    supabase/                 clientes do Supabase
    session.ts                usuário, perfil, sites e site atual
    seo.ts                    checklist on-page e contagem de palavras
supabase/migrations/          schema do banco
```

## Observações

- Cada tabela tem `user_id` e políticas RLS: um cliente nunca vê dados de outro, mesmo que o código erre um filtro.
- O Next.js 16 vem com *Cache Components* ligado. Por isso o painel fica dentro de `<Suspense>` e o cliente do Supabase chama `connection()`.
- No log do servidor pode aparecer um aviso sobre `Date.now()` vindo da biblioteca do Supabase ao iniciar a sessão. Ele não afeta as páginas.
