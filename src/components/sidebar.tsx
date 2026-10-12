"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  FileText,
  LogOut,
  Menu,
  PenLine,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { chooseSite } from "@/app/(app)/actions";
import { signOut } from "@/app/login/actions";

const NAV = [
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/artigos", label: "Artigos", icon: FileText },
  { href: "/artigos/novo", label: "Criar artigo", icon: PenLine },
  { href: "/resultados", label: "Resultados", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações do site", icon: Settings },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

type Props = {
  userName: string;
  userEmail: string;
  sites: { id: string; name: string }[];
  currentSiteId: string | null;
};

export function Sidebar({ userName, userEmail, sites, currentSiteId }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/artigos"
      ? pathname === "/artigos" || (pathname.startsWith("/artigos/") && pathname !== "/artigos/novo")
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Barra superior no celular */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Brand />
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-canvas" aria-label="Abrir menu">
          <Menu className="size-5" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Brand />
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-canvas lg:hidden" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        {/* Seletor de site */}
        <div className="px-4 pb-4">
          {sites.length > 0 ? (
            <form action={chooseSite}>
              <label htmlFor="site_id" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted">
                Site
              </label>
              <select
                id="site_id"
                name="site_id"
                defaultValue={currentSiteId ?? undefined}
                onChange={(e) => e.currentTarget.form?.requestSubmit()}
                className="field py-1.5"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </form>
          ) : (
            <Link href="/configuracoes?novo=1" className="btn-primary w-full" onClick={() => setOpen(false)}>
              Cadastrar primeiro site
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active ? "bg-brand-soft font-medium text-brand-strong" : "text-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon className="size-4.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line p-4">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted">{userEmail}</p>
          <form action={signOut} className="mt-3">
            <button type="submit" className="flex items-center gap-2 text-sm text-muted hover:text-ink">
              <LogOut className="size-4" /> Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/calendario" className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <rect width="32" height="32" rx="8" className="fill-brand" />
        <path d="M8 22l5-6 4 3 7-9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-semibold tracking-tight">Rankflow</span>
    </Link>
  );
}
