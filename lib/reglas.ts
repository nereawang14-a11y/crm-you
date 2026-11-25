import type { Cliente, Datos, MotivoMensaje } from "./types";
import { aDia, cumpleDesde, desdeIso, diasEntre, hoy } from "./fechas";

// ---------- Visitas y segmentos ----------

export type Segmento = "Diario" | "Semanal" | "Quincenal" | "Ocasional" | "Nuevo";

export const UMBRAL_RIESGO: Record<Segmento, number | null> = {
  Diario: 7,
  Semanal: 21,
  Quincenal: 35,
  Ocasional: null,
  Nuevo: null,
};

export const esHabitual = (s: Segmento) => s === "Diario" || s === "Semanal" || s === "Quincenal";

/** Días (YYYY-MM-DD) con visita: check-in en sesión cerrada o pedido para llevar. Máx. 1 por día. */
export function diasDeVisita(d: Datos, clienteId: string, ref: Date = hoy()): string[] {
  const sesCerradas = new Map(d.sesiones.filter((s) => s.cierre).map((s) => [s.id, s]));
  const dias = new Set<string>();
  for (const k of d.checkins) {
    if (k.clienteId !== clienteId) continue;
    const s = sesCerradas.get(k.sesionId);
    if (s && diasEntre(s.apertura, ref) >= 0) dias.add(s.apertura.slice(0, 10));
  }
  for (const p of d.pedidos) {
    if (p.clienteId === clienteId && diasEntre(p.fecha, ref) >= 0) dias.add(p.fecha.slice(0, 10));
  }
  return [...dias].sort();
}

export type Stats = {
  visitasTotales: number;
  visitas90: number;
  ultimaVisita: string | null;
  diasSinVenir: number | null;
  intervaloMedio: number | null;
  segmento: Segmento;
  enRiesgo: boolean;
  gastoEstimado: number;
  valoracionMedia: number | null;
};

export function statsCliente(d: Datos, c: Cliente, ref: Date = hoy()): Stats {
  const dias = diasDeVisita(d, c.id, ref);
  const d90 = dias.filter((x) => diasEntre(x, ref) <= 90);
  const ultima = dias.at(-1) ?? null;
  const diasSinVenir = ultima ? diasEntre(ultima, ref) : null;
  let intervalo: number | null = null;
  if (d90.length >= 2) {
    intervalo = diasEntre(d90[0], d90[d90.length - 1]) / (d90.length - 1);
  }
  let segmento: Segmento;
  if (d90.length < 3) {
    segmento = diasEntre(c.fechaAlta, ref) <= 30 ? "Nuevo" : "Ocasional";
  } else if (intervalo! <= 2) segmento = "Diario";
  else if (intervalo! <= 9) segmento = "Semanal";
  else if (intervalo! <= 16) segmento = "Quincenal";
  else segmento = "Ocasional";

  const umbral = UMBRAL_RIESGO[segmento];
  const enRiesgo = umbral !== null && diasSinVenir !== null && diasSinVenir > umbral;

  // Gasto estimado: importe de la sesión ÷ comensales + pedidos propios
  const sesPorId = new Map(d.sesiones.map((s) => [s.id, s]));
  let gasto = 0;
  for (const k of d.checkins) {
    if (k.clienteId !== c.id) continue;
    const s = sesPorId.get(k.sesionId);
    if (s && s.cierre) gasto += s.importe / Math.max(1, s.comensales);
  }
  for (const p of d.pedidos) if (p.clienteId === c.id) gasto += p.importe;

  const fbs = d.feedback.filter((f) => f.clienteId === c.id);
  const valoracionMedia = fbs.length ? fbs.reduce((s, f) => s + f.estrellas, 0) / fbs.length : null;

  return {
    visitasTotales: dias.length,
    visitas90: d90.length,
    ultimaVisita: ultima,
    diasSinVenir,
    intervaloMedio: intervalo,
    segmento,
    enRiesgo,
    gastoEstimado: Math.round(gasto * 100) / 100,
    valoracionMedia,
  };
}

// ---------- Pendientes ----------

export type TipoPendiente =
  | "feedback-negativo"
  | "alergia-hoy"
  | "presupuesto-sin-respuesta"
  | "celebracion-proxima"
  | "habitual-sin-cuenta"
  | "reactivacion"
  | "cumpleanos"
  | "resena"
  | "que-tal-fue";

