import { CheckCircle2 } from "lucide-react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const STATUS_STYLE: Record<string, string> = {
  ideia: "bg-canvas text-muted border-line",
  rascunho: "bg-warn-soft text-warn border-warn/20",
  aprovado: "bg-sky-50 text-sky-700 border-sky-200",
  agendado: "bg-brand-soft text-brand border-brand/20",
  publicado: "bg-good-soft text-good border-good/20",
};
const STATUS_TEXT: Record<string, string> = {
  ideia: "Ideia",
  rascunho: "Rascunho",
  aprovado: "Aprovado",
  agendado: "Agendado",
  publicado: "Publicado",
};

export function StatusBadge({ status, upper }: { status: string; upper?: boolean }) {
  return (
    <span
      className={`pill ${STATUS_STYLE[status] ?? STATUS_STYLE.ideia} ${upper ? "px-1.5 text-[10px] font-bold uppercase tracking-wider" : ""}`}
    >
      {STATUS_TEXT[status] ?? status}
    </span>
  );
}

const OPP_STYLE: Record<string, string> = {
  alta: "bg-good-soft text-good border-good/20",
  media: "bg-warn-soft text-warn border-warn/20",
  baixa: "bg-canvas text-muted border-line",
};
const OPP_TEXT: Record<string, string> = { alta: "Alta", media: "Média", baixa: "Baixa" };

/** Oportunidade (baixa, média, alta). Sem dado do Google ainda: traço. */
export function OpportunityBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-xs text-muted">—</span>;
  return (
    <span className={`pill ${OPP_STYLE[value]}`}>
      <span className="flex items-end gap-px" aria-hidden>
        <span className="h-1.5 w-[3px] rounded-sm bg-current" />
        <span className={`h-2 w-[3px] rounded-sm ${value === "baixa" ? "bg-current/25" : "bg-current"}`} />
        <span className={`h-2.5 w-[3px] rounded-sm ${value === "alta" ? "bg-current" : "bg-current/25"}`} />
      </span>
      {OPP_TEXT[value]}
    </span>
  );
}

/** Dificuldade 0–10 com uma barrinha. */
export function DifficultyMeter({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted">—</span>;
  const color = value <= 3 ? "bg-good" : value <= 6 ? "bg-warn" : "bg-bad";
  return (
    <span className="inline-flex items-center gap-2" title={`Dificuldade ${value} de 10`}>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-line">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.max(6, value * 10)}%` }} />
      </span>
      <span className="text-xs tabular-nums text-muted">{value}/10</span>
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: React.ReactNode;
  htmlFor?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function SavedNote({ error, saved }: { error?: string; saved?: boolean }) {
  if (error) return <p role="alert" className="text-sm text-bad">{error}</p>;
  if (saved)
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-good">
        <CheckCircle2 className="size-4" /> Salvo
      </p>
    );
  return null;
}

export function SoonTag({ children = "Em breve" }: { children?: React.ReactNode }) {
  return <span className="pill border-line bg-canvas text-[10px] font-semibold uppercase tracking-wider text-muted">{children}</span>;
}
