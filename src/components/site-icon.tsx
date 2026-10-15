"use client";

import { Globe } from "lucide-react";
import { SafeImg } from "./safe-img";

/** Ícone (favicon) do site do cliente, com um globo de reserva. */
export function SiteIcon({ url, size = 28, className = "" }: { url: string; size?: number; className?: string }) {
  const host = url.replace(/^https?:\/\//, "").split("/")[0];
  const box = `flex shrink-0 items-center justify-center border border-line bg-canvas ${className}`;
  return (
    <SafeImg
      key={host}
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`${box} object-contain p-1`}
      fallback={
        <span className={`${box} text-muted`} style={{ width: size, height: size }} aria-hidden>
          <Globe style={{ width: size * 0.55, height: size * 0.55 }} />
        </span>
      }
    />
  );
}
