/** Datas "YYYY-MM-DD" são tratadas como dia local, sem deslocar pelo fuso. */
export function toDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}

export function formatDate(value: string, opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" }) {
  return toDate(value).toLocaleDateString("pt-BR", opts);
}

export function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const nf = new Intl.NumberFormat("pt-BR");

/** Amanhã no formato YYYY-MM-DD (data padrão ao agendar). */
export function tomorrowIso() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return isoDay(d);
}
