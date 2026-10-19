"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronsUpDown,
  ChevronUp,
  FileText,
  Globe,
  KeyRound,
  LogOut,
  Menu,
  Plus,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { chooseSite } from "@/app/(app)/actions";
import { signOut, switchUser } from "@/app/login/actions";
import { Avatar } from "./avatar";
import { SiteIcon } from "./site-icon";
import { MenuItem, Popover } from "./popover";
import { ProBadge, SeenLogo } from "./brand";

const NAV = [
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/artigos", label: "Artigos", icon: FileText },
  { href: "/keywords", label: "Keywords", icon: KeyRound },
  { href: "/resultados", label: "Resultados", icon: BarChart3 },
  { href: "/site", label: "Site", icon: Globe },
];

type Props = {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  sites: { id: string; name: string; url: string; plan: string }[];
  currentSiteId: string | null;
};

export function Sidebar({ userName, userEmail, avatarUrl, sites, currentSiteId }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const isActive = (href: string) =>
    href === "/artigos"
      ? pathname === "/artigos" || (pathname.startsWith("/artigos/") && pathname !== "/artigos/novo")
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Barra superior no celular */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
        <Link href="/calendario" aria-label="Seen">
          <SeenLogo className="h-6 w-auto" />
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-canvas" aria-label="Abrir menu">
          <Menu className="size-5" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={close} aria-hidden />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo no eixo central do menu */}
        <div className="relative flex h-16 items-center justify-center px-5">
          <Link href="/calendario" aria-label="Seen" onClick={close}>
            <SeenLogo className="h-[22px] w-auto" />
          </Link>
          <button type="button" onClick={close} className="absolute right-4 rounded-lg p-1.5 hover:bg-canvas lg:hidden" aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-2 px-3 pb-4">
          <SiteSwitcher sites={sites} currentSiteId={currentSiteId} onNavigate={close} />
          {sites.length > 0 && (
            <Link href="/artigos/novo" onClick={close} className="btn-primary w-full">
              <Plus className="size-4" /> Criar artigo
            </Link>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} active={isActive(href)} onClick={close}>
              <Icon className="size-[18px]" />
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <NavLink href="/perfil" label="Perfil" active={isActive("/perfil")} onClick={close}>
            <UserRound className="size-[18px]" />
          </NavLink>
          <UserMenu userName={userName} userEmail={userEmail} avatarUrl={avatarUrl} onNavigate={close} />
        </div>
      </aside>
    </>
  );
}

function NavLink({
  href,
  label,
  active,
  onClick,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-brand-soft font-semibold text-brand" : "text-muted hover:bg-canvas hover:text-ink"
      }`}
    >
      {children}
      {label}
    </Link>
  );
}

function SiteSwitcher({
  sites,
  currentSiteId,
  onNavigate,
}: {
  sites: Props["sites"];
  currentSiteId: string | null;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const current = sites.find((s) => s.id === currentSiteId) ?? sites[0];

  if (!current) {
    return (
      <Link href="/novo-site" onClick={onNavigate} className="btn-primary w-full">
        <Plus className="size-4" /> Cadastrar primeiro site
      </Link>
    );
  }

  const pick = (id: string) =>
    startTransition(async () => {
      const fd = new FormData();
      fd.set("site_id", id);
      await chooseSite(fd);
      router.refresh();
    });

  return (
    <Popover
      panelClassName="w-full"
      className="w-full"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className={`flex w-full items-center gap-2.5 rounded-xl border border-line px-2.5 py-2 text-left transition hover:bg-canvas ${pending ? "opacity-60" : ""}`}
        >
          <SiteIcon url={current.url} size={28} className="rounded-md" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold">{current.name}</span>
              {current.plan === "pro" && <ProBadge />}
            </span>
            <span className="block truncate text-xs text-muted">{current.url.replace(/^https?:\/\//, "")}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted" />
        </button>
      )}
    >
      {(closeMenu) => (
        <>
          <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">Seus sites</p>
          {sites.map((s) => (
            <MenuItem
              key={s.id}
              icon={<SiteIcon url={s.url} size={18} className="rounded" />}
              onClick={() => {
                closeMenu();
                if (s.id !== current.id) pick(s.id);
              }}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate">{s.name}</span>
                {s.id === current.id && <Check className="size-4 text-brand" />}
              </span>
            </MenuItem>
          ))}
          <div className="my-1 border-t border-line" />
          <MenuItem
            icon={<Plus />}
            onClick={() => {
              closeMenu();
              onNavigate();
              router.push("/novo-site");
            }}
          >
            Adicionar site
          </MenuItem>
        </>
      )}
    </Popover>
  );
}

function UserMenu({
  userName,
  userEmail,
  avatarUrl,
  onNavigate,
}: {
  userName: string;
  userEmail: string;
  avatarUrl: string | null;
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <Popover
      side="top"
      panelClassName="w-full"
      className="w-full"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Abrir menu da conta"
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-canvas"
        >
          <Avatar src={avatarUrl} name={userName} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{userName}</span>
            <span className="block truncate text-xs text-muted">{userEmail}</span>
          </span>
          <ChevronUp className={`size-4 shrink-0 text-muted transition ${open ? "" : "rotate-180"}`} />
        </button>
      )}
    >
      {(closeMenu) => (
        <>
          <MenuItem
            icon={<Settings />}
            onClick={() => {
              closeMenu();
              onNavigate();
              router.push("/perfil");
            }}
          >
            Configurações
          </MenuItem>
          <MenuItem
            icon={<Users />}
            onClick={() => {
              closeMenu();
              startTransition(() => switchUser());
            }}
          >
            Trocar usuário
          </MenuItem>
          <div className="my-1 border-t border-line" />
          <MenuItem
            icon={<LogOut />}
            danger
            onClick={() => {
              closeMenu();
              startTransition(() => signOut());
            }}
          >
            Sair
          </MenuItem>
        </>
      )}
    </Popover>
  );
}
