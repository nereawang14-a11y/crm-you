"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { calcularPendientes, statsCliente, UMBRAL_RIESGO } from "@/lib/reglas";
import { plato } from "@/lib/seed";
import { OpcionesCarta } from "@/components/carta";
import { fmtEuros, fmtFecha, fmtFechaHora, haceTexto } from "@/lib/fechas";
import type { Cliente, Plato } from "@/lib/types";
import { Badge, Boton, Card, Estrellas, PendienteItem, SegmentoBadge, inputCls } from "@/components/ui";

type Evento = { fecha: string; tipo: string; titulo: React.ReactNode; detalle?: React.ReactNode; color: string };

export default function Ficha() {
  const { id } = useParams<{ id: string }>();
  const st = useStore();
  const { datos } = st;
  const c = datos.clientes.find((x) => x.id === id);
  const [editando, setEditando] = useState(false);
  const [verTodo, setVerTodo] = useState(false);
  if (!c) return <Card>Cliente no encontrado. <Link href="/clientes" className="text-oro-700">Volver</Link></Card>;
  const s = statsCliente(datos, c);
  const pend = calcularPendientes(datos).filter((p) => p.clienteId === c.id);

  const sesPorId = new Map(datos.sesiones.map((x) => [x.id, x]));
  const ev: Evento[] = [];
  for (const k of datos.checkins.filter((k) => k.clienteId === c.id)) {
    const ses = sesPorId.get(k.sesionId);
    if (!ses) continue;
    const otros = datos.checkins.filter((x) => x.sesionId === ses.id && x.clienteId !== c.id).map((x) => datos.clientes.find((cc) => cc.id === x.clienteId)?.nombre.split(" ")[0]);
    ev.push({
      fecha: ses.apertura, tipo: "Visita en sala", color: "bg-emerald-500",
      titulo: <>Mesa {ses.mesa} · {ses.comensales} comensales{otros.length ? ` · con ${otros.join(", ")}` : ""}{!ses.cierre && <Badge className="ml-2 bg-amber-100 text-amber-800">Mesa abierta</Badge>}</>,
      detalle: ses.cierre ? <>{ses.platos.map((p) => `${p.cantidad}× ${p.nombre}`).join(", ")} · ticket {fmtEuros(ses.importe)} ({fmtEuros(ses.importe / Math.max(1, ses.comensales))} por persona){k.platosMarcados.length ? ` · marcó: ${k.platosMarcados.join(", ")}` : ""}</> : `Check-in ${k.hechoPor === "personal" ? "hecho por el personal" : "con QR"}`,
    });
  }
  for (const p of datos.pedidos.filter((p) => p.clienteId === c.id)) {
    ev.push({ fecha: p.fecha, tipo: "Pedido para llevar", color: "bg-sky-500", titulo: <>{fmtEuros(p.importe)} · {p.canal} · {p.entrega}{p.botellaRegalo && <Badge className="ml-2 bg-rose-100 text-rose-800">Incluir botella de vino</Badge>}</>, detalle: p.platos.map((x) => `${x.cantidad}× ${x.nombre}`).join(", ") });
  }
  for (const r of datos.reservas.filter((r) => r.clienteId === c.id)) ev.push({ fecha: r.fechaHora, tipo: "Reserva", color: "bg-violet-500", titulo: `${r.comensales} personas · ${r.canal} · ${r.estado}` });
  for (const b of datos.presupuestos.filter((b) => b.clienteId === c.id)) ev.push({ fecha: b.fechaEnvio, tipo: "Presupuesto", color: "bg-amber-500", titulo: `${b.tipoEvento} · ${b.personas} personas · ${fmtEuros(b.importe)} · ${b.estado}`, detalle: `Evento el ${fmtFecha(b.fechaEvento)}${b.motivoPerdida ? ` · motivo: ${b.motivoPerdida}` : ""}` });
  for (const f of datos.feedback.filter((f) => f.clienteId === c.id)) ev.push({ fecha: f.fecha, tipo: "Feedback", color: f.estrellas <= 3 ? "bg-red-500" : "bg-amber-400", titulo: <><Estrellas n={f.estrellas} /> {!f.respondido && <Badge className="ml-2 bg-red-100 text-red-700">Sin responder</Badge>}</>, detalle: <>{f.comentario || "Sin comentario"}{f.respuesta ? ` · Respuesta: ${f.respuesta}` : ""}</> });
  for (const m of datos.mensajes.filter((m) => m.clienteId === c.id)) ev.push({ fecha: m.fecha, tipo: "Mensaje enviado", color: "bg-stone-400", titulo: m.motivo, detalle: `“${m.texto}”` });
  for (const g of datos.resenas.filter((g) => g.clienteId === c.id)) ev.push({ fecha: g.fecha, tipo: "Reseña en Google", color: "bg-yellow-500", titulo: <Estrellas n={g.estrellas} /> });
  ev.sort((a, b) => b.fecha.localeCompare(a.fecha));
  const eventos = verTodo ? ev : ev.slice(0, 12);

  return (
    <div className="max-w-6xl">
      <Link href="/clientes" className="text-sm text-stone-500 hover:text-oro-700">← Clientes</Link>
      <div className="mb-6 mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{c.nombre}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <span>{c.telefono}</span>
            <SegmentoBadge s={s.segmento} riesgo={s.enRiesgo} menos={s.vieneMenos} />
            {c.tieneCuenta ? <Badge className="bg-emerald-100 text-emerald-800">Cuenta {c.cuentaCreadaPor === "personal" ? "creada por el personal" : "creada por el cliente"}</Badge> : <Badge className="bg-amber-100 text-amber-800">Sin cuenta</Badge>}
            {c.empresa && <span>· {c.empresa}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {!c.tieneCuenta && <Boton onClick={() => st.actualizarCliente(c.id, { tieneCuenta: true, cuentaCreadaPor: "personal" })}>Crear cuenta para este cliente</Boton>}
          <Boton variante="secundario" onClick={() => setEditando(!editando)}>{editando ? "Cerrar edición" : "Editar datos"}</Boton>
        </div>
      </div>

      {c.alergias.length > 0 && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 font-medium text-red-800">Alergias: {c.alergias.join(", ")} — avisar a cocina en cada visita</div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <Card>
            <h2 className="mb-3 font-semibold">Resumen</h2>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-stone-500">Última visita</dt><dd>{s.ultimaVisita ? `${fmtFecha(s.ultimaVisita)} (${haceTexto(s.diasSinVenir!)})` : "—"}</dd>
              <dt className="text-stone-500">Visitas (90 días)</dt><dd>{s.visitas90} de {s.visitasTotales} en total</dd>
              <dt className="text-stone-500">Frecuencia</dt><dd>{s.intervaloMedio ? `cada ${s.intervaloMedio.toFixed(1).replace(".", ",")} días` : "—"}</dd>
              <dt className="text-stone-500">Umbral de riesgo</dt><dd>{UMBRAL_RIESGO[s.segmento] ? `${UMBRAL_RIESGO[s.segmento]} días sin venir` : "No aplica"}</dd>
              <dt className="text-stone-500">Gasto estimado</dt><dd>{fmtEuros(s.gastoEstimado)}</dd>
              <dt className="text-stone-500">Valoración media</dt><dd>{s.valoracionMedia ? <Estrellas n={s.valoracionMedia} /> : "—"}</dd>
            </dl>
          </Card>
          {editando ? <EditarCliente c={c} /> : <Preferencias c={c} />}
          <NuevoPedido cliente={c} />
        </div>

        <div className="space-y-4 lg:col-span-2">
          {pend.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold">Pendientes de {c.nombre.split(" ")[0]}</h2>
              {pend.map((p) => <PendienteItem key={p.clave} p={p} />)}
            </div>
          )}
          <FeedbackSinResponder clienteId={c.id} />
          <Card>
            <h2 className="mb-4 font-semibold">Historial de interacciones</h2>
            <ol className="relative space-y-4 border-l border-stone-200 pl-5">
              {eventos.map((e, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${e.color}`} />
                  <div className="text-xs text-stone-500">{fmtFechaHora(e.fecha)} · <span className="font-medium text-stone-700">{e.tipo}</span></div>
                  <div className="text-sm text-stone-900">{e.titulo}</div>
                  {e.detalle && <div className="text-sm text-stone-600">{e.detalle}</div>}
                </li>
              ))}
            </ol>
            {ev.length > 12 && <button onClick={() => setVerTodo(!verTodo)} className="mt-4 text-sm text-oro-700 hover:underline">{verTodo ? "Ver menos" : `Ver las ${ev.length} interacciones`}</button>}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Preferencias({ c }: { c: Cliente }) {
  const fila = (k: string, v: React.ReactNode) => (<><dt className="text-stone-500">{k}</dt><dd>{v || <span className="text-stone-400">—</span>}</dd></>);
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Preferencias</h2>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        {fila("Platos favoritos", c.platosFavoritos.join(", "))}
        {fila("Mesa preferida", c.mesaPreferida)}
        {fila("Día y hora", c.diaHoraHabitual)}
        {fila("Comensales", c.comensalesHabitual)}
        {fila("Cumpleaños", c.cumpleanos ? c.cumpleanos.split("-").reverse().join("/") : null)}
        {fila("Canal preferido", c.canalPreferido)}
        {fila("Cómo nos conoció", c.comoNosConocio)}
        {fila("WhatsApp comercial", c.consentimientoWhatsapp.acepta ? "Sí, aceptado" : "No")}
        {fila("Ticket", c.tieneCuenta && c.ticketDigital ? "🌱 Digital, en su móvil" : "En papel")}
        {fila("Pedido de siempre", c.pedidoHabitual?.map((p) => `${p.cantidad}× ${p.nombre}`).join(", "))}
        {fila("Notas", c.notas)}
      </dl>
    </Card>
  );
}

function EditarCliente({ c }: { c: Cliente }) {
  const { actualizarCliente } = useStore();
  const [f, setF] = useState({
    nombre: c.nombre, telefono: c.telefono, platos: c.platosFavoritos.join(", "), mesa: c.mesaPreferida ?? "", dia: c.diaHoraHabitual ?? "", com: c.comensalesHabitual ?? "",
    cumple: c.cumpleanos ?? "", empresa: c.empresa ?? "", notas: c.notas, wa: c.consentimientoWhatsapp.acepta, consAl: c.consentimientoAlergias, alergias: c.alergias.join(", "),
    canal: c.canalPreferido ?? "", como: c.comoNosConocio ?? "", ticket: c.ticketDigital !== false,
  });
  const campo = (label: string, k: keyof typeof f, ph = "") => (
    <div><label className="text-xs text-stone-500">{label}</label><input className={inputCls} placeholder={ph} value={String(f[k])} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></div>
  );
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Editar datos</h2>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          actualizarCliente(c.id, {
            nombre: f.nombre, telefono: f.telefono,
            platosFavoritos: f.platos.split(",").map((x) => x.trim()).filter(Boolean),
            mesaPreferida: f.mesa === "" ? null : Number(f.mesa), diaHoraHabitual: f.dia || null, comensalesHabitual: f.com === "" ? null : Number(f.com),
            cumpleanos: /^\d{2}-\d{2}$/.test(f.cumple) ? f.cumple : null, empresa: f.empresa || null, notas: f.notas,
            consentimientoWhatsapp: { acepta: f.wa, fecha: f.wa ? c.consentimientoWhatsapp.fecha ?? new Date().toISOString().slice(0, 16) : null },
            ticketDigital: f.ticket,
            consentimientoAlergias: f.consAl,
            alergias: f.consAl ? f.alergias.split(",").map((x) => x.trim()).filter(Boolean) : [],
            canalPreferido: (f.canal || null) as Cliente["canalPreferido"], comoNosConocio: (f.como || null) as Cliente["comoNosConocio"],
          });
        }}
      >
        {campo("Nombre", "nombre")}
        {campo("Teléfono", "telefono")}
        {campo("Platos favoritos (separados por comas)", "platos")}
        <div className="grid grid-cols-2 gap-2">{campo("Mesa preferida", "mesa")}{campo("Comensales", "com")}</div>
        {campo("Día y hora habitual", "dia", "Sábado 14:00")}
        {campo("Cumpleaños (MM-DD)", "cumple", "03-25")}
        {campo("Empresa", "empresa")}
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs text-stone-500">Canal preferido</label>
            <select className={inputCls} value={f.canal} onChange={(e) => setF({ ...f, canal: e.target.value })}><option value="">—</option><option value="whatsapp">WhatsApp</option><option value="llamada">Llamada</option></select></div>
          <div><label className="text-xs text-stone-500">Cómo nos conoció</label>
            <select className={inputCls} value={f.como} onChange={(e) => setF({ ...f, como: e.target.value })}><option value="">—</option>{["google", "boca a boca", "paso por la calle", "redes", "otro"].map((o) => <option key={o}>{o}</option>)}</select></div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.ticket} onChange={(e) => setF({ ...f, ticket: e.target.checked })} /> Ticket digital en el móvil (sin papel)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.wa} onChange={(e) => setF({ ...f, wa: e.target.checked })} /> Acepta mensajes de WhatsApp de YOU</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.consAl} onChange={(e) => setF({ ...f, consAl: e.target.checked })} /> Consiente guardar sus alergias (dato de salud)</label>
        {f.consAl && campo("Alergias (separadas por comas)", "alergias", "Marisco, frutos secos")}
        <div><label className="text-xs text-stone-500">Notas</label><textarea className={inputCls} rows={2} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} /></div>
        <Boton type="submit">Guardar</Boton>
      </form>
    </Card>
  );
}

function FeedbackSinResponder({ clienteId }: { clienteId: string }) {
  const { datos, responderFeedback } = useStore();
  const [texto, setTexto] = useState("");
  const f = datos.feedback.find((x) => x.clienteId === clienteId && !x.respondido);
  if (!f) return null;
  return (
    <Card className="border-red-200">
      <h2 className="mb-2 font-semibold text-red-800">Feedback sin responder</h2>
      <div className="text-sm"><Estrellas n={f.estrellas} /> · {fmtFechaHora(f.fecha)}</div>
      <p className="mt-1 text-sm text-stone-700">“{f.comentario}”</p>
      <div className="mt-3 flex gap-2">
        <input className={inputCls} placeholder="Respuesta o nota de la llamada…" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <Boton onClick={() => { responderFeedback(f.id, texto || "Llamada realizada"); setTexto(""); }}>Responder</Boton>
      </div>
    </Card>
  );
}

function NuevoPedido({ cliente }: { cliente: Cliente }) {
  const clienteId = cliente.id;
  const { crearPedido } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [lineas, setLineas] = useState<Plato[]>([]);
  const [sel, setSel] = useState("Rollo de primavera");
  const [canal, setCanal] = useState<"telefono" | "web" | "whatsapp">("telefono");
  const [ok, setOk] = useState<string | null>(null);
  const total = lineas.reduce((s, p) => s + p.cantidad * p.precio, 0);
  if (!abierto)
    return (
      <div>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={() => { setAbierto(true); setOk(null); }}>+ Registrar pedido para llevar</Boton>
          {cliente.pedidoHabitual && (
            <Boton onClick={() => { setLineas(cliente.pedidoHabitual!.map((p) => ({ ...p }))); setAbierto(true); setOk(null); }}>
              Repetir pedido de siempre ({fmtEuros(cliente.pedidoHabitual.reduce((a, p) => a + p.cantidad * p.precio, 0))})
            </Boton>
          )}
        </div>
        {ok && <p className={`mt-2 rounded-md px-3 py-2 text-sm font-medium ${ok.includes("botella") ? "bg-rose-50 text-rose-800" : "text-emerald-700"}`}>{ok}</p>}
      </div>
    );
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Pedido para llevar</h2>
      <div className="flex gap-2">
        <select className={inputCls} value={sel} onChange={(e) => setSel(e.target.value)}><OpcionesCarta paraLlevar /></select>
        <Boton variante="secundario" onClick={() => {
          const i = lineas.findIndex((l) => l.nombre === sel);
          setLineas(i >= 0 ? lineas.map((l, j) => (j === i ? { ...l, cantidad: l.cantidad + 1 } : l)) : [...lineas, plato(sel)]);
        }}>Añadir</Boton>
      </div>
      <ul className="mt-3 space-y-1 text-sm">{lineas.map((l) => <li key={l.nombre} className="flex justify-between"><span>{l.cantidad}× {l.nombre}</span><span>{fmtEuros(l.cantidad * l.precio)}</span></li>)}</ul>
      <div className="mt-2 flex justify-between border-t pt-2 text-sm font-semibold"><span>Total</span><span>{fmtEuros(total)}</span></div>
      {total > 60 && <div className="mt-2 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-800">Más de 60 €: incluir botella de vino de regalo</div>}
      <div className="mt-3 flex items-center gap-2">
        <select className={inputCls} value={canal} onChange={(e) => setCanal(e.target.value as typeof canal)}><option value="telefono">Teléfono</option><option value="web">Web</option><option value="whatsapp">WhatsApp</option></select>
        <Boton disabled={!lineas.length} onClick={() => {
          const p = crearPedido({ clienteId, canal, platos: lineas, entrega: "recogida" });
          setOk(p.botellaRegalo ? "Pedido registrado. Incluir botella de vino." : "Pedido registrado.");
          setLineas([]); setAbierto(false);
        }}>Registrar</Boton>
        <button className="text-sm text-stone-500" onClick={() => setAbierto(false)}>Cancelar</button>
      </div>
      {ok && <p className="mt-2 text-sm text-emerald-700">{ok}</p>}
    </Card>
  );
}
