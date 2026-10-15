import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { BrandForm } from "./brand-form";

export const metadata: Metadata = { title: "Marca e IA" };

export default async function BrandPage() {
  const { site } = await requireSite();
  return <BrandForm site={site} />;
}
