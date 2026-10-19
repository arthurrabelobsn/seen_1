/**
 * Central de ajuda (blog de suporte) da Seen.
 * Para publicar um artigo novo, acrescente um item em ARTICLES. O assistente do chat
 * também usa estes textos e as perguntas de FAQ para responder.
 */

/** Troque pelos canais reais. Deixe whatsapp vazio para esconder a opção. */
export const CONTATO = {
  email: "suporte@seen.com.br",
  /** Só números, com DDI e DDD. Ex.: 5531999998888 */
  whatsapp: "",
  horario: "Segunda a sexta, das 9h às 18h",
};

export type Block = { h2: string } | { p: string } | { ul: string[] } | { steps: string[] } | { tip: string };

export type HelpArticle = {
  slug: string;
  title: string;
  category: CategoryId;
  kind: "Tutorial" | "Artigo" | "Guia";
  minutes: number;
  date: string;
  excerpt: string;
  body: Block[];
  /** Palavras que ajudam o chat a encontrar este artigo */
  tags: string[];
};

export type CategoryId = "primeiros-passos" | "seo-geo" | "resultados" | "integracoes" | "conta";

export const CATEGORIES: { id: CategoryId; name: string; desc: string }[] = [
  { id: "primeiros-passos", name: "Primeiros passos", desc: "Configure o site e crie seus primeiros artigos." },
  { id: "seo-geo", name: "SEO e GEO", desc: "Aprenda a aparecer no Google e nas respostas de IA." },
  { id: "resultados", name: "Resultados", desc: "Entenda os números e saiba quando agir." },
  { id: "integracoes", name: "Integrações", desc: "WordPress, Shopify, Nuvemshop e outras plataformas." },
  { id: "conta", name: "Conta e plano", desc: "Login, senha, perfil e assinatura." },
];

