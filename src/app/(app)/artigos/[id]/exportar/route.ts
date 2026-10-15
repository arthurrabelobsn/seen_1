import { NextResponse, type NextRequest } from "next/server";
import HTMLtoDOCX from "html-to-docx";
import { createClient } from "@/lib/supabase/server";
import { toHtml } from "@/lib/content";
import { slugify } from "@/lib/seo";

// O Word perde espaços colados a negrito/itálico/links; troca por espaço fixo.
const keepSpaces = (h: string) =>
  h
    .replace(/(<\/(?:strong|em|u|s|a|mark|code)>) /g, "$1&nbsp;")
    .replace(/ (<(?:strong|em|u|s|a|mark|code)[\s>])/g, "&nbsp;$1");

/** Baixa a imagem e embute no documento (o Word não busca imagens da internet). */
async function inlineImages(html: string) {
  const srcs = [...new Set([...html.matchAll(/<img[^>]+src="(https?:[^"]+)"/gi)].map((m) => m[1]))].slice(0, 20);
  for (const src of srcs) {
    try {
      const res = await fetch(src, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error();
      const type = res.headers.get("content-type") ?? "image/png";
      if (!/^image\/(png|jpe?g|gif)/.test(type)) throw new Error(); // webp/svg: o Word não abre
      const b64 = Buffer.from(await res.arrayBuffer()).toString("base64");
      html = html.split(`src="${src}"`).join(`src="data:${type};base64,${b64}"`);
    } catch {
      html = html.replace(new RegExp(`<img[^>]+src="${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`, "g"), "");
    }
  }
  return html;
}

export async function GET(request: NextRequest, ctx: RouteContext<"/artigos/[id]/exportar">) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: article } = await supabase.from("articles").select("title, content, meta_description").eq("id", id).maybeSingle();
  if (!article) return new NextResponse("Artigo não encontrado.", { status: 404 });

  const body = await inlineImages(toHtml(article.content));
  const html = keepSpaces(`<h1>${article.title.replace(/</g, "&lt;")}</h1>${body}`);
  const buffer = (await HTMLtoDOCX(html, null, {
    title: article.title,
    description: article.meta_description ?? "",
    creator: "Seen",
    lang: "pt-BR",
    font: "Arial",
    table: { row: { cantSplit: true } },
  })) as Buffer;

  const name = `${slugify(article.title) || "artigo"}.docx`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}
