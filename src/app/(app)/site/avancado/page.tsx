import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { deleteSite } from "../actions";
import { AdvancedForm } from "./advanced-form";

export const metadata: Metadata = { title: "Avançado" };

export default async function AdvancedPage() {
  const { site } = await requireSite();
  return (
    <div className="space-y-6">
      <AdvancedForm site={site} />

      <section className="card border-bad/30 p-6">
        <h2 className="text-lg font-bold text-bad">Excluir site</h2>
        <p className="mt-1 text-sm text-muted">
          Apaga o site e todos os artigos, keywords, produtos e métricas dele na Seen. Nada é apagado do site publicado.
        </p>
        <form action={deleteSite} className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="confirm" className="label">
              Digite <span className="font-mono">EXCLUIR</span> para confirmar
            </label>
            <input id="confirm" name="confirm" className="field w-48" autoComplete="off" required pattern="EXCLUIR" />
          </div>
          <button type="submit" className="btn border border-bad/30 bg-bad-soft text-bad hover:bg-bad hover:text-white">
            Excluir site
          </button>
        </form>
      </section>
    </div>
  );
}
