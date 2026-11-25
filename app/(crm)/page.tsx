"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { calcularKpis, calcularPendientes } from "@/lib/reglas";
import { aDia, fmtEuros, fmtFechaHora, hoy } from "@/lib/fechas";
import { Badge, Card, PendienteItem, Titulo } from "@/components/ui";

function Kpi({ titulo, valor, comparacion, ayuda, alerta }: { titulo: string; valor: string; comparacion?: React.ReactNode; ayuda: string; alerta?: boolean }) {
  return (
    <Card className={alerta ? "border-red-200" : ""}>
      <div className="text-sm text-stone-500">{titulo}</div>
      <div className={`mt-1 text-3xl font-semibold ${alerta ? "text-red-700" : "text-stone-900"}`}>{valor}</div>
      {comparacion && <div className="mt-1 text-sm">{comparacion}</div>}
      <div className="mt-2 text-xs text-stone-400">{ayuda}</div>
    </Card>
  );
}

function Delta({ ahora, antes, inverso = false, fmt = (n: number) => String(n) }: { ahora: number; antes: number | null; inverso?: boolean; fmt?: (n: number) => string }) {
  if (antes === null) return <span className="text-stone-400">sin datos del periodo anterior</span>;
  const dif = ahora - antes;
  if (Math.abs(dif) < 0.005) return <span className="text-stone-500">= igual que hace 30 días</span>;
  const bueno = inverso ? dif < 0 : dif > 0;
  return (
    <span className={bueno ? "text-emerald-700" : "text-red-700"}>
      {dif > 0 ? "↑" : "↓"} {fmt(Math.abs(dif))} <span className="text-stone-400">vs. hace 30 días</span>
    </span>
  );
}

export default function Panel() {
  const { datos } = useStore();
  const k = calcularKpis(datos);
  const pend = calcularPendientes(datos).filter((p) => !p.ocultoPorCortesia);
  const cli = new Map(datos.clientes.map((c) => [c.id, c]));
  const hoyDia = aDia(hoy());
  const gruposProximos = datos.reservas
    .filter((r) => r.comensales >= 8 && r.estado !== "cancelada" && r.fechaHora.slice(0, 10) > hoyDia)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  const reservasHoy = datos.reservas
    .filter((r) => r.fechaHora.slice(0, 10) === hoyDia && r.estado !== "cancelada")
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));

  return (
    <div className="max-w-6xl">
      <Titulo sub="Resumen del día: indicadores, lo urgente y las reservas de hoy.">Panel</Titulo>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Kpi titulo="Clientes activos (60 días)" valor={String(k.activos60)} comparacion={<Delta ahora={k.activos60} antes={k.activos60Antes} />} ayuda="Clientes distintos con al menos una visita en los últimos 60 días." />
        <Kpi titulo="Clientes en riesgo" valor={String(k.enRiesgo)} alerta={k.enRiesgo > 0} comparacion={<Delta ahora={k.enRiesgo} antes={k.enRiesgoAntes} inverso />} ayuda="Habituales que superan el umbral de ausencia de su segmento." />
        <Kpi
          titulo="Valoración media (30 días)"
          valor={k.valoracion === null ? "—" : `${k.valoracion.toFixed(1).replace(".", ",")} ★`}
          comparacion={
            <>
              {k.valoracion !== null && <Delta ahora={k.valoracion} antes={k.valoracionAntes} fmt={(n) => n.toFixed(1).replace(".", ",")} />}
              {k.negativosSinResponder > 0 && <div className="text-red-700">{k.negativosSinResponder} negativo(s) sin responder</div>}
            </>
          }
          ayuda="Media de estrellas del feedback de los últimos 30 días."
        />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Kpi
          titulo="Ingresos (últimos 30 días)"
          valor={fmtEuros(k.ingresos.total)}
          comparacion={<Delta ahora={k.ingresos.total} antes={k.ingresosAntes} fmt={fmtEuros} />}
          ayuda={`Sala ${fmtEuros(k.ingresos.sala)} · Para llevar ${fmtEuros(k.ingresos.llevar)} · Celebraciones ${fmtEuros(k.ingresos.celebraciones)}`}
        />
        <Kpi titulo="Habituales con cuenta" valor={k.pctHabitualesConCuenta === null ? "—" : `${k.pctHabitualesConCuenta} %`} ayuda="Mide si la captación en persona funciona: habituales con cuenta ÷ habituales." />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lo más urgente</h2>
            <Link href="/pendientes" className="text-sm text-red-700 hover:underline">Ver los {pend.length} pendientes →</Link>
          </div>
          <div className="space-y-3">
            {pend.slice(0, 5).map((p) => (
              <PendienteItem key={p.clave} p={p} cliente={cli.get(p.clienteId)} compacto />
            ))}
            {pend.length === 0 && <Card>Todo al día.</Card>}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Reservas de hoy</h2>
          <Card className="divide-y divide-stone-100 p-0">
            {reservasHoy.map((r) => {
              const c = cli.get(r.clienteId)!;
              return (
                <div key={r.id} className="px-4 py-3">
                  <div>
                    <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">{c.nombre}</Link>
                    <div className="text-xs text-stone-500">
                      {r.fechaHora.slice(11)} · {r.comensales} pers. · {r.canal}
                      {c.mesaPreferida ? ` · mesa ${c.mesaPreferida}` : ""}
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.alergias.length > 0 && <Badge className="bg-red-100 text-red-700">Alergia: {c.alergias.join(", ")}</Badge>}
                    {!c.tieneCuenta && <Badge className="bg-amber-100 text-amber-800">Sin cuenta</Badge>}
                    {r.comensales >= 8 && <Badge className="bg-violet-100 text-violet-800">Grupo grande: juntar mesas</Badge>}
                  </div>
                </div>
              );
            })}
            {reservasHoy.length === 0 && <div className="px-4 py-3 text-sm text-stone-500">No hay reservas para hoy.</div>}
          </Card>
          {gruposProximos.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-lg font-semibold">Grupos grandes próximos</h2>
              <Card className="divide-y divide-stone-100 p-0">
                {gruposProximos.map((r) => {
                  const c = cli.get(r.clienteId)!;
                  return (
                    <div key={r.id} className="px-4 py-3">
                      <Link href={`/clientes/${c.id}`} className="font-medium hover:underline">{c.nombre}</Link>
                      <div className="text-xs text-stone-500">{fmtFechaHora(r.fechaHora)} · {r.comensales} personas · juntar mesas{c.mesaPreferida ? ` junto a la ${c.mesaPreferida}` : ""}</div>
                    </div>
                  );
                })}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
