import type { Course } from "@/lib/trilhas";

/** Capa do curso no estilo "pôster": gradiente da trilha + desenho abstrato + título. */
export function CoursePoster({
  course,
  showTitle = true,
  label,
  className = "",
}: {
  course: Course;
  showTitle?: boolean;
  /** Texto grande no lugar do título (ex.: número do episódio) */
  label?: string;
  className?: string;
}) {
  const [from, to] = course.colors;
  return (
    <div
      className={`${className.includes("absolute") ? "" : "relative"} isolate overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 140% at 100% 0%, ${to} 0%, ${from} 62%, #05070d 100%)` }}
    >
      <Art kind={course.art} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {course.badge && showTitle && !label && (
        <span className="absolute left-3 top-3 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#05070d]">
          {course.badge}
        </span>
      )}
      {label ? (
        <span className="absolute bottom-2 left-3 text-4xl font-black leading-none text-white/90">{label}</span>
      ) : (
        showTitle && (
          <div className="absolute inset-x-0 bottom-0 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">Seen Trilhas</p>
            <p className="mt-0.5 text-[19px] font-black leading-[1.05] tracking-tight text-white">{course.title}</p>
          </div>
        )
      )}
    </div>
  );
}

function Art({ kind }: { kind: Course["art"] }) {
  const s = { fill: "none", stroke: "white", strokeWidth: 1.4 } as const;
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-[0.28]" aria-hidden>
      {kind === "rings" && [30, 55, 80, 105, 130].map((r) => <circle key={r} cx="250" cy="40" r={r} {...s} />)}
      {kind === "orbit" && (
        <>
          <ellipse cx="230" cy="70" rx="110" ry="38" transform="rotate(-18 230 70)" {...s} />
          <ellipse cx="230" cy="70" rx="80" ry="70" transform="rotate(30 230 70)" {...s} />
          <circle cx="230" cy="70" r="16" fill="white" fillOpacity="0.8" />
          <circle cx="135" cy="98" r="5" fill="white" />
          <circle cx="300" cy="30" r="4" fill="white" />
        </>
      )}
      {kind === "grid" &&
        Array.from({ length: 5 }).flatMap((_, r) =>
          Array.from({ length: 6 }).map((__, c) => (
            <rect key={`${r}-${c}`} x={150 + c * 30} y={-10 + r * 30} width="22" height="22" rx="5" {...s} fill={(r + c) % 4 === 0 ? "white" : "none"} fillOpacity="0.5" />
          )),
        )}
      {kind === "waves" &&
        [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M0 ${70 + i * 14} C 80 ${20 + i * 14}, 160 ${120 + i * 14}, 320 ${40 + i * 14}`} {...s} />)}
      {kind === "bars" &&
        [40, 70, 55, 95, 120, 150].map((h, i) => <rect key={i} x={140 + i * 28} y={170 - h} width="18" height={h} rx="4" {...s} fill={i === 5 ? "white" : "none"} fillOpacity="0.6" />)}
      {kind === "pin" && (
        <>
          {[20, 40, 60, 80].map((r) => <circle key={r} cx="240" cy="75" r={r} {...s} strokeDasharray="3 5" />)}
          <path d="M240 40c-16 0-28 12-28 27 0 20 28 45 28 45s28-25 28-45c0-15-12-27-28-27z" fill="white" fillOpacity="0.8" />
          <circle cx="240" cy="66" r="9" fill="black" fillOpacity="0.35" />
        </>
      )}
      {kind === "spark" && (
        <>
          <path d="M240 10 L252 62 L304 74 L252 86 L240 138 L228 86 L176 74 L228 62 Z" fill="white" fillOpacity="0.75" />
          <path d="M170 20 L175 38 L193 43 L175 48 L170 66 L165 48 L147 43 L165 38 Z" fill="white" fillOpacity="0.6" />
          {[60, 90].map((r) => <circle key={r} cx="240" cy="74" r={r} {...s} />)}
        </>
      )}
      {kind === "steps" &&
        [0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={120 + i * 40} y={130 - i * 26} width="40" height={50 + i * 26} {...s} />
            <circle cx={140 + i * 40} cy={116 - i * 26} r="5" fill="white" fillOpacity={i === 4 ? 1 : 0.5} />
          </g>
        ))}
    </svg>
  );
}
