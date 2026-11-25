"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { calcularPendientes, INFO_PENDIENTE, type TipoPendiente } from "@/lib/reglas";
import { Card, PendienteItem, Titulo } from "@/components/ui";

export default function Pendientes() {
  const { datos } = useStore();
  const [tipo, setTipo] = useState<TipoPendiente | "todos">("todos");
  const [verOcultos, setVerOcultos] = useState(false);
  const todos = calcularPendientes(datos);
  const cli = new Map(datos.clientes.map((c) => [c.id, c]));
  const visibles = todos.filter((p) => (tipo === "todos" || p.tipo === tipo) && (verOcultos || !p.ocultoPorCortesia));
  const nOcultos = todos.filter((p) => p.ocultoPorCortesia).length;
  const tipos = Object.entries(INFO_PENDIENTE) as [TipoPendiente, (typeof INFO_PENDIENTE)[TipoPendiente]][];

  return (
    <div className="max-w-4xl">
      <Titulo sub="Ordenados por prioridad (P1 = más urgente). Máximo 1 mensaje comercial por cliente cada 14 días.">Pendientes</Titulo>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setTipo("todos")} className={`rounded-full px-3 py-1 text-sm ${tipo === "todos" ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
          Todos ({todos.filter((p) => !p.ocultoPorCortesia).length})
        </button>
        {tipos.map(([t, info]) => {
          const n = todos.filter((p) => p.tipo === t && !p.ocultoPorCortesia).length;
          if (!n) return null;
          return (
            <button key={t} onClick={() => setTipo(t)} className={`rounded-full px-3 py-1 text-sm ${tipo === t ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>
              {info.nombre} ({n})
            </button>
          );
        })}
      </div>
      {nOcultos > 0 && (
        <label className="mb-4 flex items-center gap-2 text-sm text-stone-600">
          <input type="checkbox" checked={verOcultos} onChange={(e) => setVerOcultos(e.target.checked)} />
          Mostrar {nOcultos} pendiente(s) oculto(s) por la regla de cortesía
        </label>
      )}
      <div className="space-y-3">
        {visibles.map((p) => (
          <PendienteItem key={p.clave} p={p} cliente={cli.get(p.clienteId)} />
        ))}
        {visibles.length === 0 && <Card>No hay pendientes de este tipo.</Card>}
      </div>
    </div>
  );
}
