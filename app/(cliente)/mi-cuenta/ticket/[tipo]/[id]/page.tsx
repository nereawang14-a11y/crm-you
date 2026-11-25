"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getClienteActual } from "@/lib/sesionCliente";
import { ticketDe } from "@/lib/tickets";
import { fmtEuros, fmtFechaHora } from "@/lib/fechas";
import { nombreMesa } from "@/lib/mesas";
import { Card } from "@/components/ui";

export default function TicketDigital() {
  const { tipo, id } = useParams<{ tipo: "sesion" | "pedido"; id: string }>();
  const { datos } = useStore();
  const [cid, setCid] = useState<string | null | undefined>(undefined);
  useEffect(() => setCid(getClienteActual()), []);
  if (cid === undefined) return null;

  // Solo puede verlo quien estuvo en esa mesa o hizo ese pedido
  const permitido = tipo === "sesion" ? datos.checkins.some((k) => k.sesionId === id && k.clienteId === cid) : datos.pedidos.some((p) => p.id === id && p.clienteId === cid);
  const t = permitido ? ticketDe(datos, tipo, id) : null;
  if (!t) return <Card>Ticket no disponible. <Link href="/mi-cuenta" className="text-red-700">Volver a mi cuenta</Link></Card>;

  return (
    <div>
      <Link href="/mi-cuenta" className="text-sm text-stone-500 print:hidden">← Mis visitas</Link>
      <div className="mx-auto mt-3 max-w-sm rounded-xl border border-stone-200 bg-white p-5 font-mono text-sm shadow-sm print:border-0 print:shadow-none">
        <div className="text-center">
          <div className="font-sans text-3xl font-black text-red-700">YOU</div>
          <div className="text-xs text-stone-600">Restaurante You · Av. Juan Carlos I, 13<br />28806 Alcalá de Henares · 91 802 54 52</div>
        </div>
        <div className="my-3 border-t border-dashed border-stone-300" />
        <div className="flex justify-between"><span>Ticket</span><span>{t.numero}</span></div>
        <div className="flex justify-between"><span>Fecha</span><span>{fmtFechaHora(t.fecha)}</span></div>
        {t.tipo === "sesion" ? (
          <div className="flex justify-between"><span>{nombreMesa(t.mesa!)}</span><span>{t.comensales} {t.comensales === 1 ? "comensal" : "comensales"}</span></div>
        ) : (
          <div className="flex justify-between"><span>Pedido</span><span>Para llevar</span></div>
        )}
        <div className="my-3 border-t border-dashed border-stone-300" />
        {t.platos.map((p, i) => (
          <div key={i} className="flex justify-between gap-2">
            <span>{p.cantidad} × {p.nombre}</span>
            <span className="whitespace-nowrap">{fmtEuros(p.cantidad * p.precio)}</span>
          </div>
        ))}
        <div className="my-3 border-t border-dashed border-stone-300" />
        <div className="flex justify-between text-xs text-stone-600"><span>Base imponible</span><span>{fmtEuros(t.base)}</span></div>
        <div className="flex justify-between text-xs text-stone-600"><span>IVA 10 %</span><span>{fmtEuros(t.cuotaIva)}</span></div>
        <div className="mt-1 flex justify-between text-base font-bold"><span>TOTAL</span><span>{fmtEuros(t.total)}</span></div>
        <div className="my-3 border-t border-dashed border-stone-300" />
        <p className="text-center text-xs text-emerald-700">Ticket digital · gracias por ahorrar papel 🌱</p>
        <p className="mt-1 text-center text-[10px] text-stone-400">Ticket de demostración (datos de ejemplo)</p>
      </div>
      <div className="mt-4 flex justify-center print:hidden">
        <button onClick={() => window.print()} className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium">Guardar como PDF</button>
      </div>
    </div>
  );
}
