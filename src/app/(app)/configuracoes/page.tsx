import { redirect } from "next/navigation";

// Rota antiga: as configurações agora ficam na aba Site.
export default function OldSettings() {
  redirect("/site");
}
