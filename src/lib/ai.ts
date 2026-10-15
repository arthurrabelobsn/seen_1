// Catálogo das ações de IA do editor. A conexão com o modelo entra em `src/app/(app)/artigos/ai-actions.ts`.

export type AiActionId =
  | "gerar_artigo"
  | "continuar"
  | "incrementar_texto"
  | "incrementar_selecao"
  | "reescrever_selecao"
  | "resumir_selecao"
  | "corrigir_ortografia"
  | "gerar_imagem"
  | "gerar_tabela"
  | "gerar_grafico"
  | "gerar_faq"
  | "sugerir_titulos"
  | "gerar_meta";

export type AiAction = {
  id: AiActionId;
  label: string;
  hint: string;
  group: "Artigo" | "Seleção" | "Inserir" | "SEO";
  /** Precisa de um trecho selecionado no editor. */
  needsSelection?: boolean;
  /** Abre um campo para o usuário descrever o que quer. */
  prompt?: string;
};

export const AI_ACTIONS: AiAction[] = [
  { id: "gerar_artigo", group: "Artigo", label: "Escrever artigo completo", hint: "A partir da palavra-chave e do briefing" },
  { id: "continuar", group: "Artigo", label: "Continuar escrevendo", hint: "Segue do ponto onde o texto parou" },
  { id: "incrementar_texto", group: "Artigo", label: "Incrementar texto", hint: "Aprofunda seções curtas e adiciona exemplos" },
  { id: "corrigir_ortografia", group: "Artigo", label: "Corrigir ortografia e gramática", hint: "Revisa o artigo inteiro" },

  { id: "incrementar_selecao", group: "Seleção", needsSelection: true, label: "Incrementar seleção", hint: "Expande o trecho selecionado" },
  { id: "reescrever_selecao", group: "Seleção", needsSelection: true, label: "Alterar seleção", hint: "Reescreve do jeito que você pedir", prompt: "Como quer que o trecho fique? Ex.: mais curto, mais persuasivo, em tópicos." },
  { id: "resumir_selecao", group: "Seleção", needsSelection: true, label: "Resumir seleção", hint: "Deixa o trecho mais direto" },

  { id: "gerar_imagem", group: "Inserir", label: "Gerar imagem", hint: "No estilo padrão do site", prompt: "Descreva a imagem. Ex.: mulher aplicando blush em frente ao espelho, luz natural." },
  { id: "gerar_tabela", group: "Inserir", label: "Gerar tabela", hint: "Comparativo ou resumo em tabela", prompt: "O que a tabela deve comparar? Ex.: tipos de blush por tipo de pele." },
  { id: "gerar_grafico", group: "Inserir", label: "Gerar gráfico", hint: "A partir de dados citados no texto", prompt: "Que dados o gráfico deve mostrar?" },
  { id: "gerar_faq", group: "Inserir", label: "Gerar perguntas frequentes", hint: "Seção de FAQ com as dúvidas mais buscadas" },

  { id: "sugerir_titulos", group: "SEO", label: "Sugerir títulos", hint: "5 opções com a palavra-chave" },
  { id: "gerar_meta", group: "SEO", label: "Gerar meta description", hint: "Entre 120 e 160 caracteres" },
];
