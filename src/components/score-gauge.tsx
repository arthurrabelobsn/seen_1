import { scoreLabel } from "@/lib/seo";

/** Medidor semicircular de 0 a 100. */
export function ScoreGauge({ score, size = 180 }: { score: number; size?: number }) {
  const r = 70;
  const len = Math.PI * r; // meia circunferência
  const { text, color, stroke } = scoreLabel(score);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 180 104" width={size} height={(size * 104) / 180} role="img" aria-label={`Score ${score} de 100: ${text}`}>
        <path d="M20 94 A70 70 0 0 1 160 94" fill="none" stroke="var(--color-line)" strokeWidth="14" strokeLinecap="round" />
        <path
          d="M20 94 A70 70 0 0 1 160 94"
          fill="none"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${(Math.max(score, 1) / 100) * len} ${len}`}
          style={{ transition: "stroke-dasharray 400ms ease" }}
        />
        <text x="90" y="86" textAnchor="middle" fontSize="40" fontWeight="800" fill="var(--color-ink)" className="tabular-nums">
          {score}
        </text>
      </svg>
      <p className={`-mt-1 text-sm font-bold ${color}`}>{text}</p>
    </div>
  );
}
