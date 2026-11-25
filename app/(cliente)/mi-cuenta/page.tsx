"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getClienteActual, setClienteActual } from "@/lib/sesionCliente";
import { diasEntre, fmtEuros, fmtFecha, hoy } from "@/lib/fechas";
import type { Cliente, Feedback, Plato } from "@/lib/types";
import { Boton, Card, Estrellas, inputCls } from "@/components/ui";

type Item = { tipo: "sesion" | "pedido"; id: string; fecha: string; titulo: string; platos: Plato[]; checkinId?: string; marcados: string[]; abierta?: boolean };

export default function MiCuenta() {
  const { datos, buscarPorTelefono } = useStore();
  const [id, setId] = useState<string | null>(null);
  const [cargado, setCargado] = useState(false);
  const [tel, setTel] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    setId(getClienteActual());
    setCargado(true);
  }, []);
  const c = datos.clientes.find((x) => x.id === id && x.tieneCuenta);

  if (!cargado) return null;
  if (!c)
    return (
      <Card>
        <h1 className="text-lg font-semibold">Mi cuenta</h1>
        <p className="mt-1 text-sm text-stone-600">Entra con tu teléfono para ver tus visitas y valorarlas.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const cl = buscarPorTelefono(tel);
            if (!cl || !cl.tieneCuenta) return setError("No encontramos una cuenta con ese teléfono. Escanea el QR de tu mesa para crearla.");
            setClienteActual(cl.id);
            setId(cl.id);
          }}
        >
          <input className={`${inputCls} text-base`} inputMode="tel" placeholder="Tu teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-red-700 py-3 font-medium text-white">Entrar</button>
          <p className="text-xs text-stone-500">Demo: acceso simulado sin contraseña. Prueba con 688 901 201 (Diego Romero).</p>
        </form>
      </Card>
    );

  return <Cuenta c={c} salir={() => { setClienteActual(null); setId(null); }} />;
}

function Cuenta({ c, salir }: { c: Cliente; salir: () => void }) {
  const { datos } = useStore();
  const [tab, setTab] = useState<"historial" | "datos">("historial");
  const sesPorId = new Map(datos.sesiones.map((s) => [s.id, s]));
  const items: Item[] = [];
  for (const k of datos.checkins.filter((k) => k.clienteId === c.id)) {
    const s = sesPorId.get(k.sesionId);
    if (s) items.push({ tipo: "sesion", id: s.id, fecha: s.apertura, titulo: `En sala · mesa ${s.mesa} · ${s.comensales} pers.`, platos: s.platos, checkinId: k.id, marcados: k.platosMarcados, abierta: !s.cierre });
  }
  for (const p of datos.pedidos.filter((p) => p.clienteId === c.id)) items.push({ tipo: "pedido", id: p.id, fecha: p.fecha, titulo: `Para llevar · ${fmtEuros(p.importe)}`, platos: p.platos, marcados: [] });
  items.sort((a, b) => b.fecha.localeCompare(a.fecha));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-sm text-stone-500">Hola,</div>
          <h1 className="text-2xl font-semibold">{c.nombre.split(" ")[0]}</h1>
        </div>
        <button onClick={salir} className="text-sm text-stone-500 underline">Salir</button>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-stone-200 p-1 text-sm">
        <button onClick={() => setTab("historial")} className={`rounded-md py-2 ${tab === "historial" ? "bg-white font-medium shadow-sm" : ""}`}>Mis visitas ({items.length})</button>
        <button onClick={() => setTab("datos")} className={`rounded-md py-2 ${tab === "datos" ? "bg-white font-medium shadow-sm" : ""}`}>Mis datos</button>
      </div>
      {tab === "historial" ? (
        <div className="space-y-3">
          {items.length === 0 && <Card>Aún no hay visitas. ¡Te esperamos!</Card>}
          {items.slice(0, 20).map((it) => <Visita key={`${it.tipo}-${it.id}`} it={it} c={c} />)}
        </div>
      ) : (
        <MisDatos c={c} salir={salir} />
      )}
    </div>
  );
}

