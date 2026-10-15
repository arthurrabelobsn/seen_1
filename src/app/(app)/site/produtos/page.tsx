import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import type { Product } from "@/lib/types";
import { ProductsBoard } from "./products-board";

export const metadata: Metadata = { title: "Produtos e serviços" };

export default async function ProductsPage() {
  const { supabase, site, user } = await requireSite();
  const { data } = await supabase.from("products").select("*").eq("site_id", site.id).order("created_at", { ascending: false });
  return <ProductsBoard products={(data ?? []) as Product[]} userId={user.id} />;
}
