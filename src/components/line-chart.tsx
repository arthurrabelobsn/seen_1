"use client";

import { useState } from "react";
import { nf, toDate } from "@/lib/format";

/** Linha de uma série só, com cruz e dica ao passar o mouse. Uma métrica por gráfico (sem eixo duplo). */
export function LineChart({
  title,
  points,
  format = (v) => nf.format(v),
  invert = false,
}: {
  title: string;
  points: { date: string; value: number }[];
  format?: (v: number) => string;
  /** Para posição média: menor é melhor, então o eixo cresce para baixo. */
  invert?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = 200, padL = 40, padR = 12, padT = 12, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;

  const values = points.map((p) => p.value);
  const rawMax = Math.max(...values, invert ? 1 : 0);
  const rawMin = invert ? Math.min(...values, rawMax) : 0;
  const step = niceStep((rawMax - rawMin) / 4 || 1);
  const lo = invert ? Math.max(0, Math.floor(rawMin / step) * step) : 0;
  const hi = Math.ceil(rawMax / step) * step || step;
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);

  const x = (i: number) => padL + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => (invert ? padT + ((v - lo) / (hi - lo)) * ih : padT + ih - ((v - lo) / (hi - lo)) * ih);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join("");
  const labelEvery = Math.ceil(points.length / 6);
  const h = hover !== null ? points[hover] : null;

  return (
    <figure className="card p-5">
      <figcaption className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">{title}</span>
        {h && (
          <span className="text-xs text-muted">
            {toDate(h.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
            <span className="font-semibold tabular-nums text-ink">{format(h.value)}</span>
          </span>
        )}
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 w-full touch-none"
        role="img"
        aria-label={title}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          const i = Math.round(((px - padL) / iw) * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--color-line)" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-muted)" className="tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          i % labelEvery === 0 ? (
            <text key={p.date} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--color-muted)">
              {toDate(p.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </text>
          ) : null,
        )}
        <path d={path} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="var(--color-muted)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.value)} r="4.5" fill="var(--color-brand)" stroke="var(--color-surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
    </figure>
  );
}

function niceStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}
