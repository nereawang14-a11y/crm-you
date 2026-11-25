"use client";

import Link from "next/link";
import type { Cliente } from "@/lib/types";
import type { Pendiente, Segmento } from "@/lib/reglas";
import { INFO_PENDIENTE } from "@/lib/reglas";
import { useStore } from "@/lib/store";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-stone-200 bg-white p-5 shadow-sm ${className}`}>{children}</div>;
}

export function Titulo({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-stone-900">{children}</h1>
      {sub && <p className="mt-1 text-sm text-stone-500">{sub}</p>}
    </div>
  );
}

const COLOR_SEG: Record<Segmento, string> = {
  Diario: "bg-violet-100 text-violet-800",
  Semanal: "bg-emerald-100 text-emerald-800",
  Quincenal: "bg-sky-100 text-sky-800",
  Ocasional: "bg-stone-100 text-stone-700",
  Nuevo: "bg-amber-100 text-amber-800",
};

export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

export function SegmentoBadge({ s, riesgo, menos }: { s: Segmento; riesgo?: boolean; menos?: boolean }) {
  return (
    <span className="inline-flex gap-1">
      <Badge className={COLOR_SEG[s]}>{s}</Badge>
      {riesgo && <Badge className="bg-red-100 text-red-700">En riesgo</Badge>}
      {menos && <Badge className="bg-orange-100 text-orange-800">Viene menos</Badge>}
    </span>
  );
}

export function Estrellas({ n, size = "text-sm" }: { n: number; size?: string }) {
  return (
    <span className={`${size} tracking-tight`} aria-label={`${n} de 5 estrellas`}>
      <span className="text-amber-500">{"★".repeat(Math.round(n))}</span>
      <span className="text-stone-300">{"★".repeat(5 - Math.round(n))}</span>
    </span>
  );
}

const COLOR_PRIO = (p: number) =>
  p <= 2 ? "border-l-red-500" : p <= 4 ? "border-l-amber-500" : p <= 6 ? "border-l-sky-500" : "border-l-stone-300";

const ICONO_CANAL: Record<Pendiente["canal"], string> = {
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  "en persona": "En persona",
  interno: "Interno",
};

export function PendienteItem({ p, cliente, compacto = false }: { p: Pendiente; cliente?: Cliente; compacto?: boolean }) {
  const { completarPendiente, posponerPendiente } = useStore();
  const info = INFO_PENDIENTE[p.tipo];
  return (
    <div className={`rounded-lg border border-stone-200 border-l-4 bg-white p-4 ${COLOR_PRIO(p.prioridad)} ${p.ocultoPorCortesia ? "opacity-50" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-400">P{p.prioridad}</span>
            <span className="font-medium text-stone-900">{info.nombre}</span>
            {cliente && (
              <Link href={`/clientes/${cliente.id}`} className="text-sm text-red-700 hover:underline">
                {cliente.nombre}
              </Link>
            )}
            <Badge className="bg-stone-100 text-stone-600">{ICONO_CANAL[p.canal]}</Badge>
            {p.ocultoPorCortesia && <Badge className="bg-stone-200 text-stone-600">Oculto por la regla de cortesía</Badge>}
          </div>
          <p className="mt-1 text-sm text-stone-600">{p.detalle}</p>
          <p className="mt-1 text-sm text-stone-800">→ {p.accion}</p>
          {!compacto && p.mensaje && (
            <p className="mt-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900">“{p.mensaje.texto}”</p>
          )}
        </div>
        {!p.ocultoPorCortesia && (
          <div className="flex shrink-0 gap-2">
            <button onClick={() => completarPendiente(p)} className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800">
              {p.mensaje ? "Enviar y marcar hecho" : "Hecho"}
            </button>
            {!compacto && (
              <button onClick={() => posponerPendiente(p)} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">
                Posponer 3 días
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Boton({ children, onClick, variante = "primario", type = "button", disabled }: { children: React.ReactNode; onClick?: () => void; variante?: "primario" | "secundario"; type?: "button" | "submit"; disabled?: boolean }) {
  const cls =
    variante === "primario"
      ? "bg-red-700 text-white hover:bg-red-800 disabled:bg-stone-300"
      : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-50";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`rounded-md px-3 py-2 text-sm font-medium ${cls}`}>
      {children}
    </button>
  );
}

export const inputCls = "w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600";
