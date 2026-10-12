export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ideia: "bg-canvas text-muted border-line",
    rascunho: "bg-warn-soft text-warn border-warn/20",
    aprovado: "bg-sky-50 text-sky-700 border-sky-200",
    agendado: "bg-violet-50 text-violet-700 border-violet-200",
    publicado: "bg-brand-soft text-brand-strong border-brand/20",
  };
  const labels: Record<string, string> = {
    ideia: "Ideia",
    rascunho: "Rascunho",
    aprovado: "Aprovado",
    agendado: "Agendado",
    publicado: "Publicado",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.ideia}`}>
      {labels[status] ?? status}
    </span>
  );
}
