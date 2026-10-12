import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { NewArticleForm } from "./new-article-form";

export const metadata: Metadata = { title: "Criar artigo" };

export default async function NewArticlePage({ searchParams }: PageProps<"/artigos/novo">) {
  const params = await searchParams;
  const { site } = await requireSite();
  const date = typeof params.data === "string" ? params.data : "";

  return (
    <>
      <PageHeader
        title="Criar artigo"
        description={`Defina o tema e a palavra-chave. O texto você escreve (ou gera) no próximo passo, em ${site.name}.`}
      />
      <NewArticleForm defaultDate={date} />
    </>
  );
}
