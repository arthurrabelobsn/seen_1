/**
 * Trilhas: mini cursos de SEO, GEO e uso da Seen.
 * Para adicionar um curso, inclua um item em COURSES e coloque o id dele em alguma fileira de ROWS.
 * Para ligar um vídeo a um episódio, preencha `video` com o link do YouTube ou Vimeo.
 */

export type Episode = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  points: string[];
  /** Link do YouTube/Vimeo. Sem link, o episódio mostra "vídeo em produção" e o resumo em texto. */
  video?: string;
};

export type Course = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  /** Cores do pôster (de → para) e o desenho de fundo */
  colors: [string, string];
  art: "rings" | "grid" | "waves" | "orbit" | "bars" | "pin" | "spark" | "steps";
  badge?: string;
  episodes: Episode[];
};

export const COURSES: Course[] = [
  {
    id: "comece-com-a-seen",
    title: "Comece com a Seen",
    tagline: "Do cadastro ao primeiro artigo publicado.",
    description:
      "Um passeio rápido pela Seen: como cadastrar o site, escolher palavras-chave, planejar o calendário, revisar artigos e acompanhar os resultados. Ideal para a primeira semana.",
    level: "Iniciante",
    colors: ["#003bb3", "#4f8bff"],
    art: "steps",
    badge: "Comece aqui",
    episodes: [
      {
        slug: "cadastre-seu-site",
        title: "Cadastre seu site e sua marca",
        minutes: 4,
        summary: "Quanto mais a Seen souber sobre o seu negócio, mais os artigos soam como você.",
        points: [
          "Em Site → Marca, descreva o que você vende, para quem e o tom de voz.",
          "Liste produtos e serviços: eles aparecem nos artigos como recomendações naturais.",
          "Adicione concorrentes para a Seen encontrar temas que eles já exploram.",
        ],
      },
      {
        slug: "encontre-keywords",
        title: "Encontre suas palavras-chave",
        minutes: 5,
        summary: "Keywords são as buscas que você quer ganhar. A Seen mostra volume, dificuldade e oportunidade de cada uma.",
        points: [
          "Comece pelas de oportunidade alta e dificuldade baixa: são as vitórias mais rápidas.",
          "Prefira buscas com intenção clara, como \"melhor X para Y\" ou \"como fazer X\".",
          "Transforme uma keyword em artigo com um clique.",
        ],
      },
      {
        slug: "planeje-no-calendario",
        title: "Planeje no calendário",
        minutes: 4,
        summary: "O calendário mostra o que sai em cada dia. Arraste artigos para reagendar.",
        points: [
          "Mantenha uma frequência que você consegue sustentar: constância vale mais que volume.",
          "Use o painel \"Sem data\" como lista de ideias para encaixar depois.",
          "Artigos agendados são publicados sozinhos no dia marcado.",
        ],
      },
      {
        slug: "revise-no-editor",
        title: "Revise e melhore no editor",
        minutes: 6,
        summary: "O editor visual mostra a nota de SEO do artigo e o que falta para chegar a 100.",
        points: [
          "Siga as dicas da nota: título, subtítulos, tamanho e palavra-chave no começo do texto.",
          "Acrescente experiência própria: exemplos reais deixam o texto único.",
          "Exporte em Word ou PDF se alguém precisar aprovar antes.",
        ],
      },
      {
        slug: "publique-e-acompanhe",
        title: "Publique e acompanhe os resultados",
        minutes: 5,
        summary: "Depois de publicado, o artigo começa a aparecer no Google. Em Resultados você vê aparições, visitas e posição.",
        points: [
          "Os primeiros sinais aparecem em 2 a 6 semanas.",
          "Use a Visão geral para o resumo e o Gerenciador para comparar artigos.",
          "Artigo publicado pode ser atualizado: o botão vira \"Atualizar\".",
        ],
      },
    ],
  },
  {
    id: "seo-do-zero",
    title: "SEO do zero",
    tagline: "Entenda como o Google escolhe quem aparece.",
    description:
      "Os fundamentos de SEO sem jargão: como o Google lê páginas, o que é intenção de busca, como montar um artigo que ranqueia e quanto tempo esperar.",
    level: "Iniciante",
    colors: ["#06283d", "#1f9ecf"],
    art: "rings",
    episodes: [
      {
        slug: "como-o-google-funciona",
        title: "Como o Google decide quem aparece",
        minutes: 6,
        summary: "O Google rastreia páginas, entende do que elas tratam e ordena as respostas pela utilidade para quem buscou.",
        points: [
          "Rastrear, indexar e ranquear: são três etapas diferentes.",
          "Relevância (responde a pergunta?) e confiança (quem está falando?) pesam mais que truques.",
          "Página lenta ou confusa perde posições mesmo com bom conteúdo.",
        ],
      },
      {
        slug: "intencao-de-busca",
        title: "Palavras-chave e intenção de busca",
        minutes: 7,
        summary: "Por trás de cada busca existe um objetivo: aprender, comparar, comprar ou achar um lugar.",
        points: [
          "Informacional: \"como limpar couro\". Comercial: \"melhor hidratante para couro\".",
          "Pesquise a palavra no Google e veja que tipo de página aparece: é isso que ele espera.",
          "Um artigo, uma intenção principal.",
        ],
      },
      {
        slug: "anatomia-do-artigo",
        title: "Anatomia de um artigo que ranqueia",
        minutes: 8,
        summary: "Resposta rápida no começo, subtítulos que viram um índice e profundidade onde importa.",
        points: [
          "Responda a pergunta principal nas primeiras linhas.",
          "Use H2 e H3 como perguntas que o leitor faria em seguida.",
          "Imagens, listas e tabelas ajudam a ler e a aparecer em destaques.",
        ],
      },
      {
        slug: "titulo-meta-url",
        title: "Título, meta descrição e URL",
        minutes: 5,
        summary: "É o que a pessoa vê no Google antes de clicar. Bem feito, aumenta a taxa de cliques.",
        points: [
          "Título com até ~60 caracteres e a palavra-chave perto do início.",
          "Meta descrição como um convite: benefício + motivo para clicar.",
          "URL curta, em minúsculas, sem datas.",
        ],
      },
      {
        slug: "links-internos",
        title: "Links internos",
        minutes: 5,
        summary: "Links entre seus próprios artigos mostram ao Google o que é importante e mantêm o leitor no site.",
        points: [
          "Todo artigo novo deve receber links de 2 ou 3 artigos antigos.",
          "Use textos de link descritivos, não \"clique aqui\".",
          "Leve o leitor do artigo para a página de produto quando fizer sentido.",
        ],
      },
      {
        slug: "quanto-tempo-leva",
        title: "Quanto tempo leva",
        minutes: 4,
        summary: "SEO é juros compostos: começa devagar e acelera com o tempo.",
        points: [
          "Primeiros sinais em semanas; resultados sólidos entre 3 e 6 meses.",
          "Sites novos demoram mais para ganhar confiança.",
          "Não apague artigos que ainda não decolaram: melhore-os.",
        ],
      },
    ],
  },
  {
    id: "geo",
    title: "GEO: apareça nas IAs",
    tagline: "Seja a fonte citada pelo ChatGPT, Gemini e Perplexity.",
    description:
      "GEO (Generative Engine Optimization) é o SEO das respostas de inteligência artificial. Veja como essas ferramentas escolhem fontes e como escrever para ser citado.",
    level: "Intermediário",
    colors: ["#2a0b63", "#9b5cff"],
    art: "orbit",
    badge: "Novo",
    episodes: [
      {
        slug: "o-que-e-geo",
        title: "O que é GEO e por que importa",
        minutes: 5,
        summary: "Cada vez mais gente pergunta para uma IA antes de buscar no Google. Ser citado nessas respostas é a nova vitrine.",
        points: [
          "As respostas de IA citam poucas fontes: estar entre elas vale muito.",
          "SEO e GEO se somam: quem ranqueia bem costuma ser citado.",
          "A visão geral com IA do Google também segue essas regras.",
        ],
      },
      {
        slug: "como-as-ias-escolhem",
        title: "Como as IAs escolhem fontes",
        minutes: 7,
        summary: "As IAs buscam trechos claros, atuais e confiáveis que respondam exatamente à pergunta.",
        points: [
          "Respostas diretas em 1 ou 2 frases são fáceis de citar.",
          "Dados com fonte e data aumentam a confiança.",
          "Marcas mencionadas em vários sites ganham peso.",
        ],
      },
      {
        slug: "escreva-para-ser-citado",
        title: "Escreva para ser citado",
        minutes: 6,
        summary: "Estruture o texto em blocos que façam sentido sozinhos.",
        points: [
          "Use perguntas como subtítulos e responda logo abaixo.",
          "Inclua definições, passos numerados e comparações em tabela.",
          "Evite enrolação: cada parágrafo deve trazer uma informação.",
        ],
      },
      {
        slug: "autoridade-e-confianca",
        title: "Autoria, dados e confiança",
        minutes: 6,
        summary: "Quem escreveu, com base em quê e quando: é isso que separa uma fonte de um palpite.",
        points: [
          "Mostre autor, experiência e data de atualização.",
          "Traga números próprios: pesquisas, casos de clientes, testes.",
          "Mantenha os artigos mais acessados sempre atualizados.",
        ],
      },
      {
        slug: "medindo-geo",
        title: "Como medir presença nas IAs",
        minutes: 5,
        summary: "Ainda não existe um \"Search Console das IAs\", mas dá para acompanhar.",
        points: [
          "Faça as perguntas do seu nicho nas IAs e anote quem é citado.",
          "Veja no Analytics as visitas vindas de chatgpt.com e perplexity.ai.",
          "Repita o teste todo mês com as mesmas perguntas.",
        ],
      },
    ],
  },
  {
    id: "estrategia-de-conteudo",
    title: "Estratégia de conteúdo",
    tagline: "Pilares, clusters e um calendário que se sustenta.",
    description:
      "Como organizar os temas do blog para o Google entender que você é referência no assunto, sem escrever artigos que competem entre si.",
    level: "Intermediário",
    colors: ["#003b2f", "#18b38a"],
    art: "grid",
    episodes: [
      {
        slug: "pilares-e-clusters",
        title: "Pilares e clusters",
        minutes: 7,
        summary: "Um artigo pilar cobre o tema amplo; artigos menores aprofundam cada parte e apontam para ele.",
        points: [
          "Escolha 3 a 5 pilares ligados ao que você vende.",
          "Cada pilar ganha de 5 a 15 artigos de apoio.",
          "Todos os artigos de apoio linkam para o pilar.",
        ],
      },
      {
        slug: "funil",
        title: "Topo, meio e fundo de funil",
        minutes: 6,
        summary: "Equilibre artigos que atraem, que educam e que ajudam a decidir a compra.",
        points: [
          "Topo: dúvidas gerais, muito volume e pouca venda direta.",
          "Meio: comparações e guias, onde a confiança é construída.",
          "Fundo: \"melhor X\", \"X vale a pena\", preços. Pouco volume, muita venda.",
        ],
      },
      {
        slug: "calendario-realista",
        title: "Um calendário realista",
        minutes: 4,
        summary: "Melhor 2 artigos bons por semana durante um ano do que 30 em um mês e depois nada.",
        points: [
          "Defina a frequência pelo tempo que você tem para revisar.",
          "Alterne tipos de artigo durante o mês.",
          "Reserve um dia por mês para atualizar artigos antigos.",
        ],
      },
      {
        slug: "atualizar",
        title: "Atualizar vale mais que publicar",
        minutes: 5,
        summary: "Artigos que já estão na página 2 do Google são os mais fáceis de levar para a página 1.",
        points: [
          "Procure artigos com posição entre 8 e 20 no Gerenciador.",
          "Acrescente o que faltou, atualize dados e melhore o título.",
          "Mude a data de atualização, não a URL.",
        ],
      },
      {
        slug: "canibalizacao",
        title: "Quando dois artigos brigam entre si",
        minutes: 5,
        summary: "Dois artigos sobre a mesma busca dividem a força e nenhum ganha.",
        points: [
          "Sinal: duas páginas suas alternando na mesma palavra-chave.",
          "Junte as duas no melhor artigo e redirecione a outra.",
          "Antes de criar, veja se já existe um artigo sobre o tema.",
        ],
      },
    ],
  },
  {
    id: "conteudo-que-vende",
    title: "Conteúdo que vende",
    tagline: "Do artigo ao carrinho, sem parecer anúncio.",
    description: "Como transformar leitores em clientes: chamadas para ação, produtos dentro do texto e artigos de comparação.",
    level: "Intermediário",
    colors: ["#5a1300", "#ff7a3d"],
    art: "bars",
    episodes: [
      {
        slug: "ctas",
        title: "Chamadas para ação que funcionam",
        minutes: 5,
        summary: "Toda página precisa de um próximo passo claro para o leitor.",
        points: [
          "Uma chamada principal por artigo, ligada ao assunto.",
          "Coloque-a depois de resolver a dúvida, não antes.",
          "Configure o texto padrão em Site → Marca.",
        ],
      },
      {
        slug: "produtos-no-texto",
        title: "Produtos dentro do texto",
        minutes: 6,
        summary: "Recomendar o produto certo no momento certo é ajuda, não propaganda.",
        points: [
          "Cadastre os produtos em Site → Produtos com foto e link.",
          "Mostre o produto como solução de um problema citado no artigo.",
          "Seja honesto sobre para quem o produto não serve.",
        ],
      },
      {
        slug: "comparacoes",
        title: "Artigos de comparação",
        minutes: 6,
        summary: "\"X ou Y\" e \"melhores X\" são buscas de quem está quase comprando.",
        points: [
          "Compare com critérios claros em uma tabela.",
          "Mostre prós e contras reais, inclusive dos seus produtos.",
          "Termine com uma recomendação por perfil de cliente.",
        ],
      },
      {
        slug: "prova",
        title: "Prova e confiança",
        minutes: 4,
        summary: "Depoimentos, números e fotos reais vendem mais do que adjetivos.",
        points: [
          "Use casos de clientes com resultados concretos.",
          "Mostre bastidores: processo, equipe, testes.",
          "Responda objeções comuns dentro do artigo.",
        ],
      },
    ],
  },
  {
    id: "lendo-resultados",
    title: "Lendo seus resultados",
    tagline: "O que cada número significa e quando agir.",
    description: "Aparições, visitas, taxa de cliques e posição média explicadas com exemplos, e como usar o Gerenciador de artigos para decidir o próximo passo.",
    level: "Iniciante",
    colors: ["#002a5c", "#00a3ff"],
    art: "waves",
    episodes: [
      {
        slug: "metricas-basicas",
        title: "Aparições, visitas e taxa de cliques",
        minutes: 5,
        summary: "Aparição é quando o artigo aparece no Google; visita é quando alguém clica.",
        points: [
          "Muitas aparições e poucas visitas: melhore título e descrição.",
          "Taxa de cliques = visitas ÷ aparições.",
          "Compare sempre com o período anterior, não com um dia isolado.",
        ],
      },
      {
        slug: "posicao-media",
        title: "Posição média sem susto",
        minutes: 4,
        summary: "É a média das posições em que o artigo apareceu. Quanto menor, melhor.",
        points: [
          "Posição 1 a 3: topo. 4 a 10: primeira página. 11 a 20: segunda.",
          "Oscilar alguns pontos é normal, principalmente nas primeiras semanas.",
          "Olhe a tendência de várias semanas.",
        ],
      },
      {
        slug: "gerenciador",
        title: "Gerenciador de artigos e métricas próprias",
        minutes: 6,
        summary: "Monte a tabela do seu jeito, salve visões e crie métricas com fórmulas.",
        points: [
          "Use as predefinições para começar rápido.",
          "Crie métricas como \"visitas por mil palavras\".",
          "Exporte para planilha quando precisar mostrar para alguém.",
        ],
      },
      {
        slug: "quando-agir",
        title: "Quando agir em um artigo",
        minutes: 5,
        summary: "Nem todo número baixo é problema. Saiba quando mexer e quando esperar.",
        points: [
          "Menos de 6 semanas no ar: espere.",
          "Posição 8 a 20 estável: hora de atualizar.",
          "Queda brusca: confira se algo mudou no site ou no texto.",
        ],
      },
    ],
  },
  {
    id: "seo-local",
    title: "SEO local",
    tagline: "Seja encontrado por quem está perto.",
    description: "Para negócios com endereço ou área de atendimento: Perfil da Empresa no Google, avaliações e artigos com a sua cidade.",
    level: "Iniciante",
    colors: ["#0d3b1e", "#3ccf6e"],
    art: "pin",
    episodes: [
      {
        slug: "perfil-da-empresa",
        title: "Perfil da Empresa no Google",
        minutes: 6,
        summary: "É o cartão que aparece no mapa. Completo e atualizado, ele traz ligações e visitas.",
        points: [
          "Escolha a categoria principal com cuidado.",
          "Adicione fotos reais e horários corretos.",
          "Publique novidades com frequência.",
        ],
      },
      {
        slug: "artigos-locais",
        title: "Artigos com cidade e bairro",
        minutes: 5,
        summary: "\"Onde comprar X em Belo Horizonte\" é uma busca com dinheiro na mão.",
        points: [
          "Crie artigos para as cidades e bairros que você atende.",
          "Cite pontos de referência e particularidades locais.",
          "Não copie o mesmo texto trocando só o nome da cidade.",
        ],
      },
      {
        slug: "avaliacoes",
        title: "Avaliações",
        minutes: 4,
        summary: "Quantidade, nota e respostas influenciam a posição no mapa e a decisão do cliente.",
        points: [
          "Peça avaliação logo após uma boa experiência.",
          "Responda todas, inclusive as negativas.",
          "Nunca compre avaliações.",
        ],
      },
      {
        slug: "dados-consistentes",
        title: "Nome, endereço e telefone iguais em todo lugar",
        minutes: 3,
        summary: "Dados divergentes confundem o Google sobre quem você é.",
        points: [
          "Use o mesmo formato no site, redes e diretórios.",
          "Coloque endereço e telefone no rodapé do site.",
          "Atualize tudo de uma vez se mudar de endereço.",
        ],
      },
    ],
  },
  {
    id: "ia-a-seu-favor",
    title: "IA a seu favor",
    tagline: "Artigos com a sua cara, não com cara de robô.",
    description: "Como dar boas instruções para a IA da Seen, revisar o que ela escreve e manter a voz da sua marca.",
    level: "Iniciante",
    colors: ["#3d0030", "#ff4fa3"],
    art: "spark",
    episodes: [
      {
        slug: "briefing",
        title: "O briefing que gera bons artigos",
        minutes: 5,
        summary: "A IA escreve melhor quando sabe para quem, por quê e com que exemplos.",
        points: [
          "Diga quem é o leitor e o que ele precisa resolver.",
          "Inclua fatos do negócio que só você sabe.",
          "Peça o formato: lista, guia, comparação.",
        ],
      },
      {
        slug: "revisao",
        title: "Revisando texto de IA",
        minutes: 6,
        summary: "Revisar é onde o artigo deixa de ser genérico.",
        points: [
          "Corte frases vazias e repetições.",
          "Confira números, datas e nomes.",
          "Acrescente uma opinião ou experiência sua.",
        ],
      },
      {
        slug: "tom-de-voz",
        title: "Tom de voz da marca",
        minutes: 4,
        summary: "Configure uma vez e todos os artigos seguem o mesmo jeito de falar.",
        points: [
          "Em Site → Marca, escolha o tom e dê exemplos.",
          "Liste palavras que a marca usa e as que ela nunca usa.",
          "Ajuste quando sentir que o texto não soa como você.",
        ],
      },
      {
        slug: "acoes-de-ia",
        title: "As ações de IA do editor",
        minutes: 5,
        summary: "Reescrever, expandir, resumir e mudar o tom de um trecho sem sair do editor.",
        points: [
          "Selecione o trecho e escolha a ação.",
          "Use \"expandir\" onde o artigo ficou raso.",
          "Use \"simplificar\" em explicações técnicas.",
        ],
      },
    ],
  },
];

export const ROWS: { title: string; ids: string[] }[] = [
  { title: "Comece por aqui", ids: ["comece-com-a-seen", "lendo-resultados", "seo-do-zero", "ia-a-seu-favor"] },
  { title: "Em alta: GEO e inteligência artificial", ids: ["geo", "ia-a-seu-favor", "estrategia-de-conteudo"] },
  { title: "Para crescer mais rápido", ids: ["estrategia-de-conteudo", "conteudo-que-vende", "seo-local", "geo"] },
  { title: "Fundamentos de SEO", ids: ["seo-do-zero", "seo-local", "lendo-resultados"] },
];

export const FEATURED_ID = "geo";

export function getCourse(id: string) {
  return COURSES.find((c) => c.id === id);
}

export function courseMinutes(c: Course) {
  return c.episodes.reduce((s, e) => s + e.minutes, 0);
}

/** Chave usada para marcar um episódio como assistido */
export const epKey = (courseId: string, slug: string) => `${courseId}/${slug}`;

export const PROGRESS_KEY = "seen.trilhas.assistidos";
