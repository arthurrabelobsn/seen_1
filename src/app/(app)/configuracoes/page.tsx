import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { SiteForm } from "./site-form";
import { deleteSite } from "./actions";

export const metadata: Metadata = { title: "Configurações do site" };

export default async function SettingsPage({ searchParams }: PageProps<"/configuracoes">) {
  const params = await searchParams;
  const { currentSite, sites } = await getSession();
  const creating = params.novo === "1" || !currentSite;
  const site = creating ? null : currentSite;

  return (
    <>
      <PageHeader
        title={creating ? "Cadastrar site" : "Configurações do site"}
        description={
          creating
            ? "Quanto mais você contar sobre o negócio, menos genéricos ficam os artigos."
            : `Ajuste como os artigos de ${site?.name} são planejados e publicados.`
        }
        actions={
          !creating ? (
            <Link href="/configuracoes?novo=1" className="btn-ghost">
              Adicionar outro site
            </Link>
          ) : sites.length > 0 ? (
            <Link href="/configuracoes" className="btn-ghost">
              Cancelar
            </Link>
          ) : null
        }
      />

      <SiteForm key={site?.id ?? "novo"} site={site} />

      {site && (
        <section className="card mt-8 border-bad/30 p-6">
          <h2 className="font-semibold text-bad">Excluir site</h2>
          <p className="mt-1 text-sm text-muted">
            Apaga o site e todos os artigos e métricas dele no Rankflow. Nada é apagado do site publicado.
          </p>
          <form action={deleteSite} className="mt-4 flex flex-wrap items-end gap-3">
            <input type="hidden" name="id" value={site.id} />
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
      )}
    </>
  );
}
