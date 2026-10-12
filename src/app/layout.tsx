import type { Metadata } from "next";
// Fonte empacotada no projeto: não depende do Google Fonts no build.
import { GeistSans as geistSans } from "geist/font/sans";
import { GeistMono as geistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Rankflow", template: "%s · Rankflow" },
  description: "Piloto automático de SEO: planeja, escreve, publica e mede artigos de blog.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
