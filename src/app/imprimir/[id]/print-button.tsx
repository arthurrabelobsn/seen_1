"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintButton() {
  // Abre a janela de impressão assim que a página carrega
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      <Printer className="size-4" /> Salvar PDF
    </button>
  );
}