function Visita({ it, c }: { it: Item; c: Cliente }) {
  const { datos, valorar, marcarPlatos } = useStore();
  const fb = datos.feedback.find((f) => f.clienteId === c.id && f.origen.id === it.id);
  const [estrellas, setEstrellas] = useState(0);
  const [comentario, setComentario] = useState("");
  const [abierto, setAbierto] = useState(false);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-stone-500">{fmtFecha(it.fecha)}</div>
          <div className="font-medium">{it.titulo}</div>
        </div>
        {fb && <Estrellas n={fb.estrellas} />}
      </div>
      {it.abierta ? (
        <p className="mt-2 text-sm text-stone-500">Mesa en curso. Podrás valorarla cuando termines.</p>
      ) : (
        <>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {it.platos.map((p, i) => {
              const marcado = it.marcados.includes(p.nombre);
              return (
                <li key={`${p.nombre}-${i}`}>
                  <button
                    disabled={!it.checkinId}
                    onClick={() => it.checkinId && marcarPlatos(it.checkinId, marcado ? it.marcados.filter((x) => x !== p.nombre) : [...it.marcados, p.nombre])}
                    className={`rounded-full px-2.5 py-1 text-xs ${marcado ? "bg-red-700 text-white" : "bg-stone-100 text-stone-700"}`}
                  >
                    {p.cantidad > 1 ? `${p.cantidad}× ` : ""}{p.nombre}{marcado ? " ✓" : ""}
                  </button>
                </li>
              );
            })}
          </ul>
          {it.checkinId && <p className="mt-1 text-xs text-stone-400">Toca un plato para marcar “esto lo pedí yo”.</p>}
          {fb ? (
            fb.comentario && <p className="mt-2 text-sm italic text-stone-600">“{fb.comentario}”</p>
          ) : diasEntre(it.fecha, hoy()) > 14 ? (
            <p className="mt-2 text-xs text-stone-400">Sin valorar</p>
          ) : !abierto ? (
            <button onClick={() => setAbierto(true)} className="mt-3 w-full rounded-lg border border-red-700 py-2 text-sm font-medium text-red-700">¿Qué tal fue? Valorar</button>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setEstrellas(n)} className={`text-3xl ${n <= estrellas ? "text-amber-500" : "text-stone-300"}`} aria-label={`${n} estrellas`}>★</button>
                ))}
              </div>
              <textarea className={inputCls} rows={2} placeholder="Cuéntanos (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} />
              <Boton disabled={!estrellas} onClick={() => valorar(c.id, { tipo: it.tipo, id: it.id }, estrellas as Feedback["estrellas"], comentario)}>Enviar valoración</Boton>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function MisDatos({ c, salir }: { c: Cliente; salir: () => void }) {
  const { actualizarCliente, borrarCuenta } = useStore();
  const [f, setF] = useState({ platos: c.platosFavoritos.join(", "), wa: c.consentimientoWhatsapp.acepta, consAl: c.consentimientoAlergias, alergias: c.alergias.join(", ") });
  const [ok, setOk] = useState(false);
  return (
    <Card>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          actualizarCliente(c.id, {
            platosFavoritos: f.platos.split(",").map((x) => x.trim()).filter(Boolean),
            consentimientoWhatsapp: { acepta: f.wa, fecha: f.wa ? c.consentimientoWhatsapp.fecha ?? new Date().toISOString().slice(0, 16) : null },
            consentimientoAlergias: f.consAl,
            alergias: f.consAl ? f.alergias.split(",").map((x) => x.trim()).filter(Boolean) : [],
          });
          setOk(true);
        }}
      >
        <div><label className="text-xs text-stone-500">Mis platos favoritos</label><input className={`${inputCls} text-base`} value={f.platos} onChange={(e) => { setF({ ...f, platos: e.target.value }); setOk(false); }} /></div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.consAl} onChange={(e) => { setF({ ...f, consAl: e.target.checked }); setOk(false); }} /> Guardar mis alergias para avisar a cocina</label>
        {f.consAl && <input className={`${inputCls} text-base`} placeholder="Ej.: marisco" value={f.alergias} onChange={(e) => { setF({ ...f, alergias: e.target.value }); setOk(false); }} />}
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.wa} onChange={(e) => { setF({ ...f, wa: e.target.checked }); setOk(false); }} /> Recibir mensajes de YOU por WhatsApp</label>
        <Boton type="submit">Guardar</Boton>
        {ok && <p className="text-sm text-emerald-700">Guardado.</p>}
      </form>
      <hr className="my-5 border-stone-200" />
      <button
        onClick={() => {
          if (confirm("¿Borrar tu cuenta? Se eliminan tus alergias, cumpleaños y consentimientos.")) {
            borrarCuenta(c.id);
            salir();
          }
        }}
        className="text-sm text-red-700 underline"
      >
        Borrar mi cuenta
      </button>
    </Card>
  );
}
