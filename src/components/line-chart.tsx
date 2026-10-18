"use client";

import { useState } from "react";
import { nf, toDate } from "@/lib/format";

type Point = { date: string; value: number };

/**
 * Linha de uma métrica ao longo dos dias, com cruz e valor ao passar o mouse.
 * Opcional: o período anterior em linha tracejada, na mesma escala (nunca dois eixos).
 */
export function TrendChart({
  points,
  previous,
  format = (v) => nf.format(v),
  invert = false,
  height = 200,
  label,
}: {
  points: Point[];
  previous?: Point[];
  format?: (v: number) => string;
  /** Para posição média: menor é melhor, então o eixo cresce para baixo. */
  invert?: boolean;
  height?: number;
  label: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640, H = height, padL = 44, padR = 12, padT = 12, padB = 26;
  const iw = W - padL - padR, ih = H - padT - padB;

  const values = [...points, ...(previous ?? [])].map((p) => p.value);
  const rawMax = Math.max(...values, invert ? 1 : 0);
  const rawMin = invert ? Math.min(...values, rawMax) : 0;
  const step = niceStep((rawMax - rawMin) / 4 || (rawMax || 1) / 4);
  const lo = invert ? Math.max(0, Math.floor(rawMin / step) * step) : 0;
  const hi = Math.ceil(rawMax / step) * step || step;
  const ticks = Array.from({ length: Math.round((hi - lo) / step) + 1 }, (_, i) => lo + i * step);

  const x = (i: number, n = points.length) => padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => (invert ? padT + ((v - lo) / (hi - lo || 1)) * ih : padT + ih - ((v - lo) / (hi - lo || 1)) * ih);
  const path = (ps: Point[]) => ps.map((p, i) => `${i ? "L" : "M"}${x(i, ps.length).toFixed(1)} ${y(p.value).toFixed(1)}`).join("");
  const labelEvery = Math.ceil(points.length / 6);
  const h = hover !== null ? points[hover] : null;
  const hp = hover !== null && previous ? previous[hover] : null;

  return (
    <div>
      <div className="flex h-5 items-center justify-end gap-3 text-xs text-muted">
        {h ? (
          <>
            <span>
              {toDate(h.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} ·{" "}
              <span className="font-semibold tabular-nums text-ink">{format(h.value)}</span>
            </span>
            {hp && <span className="tabular-nums">período anterior: {format(hp.value)}</span>}
          </>
        ) : (
          previous && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-brand" /> Período atual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0 w-4 border-t-2 border-dashed border-muted/60" /> Período anterior
              </span>
            </>
          )
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 w-full touch-none"
        role="img"
        aria-label={label}
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
        {previous && previous.length > 1 && (
          <path d={path(previous)} fill="none" stroke="var(--color-muted)" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        <path d={path(points)} fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={padT + ih} stroke="var(--color-muted)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.value)} r="4.5" fill="var(--color-brand)" stroke="var(--color-surface)" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
}

/** Mini gráfico de linha sem eixos, para tabelas. */
export function Sparkline({ values, invert = false, width = 72, height = 22 }: { values: number[]; invert?: boolean; width?: number; height?: number }) {
  if (values.length < 2 || values.every((v) => v === 0)) return <span className="text-xs text-muted">—</span>;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values
    .map((v, i) => {
      const t = (v - min) / (max - min || 1);
      return `${(i / (values.length - 1)) * width},${invert ? 2 + t * (height - 4) : height - 2 - t * (height - 4)}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function niceStep(raw: number) {
  if (raw <= 0 || !Number.isFinite(raw)) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}