export const INFO_PENDIENTE: Record<TipoPendiente, { prioridad: number; nombre: string; comercial: boolean }> = {
  "feedback-negativo": { prioridad: 1, nombre: "Feedback negativo", comercial: false },
  "alergia-hoy": { prioridad: 2, nombre: "Alergia en mesa hoy", comercial: false },
  "presupuesto-sin-respuesta": { prioridad: 3, nombre: "Presupuesto sin respuesta", comercial: false },
  "celebracion-proxima": { prioridad: 4, nombre: "Celebración próxima", comercial: false },
  "habitual-sin-cuenta": { prioridad: 5, nombre: "Habitual sin cuenta", comercial: false },
  reactivacion: { prioridad: 6, nombre: "Te echamos de menos", comercial: true },
  cumpleanos: { prioridad: 7, nombre: "Cumpleaños", comercial: true },
  resena: { prioridad: 8, nombre: "Pedir reseña", comercial: true },
  "que-tal-fue": { prioridad: 9, nombre: "Preguntar qué tal fue", comercial: false },
};

export type Pendiente = {
  clave: string;
  tipo: TipoPendiente;
  prioridad: number;
  clienteId: string;
  detalle: string;
  accion: string;
  canal: "whatsapp" | "llamada" | "en persona" | "interno";
  mensaje?: { motivo: MotivoMensaje; texto: string };
  ocultoPorCortesia?: boolean;
};

export const PLANTILLAS = {
  queTalFue: (n: string) => `Hola ${n}, gracias por venir a YOU. ¿Nos cuentas qué tal? Tardas 10 segundos: you-alcala.vercel.app/mi-cuenta`,
  reactivacion: (n: string) => `Hola ${n}, hace tiempo que no te vemos por YOU. ¡Te guardamos tu mesa cuando quieras!`,
  cumpleanos: (n: string) => `¡Feliz cumpleaños, ${n}! Todo el equipo de YOU te desea un día estupendo.`,
  resena: (n: string) => `Gracias por tu valoración, ${n}. Si te apetece contarlo en Google, nos ayudas muchísimo: g.page/r/you-alcala/review`,
};

const primerNombre = (c: Cliente) => c.nombre.split(" ")[0];

function ultimoMensaje(d: Datos, clienteId: string, motivo?: MotivoMensaje) {
  return d.mensajes
    .filter((m) => m.clienteId === clienteId && (!motivo || m.motivo === motivo))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
}

