import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { siGithub, siGooglesearchconsole, siMake, siN8n, siShopify, siVercel, siWordpress, siZapier } from "simple-icons";
import { requireSite } from "@/lib/session";
import { ConnectionsGrid, type BrandMark } from "./connections-grid";

export const metadata: Metadata = { title: "Conexões" };

// Logos oficiais vêm do pacote simple-icons (licença CC0).
// A Nuvemshop não está no pacote: coloque o SVG oficial do kit de marca deles em
// public/brand/platforms/nuvemshop.svg e ele aparece aqui automaticamente.
const mark = (i: { title: string; path: string; hex: string }): BrandMark => ({ title: i.title, path: i.path, hex: `#${i.hex}` });

export default async function ConnectionsPage() {
  const { site } = await requireSite();
  const nuvemshopFile = path.join(process.cwd(), "public/brand/platforms/nuvemshop.svg");

  return (
    <ConnectionsGrid
      platform={site.platform}
      status={site.connection_status}
      marks={{
        wordpress: mark(siWordpress),
        shopify: mark(siShopify),
        github: mark(siGithub),
        vercel: mark(siVercel),
        searchConsole: mark(siGooglesearchconsole),
        make: mark(siMake),
        n8n: mark(siN8n),
        zapier: mark(siZapier),
      }}
      nuvemshopLogo={existsSync(nuvemshopFile) ? "/brand/platforms/nuvemshop.svg" : null}
    />
  );
}
