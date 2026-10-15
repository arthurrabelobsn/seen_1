import type { Metadata } from "next";
import { NewSiteForm } from "./new-site-form";

export const metadata: Metadata = { title: "Novo site" };

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-xl py-6">
      <h1 className="text-[28px] font-bold tracking-tight">Cadastrar site</h1>
      <p className="mt-1 text-sm text-muted">Três informações e você já começa. O resto dá para completar depois, na aba Site.</p>
      <NewSiteForm />
    </div>
  );
}
