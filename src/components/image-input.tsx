"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
// O cliente do Supabase só é baixado na hora de enviar uma imagem (deixa as outras telas mais leves)
const uploadImage = async (...args: Parameters<typeof import("@/lib/supabase/client").uploadImage>) =>
  (await import("@/lib/supabase/client")).uploadImage(...args);

/** Campo de imagem: envia para o Storage e guarda a URL num input escondido com o `name` dado. */
export function ImageInput({
  name,
  userId,
  folder,
  defaultValue,
  className = "aspect-video w-full",
  compact = false,
}: {
  name: string;
  userId: string;
  folder: string;
  defaultValue?: string | null;
  className?: string;
  /** Só o ícone, para áreas pequenas (ex.: foto de perfil). */
  compact?: boolean;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Escolha um arquivo de imagem.");
    setBusy(true);
    setError(null);
    try {
      setUrl(await uploadImage(file, userId, folder));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <div
        className={`relative overflow-hidden border border-dashed border-line bg-canvas ${compact ? "rounded-full" : "rounded-xl"} ${className}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- imagem do Storage */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setUrl("")}
              className={`absolute rounded-full bg-ink/70 p-1 text-white hover:bg-ink ${compact ? "bottom-1 left-1/2 -translate-x-1/2" : "right-2 top-2"}`}
              aria-label="Remover imagem"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            {busy ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
            {!compact && (busy ? "Enviando…" : "Clique ou arraste uma imagem")}
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {error && <p className="mt-1 text-xs text-bad">{error}</p>}
    </div>
  );
}
