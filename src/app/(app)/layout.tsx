import { Suspense } from "react";
import { DatabaseZap } from "lucide-react";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";

// Tudo aqui depende do usuário logado (cookies), então é renderizado sob demanda
// dentro de <Suspense>, com esqueletos enquanto carrega.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { user, profile, avatarUrl, sites, currentSite, needsMigration } = await getSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={profile.full_name || user.email || "Conta"}
        userEmail={user.email ?? ""}
        avatarUrl={avatarUrl}
        sites={sites.map((s) => ({ id: s.id, name: s.name, url: s.url, plan: s.plan ?? "pro" }))}
        currentSiteId={currentSite?.id ?? null}
      />
      <main className="min-w-0 flex-1 px-5 pb-16 pt-20 lg:px-8 lg:pt-8">
        {needsMigration && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
            <DatabaseZap className="mt-0.5 size-4 shrink-0" />
            <p>
              O banco de dados precisa de uma atualização. No Supabase, abra o <strong>SQL Editor</strong>, cole o conteúdo de{" "}
              <code className="font-mono">supabase/migrations/0002_site_keywords_produtos.sql</code> e clique em <strong>Run</strong>.
            </p>
          </div>
        )}
        <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
      </main>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 border-r border-line bg-surface lg:block" />
      <main className="flex-1 px-5 pt-20 lg:px-8 lg:pt-8">
        <ContentSkeleton />
      </main>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div className="animate-pulse" aria-busy aria-label="Carregando">
      <div className="h-7 w-48 rounded bg-line" />
      <div className="mt-2 h-4 w-80 rounded bg-line/70" />
      <div className="card mt-8 h-96" />
    </div>
  );
}
