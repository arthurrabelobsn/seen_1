"use client";

import { SafeImg } from "./safe-img";

/** Foto do usuário com reserva nas iniciais (quando não há foto ou ela não carrega). */
export function Avatar({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  const initials =
    name
      .replace(/@.*/, "")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?";

  const fallback = (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-soft font-bold text-brand"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );

  if (!src) return fallback;
  return (
    <SafeImg
      key={src}
      src={src}
      alt=""
      width={size}
      height={size}
      fallback={fallback}
      className="shrink-0 rounded-full bg-canvas object-cover"
      style={{ width: size, height: size }}
    />
  );
}