export function calcularPendientes(d: Datos, ref: Date = hoy()): Pendiente[] {
  const H = ref;
  const hoyDia = aDia(H);
  const out: Pendiente[] = [];
  const cli = new Map(d.clientes.map((c) => [c.id, c]));
  const stats = new Map(d.clientes.map((c) => [c.id, statsCliente(d, c, H)]));
  const wa = (c: Cliente) => c.consentimientoWhatsapp.acepta;

  // 1. Feedback negativo
  for (const f of d.feedback) {
    if (f.estrellas <= 3 && !f.respondido && cli.has(f.clienteId)) {
      out.push({
        clave: `fb:${f.id}`, tipo: "feedback-negativo", prioridad: 1, clienteId: f.clienteId,
        detalle: `${f.estrellas} estrellas: “${f.comentario || "sin comentario"}”`,
        accion: "Llamar o responder en 24 h", canal: "llamada",
      });
    }
  }

  // 2. Alergia en mesa hoy
  const conAlergiaHoy = new Set<string>();
  for (const r of d.reservas) {
    if (r.fechaHora.slice(0, 10) === hoyDia && r.estado !== "cancelada" && r.estado !== "no-show") conAlergiaHoy.add(r.clienteId);
  }
  const sesAbiertas = new Set(d.sesiones.filter((s) => !s.cierre).map((s) => s.id));
  for (const k of d.checkins) if (sesAbiertas.has(k.sesionId)) conAlergiaHoy.add(k.clienteId);
  for (const id of conAlergiaHoy) {
    const c = cli.get(id);
    if (c && c.alergias.length) {
      const r = d.reservas.find((x) => x.clienteId === id && x.fechaHora.slice(0, 10) === hoyDia);
      out.push({
        clave: `al:${id}:${hoyDia}`, tipo: "alergia-hoy", prioridad: 2, clienteId: id,
        detalle: `Alergia: ${c.alergias.join(", ")}${r ? ` · reserva ${r.fechaHora.slice(11)} para ${r.comensales}` : " · en mesa ahora"}`,
        accion: "Avisar a cocina", canal: "interno",
      });
    }
  }

  // 3. Presupuesto sin respuesta / 4. Celebración próxima
  for (const p of d.presupuestos) {
    if (p.estado === "enviado" && diasEntre(p.fechaEnvio, H) > 5) {
      out.push({
        clave: `pr:${p.id}`, tipo: "presupuesto-sin-respuesta", prioridad: 3, clienteId: p.clienteId,
        detalle: `${p.tipoEvento} · ${p.personas} personas · enviado hace ${diasEntre(p.fechaEnvio, H)} días`,
        accion: "Llamar al cliente", canal: "llamada",
      });
    }
    const falta = diasEntre(H, p.fechaEvento);
    if (p.estado === "ganado" && falta >= 0 && falta <= 3) {
      out.push({
        clave: `ce:${p.id}`, tipo: "celebracion-proxima", prioridad: 4, clienteId: p.clienteId,
        detalle: `${p.tipoEvento} · ${p.personas} personas · ${falta === 0 ? "hoy" : `dentro de ${falta} días`}`,
        accion: "Confirmar personas y menú", canal: "llamada",
      });
    }
  }

  for (const c of d.clientes) {
    const s = stats.get(c.id)!;
    const n = primerNombre(c);

    // 5. Habitual sin cuenta
    if (esHabitual(s.segmento) && !c.tieneCuenta) {
      out.push({
        clave: `cu:${c.id}`, tipo: "habitual-sin-cuenta", prioridad: 5, clienteId: c.id,
        detalle: `${s.segmento} · ${s.visitas90} visitas en 90 días y sin cuenta`,
        accion: "Proponerle registrarse en su próxima visita, o crearle la cuenta", canal: "en persona",
      });
    }

    // 6. Te echamos de menos
    if (esHabitual(s.segmento) && s.enRiesgo) {
      const m = ultimoMensaje(d, c.id, "reactivacion");
      if (!m || diasEntre(m.fecha, H) > 30) {
        out.push({
          clave: `re:${c.id}:${s.ultimaVisita}`, tipo: "reactivacion", prioridad: 6, clienteId: c.id,
          detalle: `${s.segmento} · lleva ${s.diasSinVenir} días sin venir (umbral ${UMBRAL_RIESGO[s.segmento]})`,
          accion: wa(c) ? "WhatsApp personal" : "Llamar (sin consentimiento de WhatsApp)",
          canal: wa(c) ? "whatsapp" : "llamada",
          mensaje: wa(c) ? { motivo: "reactivacion", texto: PLANTILLAS.reactivacion(n) } : undefined,
        });
      }
    }

    // 7. Cumpleaños
    if (c.cumpleanos && wa(c)) {
      const falta = cumpleDesde(H, c.cumpleanos);
      const yaFelicitado = d.mensajes.some((m) => m.clienteId === c.id && m.motivo === "cumpleaños" && desdeIso(m.fecha).getFullYear() === H.getFullYear());
      if (falta <= 7 && !yaFelicitado) {
        out.push({
          clave: `cb:${c.id}:${H.getFullYear()}`, tipo: "cumpleanos", prioridad: 7, clienteId: c.id,
          detalle: falta === 0 ? "Cumple hoy" : `Cumple dentro de ${falta} días`,
          accion: "Felicitación sin regalo", canal: "whatsapp",
          mensaje: { motivo: "cumpleaños", texto: PLANTILLAS.cumpleanos(n) },
        });
      }
    }

    // 8. Pedir reseña
    const fbBueno = d.feedback.find((f) => f.clienteId === c.id && f.estrellas >= 4 && diasEntre(f.fecha, H) <= 3);
    const tieneResena = d.resenas.some((r) => r.clienteId === c.id);
    const mRes = ultimoMensaje(d, c.id, "resena");
    if (fbBueno && !tieneResena && (!mRes || diasEntre(mRes.fecha, H) > 180)) {
      out.push({
        clave: `rs:${c.id}:${fbBueno.id}`, tipo: "resena", prioridad: 8, clienteId: c.id,
        detalle: `Valoró su visita con ${fbBueno.estrellas} estrellas`,
        accion: wa(c) ? "Enviar enlace de reseña de Google" : "Pedírsela en persona",
        canal: wa(c) ? "whatsapp" : "en persona",
        mensaje: wa(c) ? { motivo: "resena", texto: PLANTILLAS.resena(n) } : undefined,
      });
    }

    // 9. Preguntar qué tal fue
    if (c.tieneCuenta && wa(c)) {
      const ayer = new Date(H);
      ayer.setDate(ayer.getDate() - 1);
      const diaAyer = aDia(ayer);
      const origenes: { tipo: "sesion" | "pedido"; id: string }[] = [];
      for (const k of d.checkins) {
        if (k.clienteId !== c.id) continue;
        const ses = d.sesiones.find((x) => x.id === k.sesionId);
        if (ses && ses.cierre && ses.apertura.slice(0, 10) === diaAyer) origenes.push({ tipo: "sesion", id: ses.id });
      }
      for (const p of d.pedidos) if (p.clienteId === c.id && p.fecha.slice(0, 10) === diaAyer) origenes.push({ tipo: "pedido", id: p.id });
      const sinFb = origenes.find((o) => !d.feedback.some((f) => f.clienteId === c.id && f.origen.id === o.id));
      const mQ = ultimoMensaje(d, c.id, "que-tal-fue");
      if (sinFb && (!mQ || diasEntre(mQ.fecha, H) >= 1)) {
        out.push({
          clave: `qt:${c.id}:${sinFb.id}`, tipo: "que-tal-fue", prioridad: 9, clienteId: c.id,
          detalle: `Vino ayer y aún no ha valorado la visita`,
          accion: "Enviar “¿Qué tal fue?”", canal: "whatsapp",
          mensaje: { motivo: "que-tal-fue", texto: PLANTILLAS.queTalFue(n) },
        });
      }
    }
  }

  // Filtrar hechos y pospuestos
  const hechos = new Set(d.hechos.map((h) => h.clave));
  const pospuestos = new Set(d.pospuestos.filter((p) => p.hasta && diasEntre(H, p.hasta) > 0).map((p) => p.clave));
  let lista = out.filter((p) => !hechos.has(p.clave) && !pospuestos.has(p.clave));

  // Regla de cortesía: máx. 1 mensaje comercial por cliente cada 14 días
  const comercial = (m: MotivoMensaje) => m === "reactivacion" || m === "cumpleaños" || m === "resena";
  const porCliente = new Map<string, Pendiente[]>();
  for (const p of lista) {
    if (!INFO_PENDIENTE[p.tipo].comercial) continue;
    porCliente.set(p.clienteId, [...(porCliente.get(p.clienteId) ?? []), p]);
  }
  for (const [clienteId, ps] of porCliente) {
    const reciente = d.mensajes.some((m) => m.clienteId === clienteId && comercial(m.motivo) && diasEntre(m.fecha, H) < 14);
    ps.sort((a, b) => a.prioridad - b.prioridad);
    ps.forEach((p, i) => {
      if (reciente || i > 0) p.ocultoPorCortesia = true;
    });
  }

  lista = lista.sort((a, b) => a.prioridad - b.prioridad || a.clienteId.localeCompare(b.clienteId));
  return lista;
}

