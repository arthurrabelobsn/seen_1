"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/site", label: "Visão geral" },
  { href: "/site/marca", label: "Marca e IA" },
  { href: "/site/produtos", label: "Produtos e serviços" },
  { href: "/site/conexoes", label: "Conexões" },
  { href: "/site/plano", label: "Plano" },
  { href: "/site/avancado", label: "Avançado" },
];

export function SiteTabs() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
      {TABS.map((t) => {
        const active = t.href === "/site" ? pathname === "/site" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm transition ${
              active ? "border-brand font-semibold text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
