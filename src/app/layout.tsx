import type { Metadata } from "next";
// Geist empacotada no projeto: reserva caso a Satoshi não carregue.
import { GeistSans as geistSans } from "geist/font/sans";
import { GeistMono as geistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Seen", template: "%s · Seen" },
  description: "Seen: SEO no piloto automático. Planeja, escreve, publica e mede artigos de blog.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* Satoshi (fonte da marca Seen), servida pelo Fontshare. Licença gratuita para uso comercial. */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap" />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