// ---------- KPIs ----------

export type Kpis = {
  activos60: number;
  activos60Antes: number;
  enRiesgo: number;
  enRiesgoAntes: number;
  valoracion: number | null;
  valoracionAntes: number | null;
  negativosSinResponder: number;
  ingresos: { total: number; sala: number; llevar: number; celebraciones: number };
  ingresosAntes: number;
  pctHabitualesConCuenta: number | null;
};

function ventana(fecha: string, ref: Date, desde: number, hasta: number) {
  const n = diasEntre(fecha, ref);
  return n >= desde && n < hasta;
}

function kpiBase(d: Datos, ref: Date) {
  let activos = 0, riesgo = 0, habituales = 0, conCuenta = 0;
  for (const c of d.clientes) {
    const s = statsCliente(d, c, ref);
    if (s.diasSinVenir !== null && s.diasSinVenir <= 60) activos++;
    if (esHabitual(s.segmento)) {
      habituales++;
      if (c.tieneCuenta) conCuenta++;
      if (s.enRiesgo) riesgo++;
    }
  }
  return { activos, riesgo, habituales, conCuenta };
}

function ingresos(d: Datos, ref: Date, desde: number, hasta: number) {
  const sala = d.sesiones.filter((s) => s.cierre && ventana(s.apertura, ref, desde, hasta)).reduce((a, s) => a + s.importe, 0);
  const llevar = d.pedidos.filter((p) => ventana(p.fecha, ref, desde, hasta)).reduce((a, p) => a + p.importe, 0);
  const celebraciones = d.presupuestos.filter((p) => p.estado === "ganado" && ventana(p.fechaEvento, ref, desde, hasta)).reduce((a, p) => a + p.importe, 0);
  return { sala, llevar, celebraciones, total: sala + llevar + celebraciones };
}

function media(d: Datos, ref: Date, desde: number, hasta: number) {
  const f = d.feedback.filter((x) => ventana(x.fecha, ref, desde, hasta));
  return f.length ? f.reduce((a, x) => a + x.estrellas, 0) / f.length : null;
}

export function calcularKpis(d: Datos, ref: Date = hoy()): Kpis {
  const ahora = kpiBase(d, ref);
  const hace30 = new Date(ref);
  hace30.setDate(hace30.getDate() - 30);
  const antes = kpiBase(d, hace30);
  return {
    activos60: ahora.activos,
    activos60Antes: antes.activos,
    enRiesgo: ahora.riesgo,
    enRiesgoAntes: antes.riesgo,
    valoracion: media(d, ref, 0, 30),
    valoracionAntes: media(d, ref, 30, 60),
    negativosSinResponder: d.feedback.filter((f) => f.estrellas <= 3 && !f.respondido).length,
    ingresos: ingresos(d, ref, 0, 30),
    ingresosAntes: ingresos(d, ref, 30, 60).total,
    pctHabitualesConCuenta: ahora.habituales ? Math.round((ahora.conCuenta / ahora.habituales) * 100) : null,
  };
}