export const ARTICLES: HelpArticle[] = [
  {
    slug: "primeiro-artigo",
    title: "Como criar e agendar seu primeiro artigo",
    category: "primeiros-passos",
    kind: "Tutorial",
    minutes: 4,
    date: "2026-10-12",
    excerpt: "Da palavra-chave ao artigo agendado no calendário, em poucos minutos.",
    tags: ["criar", "artigo", "agendar", "calendario", "publicar", "novo artigo"],
    body: [
      { p: "Todo artigo na Seen nasce de uma palavra-chave: a busca que você quer ganhar no Google. Veja o caminho mais rápido do zero ao artigo agendado." },
      { h2: "Passo a passo" },
      {
        steps: [
          "No menu, clique em Criar artigo.",
          "Escolha uma palavra-chave da lista ou digite uma nova. Prefira as de oportunidade alta.",
          "Revise o título sugerido e clique em Gerar. O texto aparece no editor.",
          "Leia o artigo, ajuste o que precisar e acompanhe a nota de SEO no topo.",
          "Clique em Agendar e escolha a data. O artigo aparece no calendário.",
        ],
      },
      { tip: "Sem tempo para revisar agora? Salve como rascunho: ele fica no painel \"Sem data\" do calendário." },
      { h2: "O que acontece depois" },
      { p: "No dia marcado, a Seen publica o artigo no seu site (se a plataforma estiver conectada) ou avisa que ele está pronto para você publicar. Os primeiros resultados costumam aparecer entre 2 e 6 semanas." },
    ],
  },
  {
    slug: "configurar-marca",
    title: "Configure a marca para artigos com a sua cara",
    category: "primeiros-passos",
    kind: "Tutorial",
    minutes: 3,
    date: "2026-10-10",
    excerpt: "Tom de voz, público, palavras proibidas e produtos: o que preencher em Site → Marca.",
    tags: ["marca", "tom de voz", "publico", "produtos", "configurar", "site"],
    body: [
      { p: "A Seen usa as informações da aba Site para escrever como a sua marca escreveria. Cinco minutos aqui economizam horas de revisão depois." },
      { h2: "O que preencher" },
      {
        ul: [
          "Descrição do negócio: o que você vende, para quem e o que te diferencia.",
          "Público: quem é o cliente ideal e quais dúvidas ele costuma ter.",
          "Tom de voz: mais formal, próximo, técnico ou descontraído.",
          "Palavras da marca e palavras proibidas.",
          "Texto da chamada para ação que aparece no fim dos artigos.",
        ],
      },
      { h2: "Produtos e serviços" },
      { p: "Em Site → Produtos, cadastre o que você vende com link e foto. A Seen recomenda esses itens dentro dos artigos quando fizer sentido para o leitor." },
    ],
  },
  {
    slug: "conectar-site",
    title: "Como conectar seu site para publicar automaticamente",
    category: "integracoes",
    kind: "Tutorial",
    minutes: 4,
    date: "2026-10-08",
    excerpt: "WordPress, Shopify, Nuvemshop, GitHub + Vercel ou webhook: escolha a plataforma em Site → Conexões.",
    tags: ["conectar", "wordpress", "shopify", "nuvemshop", "webhook", "integracao", "publicar automaticamente", "vercel", "github"],
    body: [
      { p: "Com o site conectado, a Seen publica cada artigo sozinha na data agendada, com imagem, categoria e as informações que o Google lê." },
      { h2: "Escolha sua plataforma" },
      {
        steps: [
          "Abra Site → Conexões.",
          "Em Publicação, clique em Usar esta plataforma no cartão do seu site.",
          "Clique em Conectar e siga as instruções da plataforma.",
        ],
      },
      { h2: "Meu site não está na lista" },
      { p: "Use o Webhook: a Seen envia o artigo pronto para um endereço seu, e uma automação (Make, n8n ou Zapier) publica. Se preferir, escolha Outra plataforma e exporte o artigo em Word ou PDF." },
      { tip: "Conecte também o Google Search Console para ver visitas e posições reais em Resultados." },
    ],
  },
  {
    slug: "o-que-e-seo",
    title: "SEO sem complicação: o que é e por que funciona",
    category: "seo-geo",
    kind: "Artigo",
    minutes: 5,
    date: "2026-10-05",
    excerpt: "Como o Google escolhe quem aparece e o que você pode fazer para estar entre os primeiros.",
    tags: ["seo", "google", "ranquear", "posicao", "o que e seo", "otimizacao"],
    body: [
      { p: "SEO (otimização para mecanismos de busca) é o conjunto de práticas que ajudam seu site a aparecer no Google quando alguém procura o que você vende. Diferente de anúncios, o tráfego que vem do SEO não para quando você para de pagar." },
      { h2: "Como o Google decide" },
      {
        ul: [
          "Relevância: a página responde exatamente o que a pessoa buscou?",
          "Qualidade: o conteúdo é completo, atual e fácil de ler?",
          "Confiança: o site é reconhecido no assunto e outros sites citam você?",
          "Experiência: a página carrega rápido e funciona bem no celular?",
        ],
      },
      { h2: "Onde a Seen entra" },
      { p: "A Seen encontra as buscas com mais chance de retorno, escreve artigos pensados para elas, publica com constância e mostra o que está funcionando. Você revisa e aprova." },
      { tip: "Quer se aprofundar? A trilha \"SEO do zero\" explica tudo em 6 episódios curtos." },
    ],
  },
  {
    slug: "o-que-e-geo",
    title: "GEO: como aparecer nas respostas do ChatGPT e do Gemini",
    category: "seo-geo",
    kind: "Artigo",
    minutes: 6,
    date: "2026-10-14",
    excerpt: "As IAs também escolhem fontes. Veja como escrever para ser citado por elas.",
    tags: ["geo", "ia", "chatgpt", "gemini", "perplexity", "inteligencia artificial", "citado"],
    body: [
      { p: "GEO (Generative Engine Optimization) é a otimização para mecanismos de resposta com IA, como ChatGPT, Gemini, Perplexity e a visão geral com IA do Google. Quando alguém pergunta algo a uma IA, ela monta a resposta a partir de poucas fontes, e estar entre elas é a nova vitrine." },
      { h2: "O que faz um conteúdo ser citado" },
      {
        ul: [
          "Respostas diretas logo abaixo de subtítulos em forma de pergunta.",
          "Dados com fonte e data, de preferência próprios.",
          "Autoria clara e informações atualizadas.",
          "Marca mencionada em outros sites do nicho.",
        ],
      },
      { h2: "Na prática, com a Seen" },
      { p: "Os artigos da Seen já saem com perguntas como subtítulos e respostas objetivas no início de cada seção. Acrescente números e experiências do seu negócio na revisão: é isso que torna o conteúdo citável." },
    ],
  },
  {
    slug: "escolher-palavras-chave",
    title: "Guia para escolher palavras-chave",
    category: "seo-geo",
    kind: "Guia",
    minutes: 5,
    date: "2026-09-30",
    excerpt: "Volume, dificuldade e oportunidade: como ler cada número da aba Keywords.",
    tags: ["palavra-chave", "keywords", "volume", "dificuldade", "oportunidade", "escolher"],
    body: [
      { p: "Escolher bem as palavras-chave é metade do trabalho. Na aba Keywords, cada palavra mostra três números." },
      { h2: "O que cada número diz" },
      {
        ul: [
          "Volume: quantas vezes por mês as pessoas buscam aquilo.",
          "Dificuldade: de 0 a 100, o quanto é difícil chegar à primeira página.",
          "Oportunidade: a combinação de volume, dificuldade e relação com o que você vende.",
        ],
      },
      { h2: "Por onde começar" },
      { steps: ["Filtre por oportunidade alta.", "Entre elas, prefira dificuldade abaixo de 30.", "Priorize as que levam naturalmente aos seus produtos."] },
      { tip: "Buscas longas e específicas têm menos volume, mas convertem mais." },
    ],
  },
  {
    slug: "entender-resultados",
    title: "Entendendo a aba Resultados",
    category: "resultados",
    kind: "Guia",
    minutes: 5,
    date: "2026-10-16",
    excerpt: "Aparições, visitas, taxa de cliques, posição média e o Gerenciador de artigos.",
    tags: ["resultados", "visitas", "aparicoes", "posicao", "taxa de cliques", "ctr", "gerenciador", "metricas"],
    body: [
      { p: "A aba Resultados mostra como seus artigos estão indo no Google. Na Visão geral você tem o resumo; no Gerenciador de artigos, a tabela completa." },
      { h2: "As métricas principais" },
      {
        ul: [
          "Aparições: quantas vezes um artigo apareceu nos resultados do Google.",
          "Visitas: quantas pessoas clicaram e chegaram ao seu site.",
          "Taxa de cliques: visitas divididas por aparições.",
          "Posição média: a posição média em que o artigo apareceu. Quanto menor, melhor.",
        ],
      },
      { h2: "Gerenciador de artigos" },
      { p: "Escolha colunas, salve visões e crie métricas próprias com fórmulas, como visitas por mil palavras. Clique em um artigo para ver a análise dele." },
    ],
  },
  {
    slug: "login-e-senha",
    title: "Login, senha e entrar com o Google",
    category: "conta",
    kind: "Tutorial",
    minutes: 3,
    date: "2026-10-18",
    excerpt: "Como trocar a senha, recuperar o acesso e usar sua conta Google.",
    tags: ["senha", "login", "entrar", "recuperar", "esqueci", "google", "conta", "trocar senha", "acesso"],
    body: [
      { h2: "Esqueci minha senha" },
      { steps: ["Na tela de login, clique em Esqueci minha senha.", "Digite seu e-mail e clique em Enviar link.", "Abra o e-mail e crie a nova senha."] },
      { h2: "Trocar a senha" },
      { p: "Logado, vá em Perfil → Trocar senha." },
      { h2: "Entrar com o Google" },
      { p: "Na tela de login, clique em Continuar com Google. Se você já tem conta com o mesmo e-mail, as duas formas de entrar levam à mesma conta." },
      { tip: "Não recebeu o e-mail? Confira o spam e a aba Promoções." },
    ],
  },
  {
    slug: "planos-e-sites",
    title: "Planos, sites e troca de site",
    category: "conta",
    kind: "Artigo",
    minutes: 3,
    date: "2026-10-01",
    excerpt: "Cada site tem o próprio plano. Veja como adicionar sites e alternar entre eles.",
    tags: ["plano", "assinatura", "pro", "sites", "trocar site", "adicionar site", "pagamento"],
    body: [
      { p: "Na Seen, o plano é por site. Você pode ter vários sites na mesma conta, cada um com seus artigos, keywords e resultados." },
      { h2: "Adicionar ou trocar de site" },
      { p: "Clique no nome do site no topo do menu. Ali você alterna entre os sites ou cadastra um novo." },
      { h2: "Ver ou mudar o plano" },
      { p: "Abra Site → Plano para ver o que está incluído. Para mudar de plano, fale com a equipe." },
    ],
  },
];

