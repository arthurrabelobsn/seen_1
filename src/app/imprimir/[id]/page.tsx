import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toHtml } from "@/lib/content";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Exportar PDF" };

// Página limpa, só com o artigo, para salvar como PDF pelo navegador.
export default function PrintPage({ params }: PageProps<"/imprimir/[id]">) {
  return (
    <Suspense>
      <Printable params={params} />
    </Suspense>
  );
}

async function Printable({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: article } = await supabase.from("articles").select("title, content, cover_image").eq("id", id).maybeSingle();
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <div className="no-print sticky top-0 flex items-center justify-between border-b border-line bg-white px-6 py-3 text-sm">
        <span className="text-muted">Na janela de impressão, escolha “Salvar como PDF”.</span>
        <PrintButton />
      </div>
      <article className="mx-auto max-w-[720px] px-6 py-10">
        <h1 className="mb-6 text-[32px] font-bold leading-tight tracking-tight">{article.title}</h1>
        <div className="article-body" dangerouslySetInnerHTML={{ __html: toHtml(article.content) }} />
      </article>
    </main>
  );
}
