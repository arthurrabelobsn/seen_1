import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SeenLogo } from "@/components/brand";
import { ChatWidget } from "./chat-widget";

export const metadata: Metadata = {
  title: { default: "Central de ajuda", template: "%s · Ajuda Seen" },
  description: "Artigos, tutoriais e suporte da Seen: SEO e GEO no piloto automático.",
};

export default function HelpLayout({ children }: LayoutProps<"/ajuda">) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
          <Link href="/ajuda" className="flex items-center gap-2.5">
            <SeenLogo className="h-[20px] w-auto" />
            <span className="hidden border-l border-line pl-2.5 text-sm font-semibold text-muted sm:inline">Central de ajuda</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link href="/ajuda#artigos" className="hidden rounded-lg px-3 py-2 text-muted hover:text-ink md:inline">
              Artigos
            </Link>
            <Link href="/ajuda#contato" className="hidden rounded-lg px-3 py-2 text-muted hover:text-ink md:inline">
              Contato
            </Link>
            <Link href="/trilhas" className="hidden rounded-lg px-3 py-2 text-muted hover:text-ink md:inline">
              Trilhas
            </Link>
            <Link href="/calendario" className="btn-primary ml-2 rounded-full px-4">
              Abrir a Seen <ArrowUpRight className="size-4" />
            </Link>
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <SeenLogo className="h-4 w-auto" />
            <span>SEO e GEO no piloto automático.</span>
          </div>
          <span>© Seen</span>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
