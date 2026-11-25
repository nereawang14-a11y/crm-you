// Fechas locales en formato 'YYYY-MM-DDTHH:mm' (sin zona), para evitar desfases.

const pad = (n: number) => String(n).padStart(2, "0");

export function hoy(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function aIso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function aDia(d: Date): string {
  return aIso(d).slice(0, 10);
}

export function desdeIso(s: string): Date {
  const [f, h = "00:00"] = s.split("T");
  const [y, m, d] = f.split("-").map(Number);
  const [hh, mm] = h.split(":").map(Number);
  return new Date(y, m - 1, d, hh || 0, mm || 0);
}

/** Fecha relativa a HOY: dias (negativo = pasado) y hora 'HH:mm'. */
export function rel(base: Date, dias: number, hora = "14:00"): string {
  const d = new Date(base);
  d.setDate(d.getDate() + dias);
  const [hh, mm] = hora.split(":").map(Number);
  d.setHours(hh, mm, 0, 0);
  return aIso(d);
}

/** Días naturales entre dos fechas (b - a), por día de calendario. */
export function diasEntre(a: string | Date, b: string | Date): number {
  const da = typeof a === "string" ? desdeIso(a) : new Date(a);
  const db = typeof b === "string" ? desdeIso(b) : new Date(b);
  da.setHours(0, 0, 0, 0);
  db.setHours(0, 0, 0, 0);
  return Math.round((db.getTime() - da.getTime()) / 864e5);
}

export function fmtFecha(s: string): string {
  const d = desdeIso(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function fmtFechaHora(s: string): string {
  const d = desdeIso(s);
  return `${fmtFecha(s)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtEuros(n: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    useGrouping: true,
  }).format(n);
}

export function haceTexto(dias: number): string {
  if (dias === 0) return "hoy";
  if (dias === 1) return "ayer";
  if (dias === -1) return "mañana";
  if (dias < 0) return `dentro de ${-dias} días`;
  return `hace ${dias} días`;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export const nombreDia = (d: Date) => DIAS[d.getDay()];

/** Días hacia atrás hasta el último `dow` (0=domingo) estrictamente anterior a base. */
export function diasHastaUltimo(base: Date, dow: number): number {
  let n = 1;
  const d = new Date(base);
  d.setDate(d.getDate() - 1);
  while (d.getDay() !== dow) {
    d.setDate(d.getDate() - 1);
    n++;
  }
  return n;
}

export function cumpleDesde(base: Date, mmdd: string): number {
  // días hasta el próximo cumpleaños (0 = hoy)
  const [m, d] = mmdd.split("-").map(Number);
  const c = new Date(base.getFullYear(), m - 1, d);
  if (c < base) c.setFullYear(base.getFullYear() + 1);
  return diasEntre(base, c);
}
