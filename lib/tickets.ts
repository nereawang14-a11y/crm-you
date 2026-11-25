import type { Datos, Plato } from "./types";
import { diasEntre, hoy } from "./fechas";

export const IVA = 0.1; // IVA de hostelería, incluido en los precios

export type Ticket = { numero: string; fecha: string; tipo: "sesion" | "pedido"; mesa?: number; comensales?: number; platos: Plato[]; total: number; base: number; cuotaIva: number };

export function ticketDe(d: Datos, tipo: "sesion" | "pedido", id: string): Ticket | null {
  if (tipo === "sesion") {
    const s = d.sesiones.find((x) => x.id === id);
    if (!s || !s.cierre) return null;
    return desglose({ numero: s.numeroTicket, fecha: s.cierre, tipo, mesa: s.mesa, comensales: s.comensales, platos: s.platos, total: s.importe });
  }
  const p = d.pedidos.find((x) => x.id === id);
  if (!p) return null;
  return desglose({ numero: `LL-${p.id.replace(/\D/g, "").padStart(4, "0")}`, fecha: p.fecha, tipo, platos: p.platos, total: p.importe });
}

function desglose(t: Omit<Ticket, "base" | "cuotaIva">): Ticket {
  const base = Math.round((t.total / (1 + IVA)) * 100) / 100;
  return { ...t, base, cuotaIva: Math.round((t.total - base) * 100) / 100 };
}

/** Clientes de una mesa que reciben el ticket en el móvil. */
export function destinatariosDigitales(d: Datos, sesionId: string) {
  const ids = d.checkins.filter((k) => k.sesionId === sesionId).map((k) => k.clienteId);
  return d.clientes.filter((c) => ids.includes(c.id) && c.tieneCuenta && c.ticketDigital);
}

/** Tickets que no se han impreso en papel en los últimos `dias` días. */
export function ticketsSinPapel(d: Datos, dias = 30, ref = hoy()) {
  const digital = new Set(d.clientes.filter((c) => c.tieneCuenta && c.ticketDigital).map((c) => c.id));
  const sesiones = new Set(d.checkins.filter((k) => digital.has(k.clienteId)).map((k) => k.sesionId));
  const sala = d.sesiones.filter((s) => s.cierre && sesiones.has(s.id) && diasEntre(s.apertura, ref) <= dias).length;
  const llevar = d.pedidos.filter((p) => digital.has(p.clienteId) && diasEntre(p.fecha, ref) <= dias).length;
  return { total: sala + llevar, metrosPapel: Math.round((sala + llevar) * 0.2 * 10) / 10 }; // ~20 cm por ticket
}
