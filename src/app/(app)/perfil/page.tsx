import type { Metadata } from "next";
import { getSession } from "@/lib/session";
import { PageHeader } from "@/components/ui";
import { PasswordForm, ProfileForm } from "./profile-forms";

export const metadata: Metadata = { title: "Perfil" };

export default async function ProfilePage({ searchParams }: PageProps<"/perfil">) {
  const params = await searchParams;
  const { user, profile, sites } = await getSession();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Perfil" description="Seus dados de acesso e da conta." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm fullName={profile.full_name ?? ""} company={profile.company ?? ""} phone={profile.phone ?? ""} email={user.email ?? ""} userId={user.id} avatarUrl={profile.avatar_url ?? null} />
        <PasswordForm highlight={params.senha === "1"} />
      </div>
      <section className="card mt-6 p-6">
        <h2 className="font-semibold">Plano</h2>
        <p className="mt-1 text-sm text-muted">
          {sites.length} {sites.length === 1 ? "site cadastrado" : "sites cadastrados"}. O plano de cada site fica em Site → Plano.
        </p>
      </section>
    </div>
  );
}
