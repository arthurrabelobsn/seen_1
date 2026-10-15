import type { Metadata } from "next";
import { requireSite } from "@/lib/session";
import { ConnectionsGrid } from "./connections-grid";

export const metadata: Metadata = { title: "Conexões" };

export default async function ConnectionsPage() {
  const { site } = await requireSite();
  return <ConnectionsGrid platform={site.platform} status={site.connection_status} />;
}
