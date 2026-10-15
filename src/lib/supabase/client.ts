"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseKey, supabaseUrl } from "./env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  client ??= createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}

/**
 * Envia uma imagem para o bucket "media", dentro da pasta do usuário (exigido pelas regras do bucket).
 * Devolve a URL pública.
 */
export async function uploadImage(file: Blob, userId: string, folder: string, ext = "png") {
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem precisa ter até 5 MB.");
  const supabase = getBrowserClient();
  const name = file instanceof File ? file.name : "";
  const extension = (name.split(".").pop() || ext).toLowerCase().replace(/[^a-z0-9]/g, "") || ext;
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type || `image/${extension}`,
  });
  if (error) {
    throw new Error(
      error.message.includes("Bucket not found")
        ? "O armazenamento de imagens ainda não foi criado. Rode a migração 0002 no Supabase."
        : error.message,
    );
  }
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl as string;
}
