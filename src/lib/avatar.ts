import "server-only";
import { createHash } from "node:crypto";

/**
 * Foto do usuário: a que ele enviou no perfil ou, se não houver, o Gravatar ligado ao e-mail.
 * `d=404` faz o Gravatar responder erro quando não existe foto, e aí o app mostra as iniciais.
 */
export function avatarFor(email: string | undefined | null, uploaded?: string | null) {
  if (uploaded) return uploaded;
  if (!email) return null;
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `https://gravatar.com/avatar/${hash}?s=96&d=404`;
}
