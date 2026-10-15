"use server";

import { requireSite } from "@/lib/session";
import { AI_ACTIONS, type AiActionId } from "@/lib/ai";

export type AiResult =
  | { ok: true; html?: string; text?: string; options?: string[]; imageUrl?: string }
  | { ok: false; error: string; notConfigured?: boolean };

/**
 * Ponto único de entrada da IA do editor.
 * Hoje responde "não configurado". Para ligar: chamar o modelo aqui com o contexto do site
 * (descrição, tom, produtos, estilo de imagem) e devolver `html`, `text`, `options` ou `imageUrl`.
 */
export async function runAiAction(input: {
  action: AiActionId;
  articleId: string;
  selection?: string;
  prompt?: string;
}): Promise<AiResult> {
  await requireSite(); // garante que só usuários logados chamam
  const action = AI_ACTIONS.find((a) => a.id === input.action);
  if (!action) return { ok: false, error: "Ação desconhecida." };

  return {
    ok: false,
    notConfigured: true,
    error: `“${action.label}” ficará disponível quando a IA for conectada. O botão e o fluxo já estão prontos.`,
  };
}
