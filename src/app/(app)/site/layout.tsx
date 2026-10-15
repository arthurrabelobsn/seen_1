import { requireSite } from "@/lib/session";
import { ProBadge } from "@/components/brand";
import { PLATFORM_LABEL } from "@/lib/types";
import { SiteTabs } from "./site-tabs";
import { SiteIcon } from "@/components/site-icon";

export default async function SiteLayout({ children }: LayoutProps<"/site">) {
  const { site } = await requireSite();
  const host = site.url.replace(/^https?:\/\//, "");

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-6 flex flex-wrap items-center gap-4">
        <SiteIcon url={site.url} size={56} className="rounded-2xl bg-surface p-2.5" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-[28px] font-bold leading-tight tracking-tight">{site.name}</h1>
            {site.plan === "pro" && <ProBadge />}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <a href={site.url} target="_blank" rel="noreferrer" className="hover:text-brand hover:underline">
              {host}
            </a>
            <span aria-hidden>·</span>
            <span>{PLATFORM_LABEL[site.platform]}</span>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${site.connection_status === "conectado" ? "bg-good" : "bg-line"}`} />
              {site.connection_status === "conectado" ? "Conectado" : "Não conectado"}
            </span>
          </div>
        </div>
      </header>

      <SiteTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
