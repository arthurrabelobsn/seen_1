/* eslint-disable @next/next/no-img-element -- logos pequenos e estáticos; não precisam do otimizador */

/** Logo completo (texto + ícone). */
export function SeenLogo({ variant = "color", className = "h-6 w-auto" }: { variant?: "color" | "black"; className?: string }) {
  return <img src={`/brand/logo-${variant}.png`} alt="Seen" width={1013} height={191} className={className} />;
}

/** Só o ícone dos olhos. */
export function SeenIcon({ variant = "blue", className = "h-6 w-auto" }: { variant?: "blue" | "white" | "black"; className?: string }) {
  return <img src={`/brand/icon-${variant}.png`} alt="" aria-hidden width={568} height={355} className={className} />;
}

export function ProBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md bg-brand px-1.5 py-px text-[10px] font-bold tracking-wider text-white ${className}`}>
      PRO
    </span>
  );
}
