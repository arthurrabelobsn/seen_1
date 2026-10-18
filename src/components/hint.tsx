"use client";

import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";

/**
 * Ícone "?" que explica um campo ou termo ao passar o mouse (ou focar com o teclado / tocar no celular).
 * A caixa é desenhada por cima de tudo, então não é cortada por tabelas ou cards.
 */
export function Hint({ children, className = "", size = 14 }: { children: React.ReactNode; className?: string; size?: number }) {
  const id = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number; below: boolean } | null>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const below = r.top < 140; // perto do topo: abre para baixo
    const x = Math.min(Math.max(r.left + r.width / 2, 150), window.innerWidth - 150);
    setPos({ x, y: below ? r.bottom + 8 : r.top - 8, below });
  };
  const hide = () => setPos(null);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-label="O que é isso?"
        aria-describedby={pos ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (pos) hide();
          else show();
        }}
        className={`inline-flex shrink-0 cursor-help items-center align-middle text-muted/70 transition hover:text-brand focus:text-brand focus:outline-none ${className}`}
      >
        <CircleHelp style={{ width: size, height: size }} />
      </button>
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: pos.x, top: pos.y }}
            className={`pointer-events-none fixed z-[100] w-max max-w-[280px] -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-white shadow-xl ${
              pos.below ? "" : "-translate-y-full"
            }`}
          >
            {children}
          </span>,
          document.body,
        )}
    </>
  );
}
