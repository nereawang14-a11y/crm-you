"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { diasEntre, fmtEuros, fmtFecha, hoy } from "@/lib/fechas";
import type { Presupuesto } from "@/lib/types";
import { Badge, Boton, Card, Titulo, inputCls } from "@/components/ui";

const COLS: { estado: Presupuesto["estado"]; titulo: string; color: string }[] = [
  { estado: "enviado", titulo: "Enviado", color: "bg-amber-50" },
  { estado: "ganado", titulo: "Ganado", color: "bg-emerald-50" },
  { estado: "perdido", titulo: "Perdido", color: "bg-stone-100" },
];

export default function Presupuestos() {
  const { datos, cambiarEstadoPresupuesto } = useStore();
  const [nuevo, setNuevo] = useState(false);
  const cli = new Map(datos.clientes.map((c) => [c.id, c]));
  const H = hoy();

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between">
        <Titulo sub="Celebraciones de grupo: cumpleaños, cenas de empresa… Si un presupuesto lleva más de 5 días sin respuesta, aparece en pendientes.">Presupuestos</Titulo>
        <Boton onClick={() => setNuevo(!nuevo)}>+ Nuevo presupuesto</Boton>
      </div>
      {nuevo && <NuevoPresupuesto onFin={() => setNuevo(false)} />}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLS.map((col) => {
          const items = datos.presupuestos.filter((p) => p.estado === col.estado).sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento));
          const total = items.reduce((s, p) => s + p.importe, 0);
          return (
            <div key={col.estado} className={`rounded-xl p-3 ${col.color}`}>
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-semibold">{col.titulo} ({items.length})</span>
                <span className="text-sm text-stone-600">{fmtEuros(total)}</span>
              </div>
              <div className="space-y-3">
                {items.map((p) => {
                  const c = cli.get(p.clienteId);
                  const dias = diasEntre(p.fechaEnvio, H);
                  return (
                    <Card key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium capitalize">{p.tipoEvento} · {p.personas} pers.</div>
                          {c && <Link href={`/clientes/${c.id}`} className="text-sm text-oro-700 hover:underline">{c.nombre}</Link>}
                        </div>
                        <div className="text-right font-semibold">{fmtEuros(p.importe)}</div>
                      </div>
                      <div className="mt-2 text-xs text-stone-500">Evento: {fmtFecha(p.fechaEvento)} · {p.menu}</div>
                      {p.estado === "enviado" && (
                        <div className="mt-1 text-xs">
                          Enviado hace {dias} días {dias > 5 && <Badge className="ml-1 bg-red-100 text-red-700">Llamar</Badge>}
                        </div>
                      )}
                      {p.motivoPerdida && <div className="mt-1 text-xs text-stone-500">Motivo: {p.motivoPerdida}</div>}
                      {p.estado === "enviado" && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => cambiarEstadoPresupuesto(p.id, "ganado")} className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white">Ganado</button>
                          <button onClick={() => cambiarEstadoPresupuesto(p.id, "perdido", prompt("Motivo de la pérdida") ?? undefined)} className="rounded-md border border-stone-300 px-2 py-1 text-xs">Perdido</button>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NuevoPresupuesto({ onFin }: { onFin: () => void }) {
  const { datos, crearPresupuesto } = useStore();
  const [f, setF] = useState({ clienteId: datos.clientes[0]?.id ?? "", tipoEvento: "cumpleaños" as Presupuesto["tipoEvento"], fechaEvento: "", personas: 10, menu: "Menú de grupo", importe: 290 });
  return (
    <Card className="mb-4">
      <form
        className="grid grid-cols-2 gap-3 md:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!f.fechaEvento) return;
          crearPresupuesto({ ...f, fechaEvento: `${f.fechaEvento}T21:00` });
          onFin();
        }}
      >
        <div><label className="text-xs text-stone-500">Cliente</label><select className={inputCls} value={f.clienteId} onChange={(e) => setF({ ...f, clienteId: e.target.value })}>{datos.clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
        <div><label className="text-xs text-stone-500">Tipo</label><select className={inputCls} value={f.tipoEvento} onChange={(e) => setF({ ...f, tipoEvento: e.target.value as Presupuesto["tipoEvento"] })}><option>cumpleaños</option><option>cena de empresa</option><option>otro</option></select></div>
        <div><label className="text-xs text-stone-500">Fecha del evento</label><input type="date" className={inputCls} value={f.fechaEvento} onChange={(e) => setF({ ...f, fechaEvento: e.target.value })} required /></div>
        <div><label className="text-xs text-stone-500">Personas</label><input type="number" className={inputCls} value={f.personas} onChange={(e) => setF({ ...f, personas: Number(e.target.value) })} /></div>
        <div><label className="text-xs text-stone-500">Menú</label><input className={inputCls} value={f.menu} onChange={(e) => setF({ ...f, menu: e.target.value })} /></div>
        <div><label className="text-xs text-stone-500">Importe (€)</label><input type="number" className={inputCls} value={f.importe} onChange={(e) => setF({ ...f, importe: Number(e.target.value) })} /></div>
        <div className="col-span-full flex gap-2"><Boton type="submit">Enviar presupuesto</Boton><Boton variante="secundario" onClick={onFin}>Cancelar</Boton></div>
      </form>
    </Card>
  );
}
