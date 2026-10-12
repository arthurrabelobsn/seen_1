import { Suspense } from "react";
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
  const { user, profile, sites, currentSite } = await getSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={profile.full_name || user.email || "Conta"}
        userEmail={user.email ?? ""}
        sites={sites.map((s) => ({ id: s.id, name: s.name }))}
        currentSiteId={currentSite?.id ?? null}
      />
      <main className="min-w-0 flex-1 px-5 pb-16 pt-20 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-64 border-r border-line bg-surface lg:block" />
      <main className="flex-1 px-5 pt-20 lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-6xl">
          <ContentSkeleton />
        </div>
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
