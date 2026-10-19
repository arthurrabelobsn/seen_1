import type { Metadata } from "next";
import { TrilhasHome } from "./trilhas-home";

export const metadata: Metadata = { title: "Trilhas" };

export default function TrilhasPage() {
  return <TrilhasHome />;
}