/** Perguntas rápidas que o chat responde direto */
export const FAQ: { q: string; a: string; tags: string[]; link?: string }[] = [
  {
    q: "Quanto tempo leva para ter resultado?",
    a: "Os primeiros sinais no Google costumam aparecer entre 2 e 6 semanas. Resultados mais sólidos vêm entre 3 e 6 meses de publicação constante.",
    tags: ["tempo", "demora", "quanto tempo", "resultado", "quando"],
    link: "o-que-e-seo",
  },
  {
    q: "Quantos artigos devo publicar por semana?",
    a: "O ideal é o que você consegue revisar com calma. Para a maioria dos sites, 2 a 3 artigos por semana já trazem bons resultados. Constância vale mais que volume.",
    tags: ["quantos", "frequencia", "por semana", "quantidade", "artigos"],
  },
  {
    q: "Posso editar o artigo depois de publicado?",
    a: "Pode. Abra o artigo e faça as alterações: o botão Salvar vira Atualizar, e a nova versão substitui a publicada.",
    tags: ["editar", "alterar", "atualizar", "publicado", "mudar"],
  },
  {
    q: "A Seen publica sozinha no meu site?",
    a: "Sim, quando a plataforma do site está conectada em Site → Conexões. Sem conexão, você exporta o artigo em Word ou PDF e publica manualmente.",
    tags: ["publica sozinha", "automatico", "publicar", "conectar"],
    link: "conectar-site",
  },
  {
    q: "Os textos são originais?",
    a: "Sim. Cada artigo é escrito do zero para a sua palavra-chave e a sua marca. Recomendamos revisar e acrescentar experiências próprias, o que deixa o texto ainda mais único.",
    tags: ["original", "plagio", "copiado", "unico", "ia"],
  },
  {
    q: "Como cancelo ou mudo meu plano?",
    a: "Em Site → Plano você vê o plano de cada site. Para mudar ou cancelar, fale com a equipe pelos canais de contato desta página.",
    tags: ["cancelar", "plano", "mudar plano", "assinatura", "pagamento", "cobranca"],
    link: "planos-e-sites",
  },
];

export function getArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}

export const categoryName = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)?.name ?? "";

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");

/** Busca simples por palavras: título, resumo e tags */
export function searchArticles(query: string, limit = 5) {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 2);
  if (!words.length) return [];
  return ARTICLES.map((a) => {
    const hay = normalize([a.title, a.excerpt, ...a.tags].join(" "));
    const tagHay = normalize(a.tags.join(" "));
    const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0) + (tagHay.includes(w) ? 1 : 0), 0);
    return { a, score };
  })
    .filter((r) => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((r) => r.a);
}

export function answerQuestion(query: string) {
  const words = normalize(query).split(/\s+/).filter((w) => w.length > 2);
  const q = normalize(query);
  let best: (typeof FAQ)[number] | null = null;
  let bestScore = 0;
  for (const f of FAQ) {
    const score =
      f.tags.reduce((s, t) => s + (q.includes(normalize(t)) ? 2 : 0), 0) +
      words.reduce((s, w) => s + (normalize(f.q).includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      best = f;
      bestScore = score;
    }
  }
  return { faq: bestScore >= 2 ? best : null, articles: searchArticles(query, 3) };
}
