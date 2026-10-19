import { BarChart3, Plug, Rocket, Sparkles, UserRound } from "lucide-react";
import type { CategoryId } from "@/lib/ajuda";

export const CATEGORY_STYLE: Record<CategoryId, { icon: typeof Rocket; colors: [string, string] }> = {
  "primeiros-passos": { icon: Rocket, colors: ["#003bb3", "#4f8bff"] },
  "seo-geo": { icon: Sparkles, colors: ["#2a0b63", "#9b5cff"] },
  resultados: { icon: BarChart3, colors: ["#002a5c", "#00a3ff"] },
  integracoes: { icon: Plug, colors: ["#003b2f", "#18b38a"] },
  conta: { icon: UserRound, colors: ["#3a2a00", "#f0a020"] },
};
