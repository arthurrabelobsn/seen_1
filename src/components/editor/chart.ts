// Gera um gráfico simples (barras ou linha) como SVG e converte para PNG,
// para entrar no artigo como imagem comum — funciona em qualquer plataforma de blog.

export type ChartRow = { label: string; value: number };
export type ChartSpec = { title: string; kind: "barras" | "linha"; rows: ChartRow[]; unit?: string };

const W = 960;
const H = 540;
const BRAND = "#005dff";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const fmt = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

function niceMax(v: number) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

export function chartSvg({ title, kind, rows, unit = "" }: ChartSpec) {
  const padL = 80, padR = 40, padT = 96, padB = 80;
  const iw = W - padL - padR, ih = H - padT - padB;
  const max = niceMax(Math.max(...rows.map((r) => r.value), 0));
  const y = (v: number) => padT + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const band = iw / Math.max(rows.length, 1);
  const font = `font-family="Satoshi, Inter, Helvetica, Arial, sans-serif"`;

  const grid = ticks
    .map(
      (t) =>
        `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}" stroke="#e3e7ef"/>` +
        `<text x="${padL - 12}" y="${y(t) + 5}" text-anchor="end" font-size="16" fill="#646b7a" ${font}>${fmt(t)}${esc(unit)}</text>`,
    )
    .join("");

  const labels = rows
    .map((r, i) => `<text x="${padL + band * i + band / 2}" y="${H - padB + 30}" text-anchor="middle" font-size="17" fill="#0b0d12" ${font}>${esc(r.label.slice(0, 18))}</text>`)
    .join("");

  let marks = "";
  if (kind === "barras") {
    const bw = Math.min(band * 0.6, 120);
    marks = rows
      .map((r, i) => {
        const x = padL + band * i + (band - bw) / 2;
        const top = y(r.value);
        const h = padT + ih - top;
        return (
          `<path d="M${x} ${padT + ih} V${top + 6} Q${x} ${top} ${x + 6} ${top} H${x + bw - 6} Q${x + bw} ${top} ${x + bw} ${top + 6} V${padT + ih} Z" fill="${BRAND}"/>` +
          (h > 0 ? `<text x="${x + bw / 2}" y="${top - 10}" text-anchor="middle" font-size="17" font-weight="700" fill="#0b0d12" ${font}>${fmt(r.value)}${esc(unit)}</text>` : "")
        );
      })
      .join("");
  } else {
    const pts = rows.map((r, i) => [padL + band * i + band / 2, y(r.value)] as const);
    marks =
      `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${BRAND}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>` +
      pts
        .map(
          ([px, py], i) =>
            `<circle cx="${px}" cy="${py}" r="7" fill="${BRAND}" stroke="#fff" stroke-width="3"/>` +
            `<text x="${px}" y="${py - 16}" text-anchor="middle" font-size="16" font-weight="700" fill="#0b0d12" ${font}>${fmt(rows[i].value)}${esc(unit)}</text>`,
        )
        .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#ffffff"/>
<text x="${padL}" y="54" font-size="28" font-weight="700" fill="#0b0d12" ${font}>${esc(title)}</text>
${grid}${marks}${labels}
</svg>`;
}

/** Converte o SVG em PNG (Blob) usando um canvas do navegador. */
export async function svgToPng(svg: string): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Falha ao desenhar o gráfico."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar a imagem."))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}
