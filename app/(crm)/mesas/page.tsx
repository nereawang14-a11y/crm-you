"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useStore } from "@/lib/store";
import { plato } from "@/lib/seed";
import { OpcionesCarta } from "@/components/carta";
import { fmtEuros } from "@/lib/fechas";
import type { Plato, SesionMesa } from "@/lib/types";
import { Badge, Boton, Card, Titulo, inputCls } from "@/components/ui";
import { MESAS, nombreMesa } from "@/lib/mesas";
import { destinatariosDigitales } from "@/lib/tickets";
import { Logo } from "@/components/logo";



export default function Mesas() {
  const { datos } = useStore();
  const [qr, setQr] = useState<number | null>(null);
  const [origen, setOrigen] = useState("");
  useEffect(() => setOrigen(window.location.origin), []);
  const abiertas = new Map(datos.sesiones.filter((s) => !s.cierre).map((s) => [s.mesa, s]));

  return (
    <div className="max-w-6xl">
      <Titulo sub="23 mesas en sala y 4 en terraza. Cada mesa tiene su QR. Cuando un cliente lo escanea y hace check-in, aparece aquí. Al cerrar la mesa (simula el TPV), la visita queda registrada para cada persona.">Mesas de hoy</Titulo>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MESAS.map((n) => (
          <Mesa key={n} n={n} sesion={abiertas.get(n)} onQr={() => setQr(n)} />
        ))}
      </div>

      {qr !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setQr(null)}>
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <Logo size="md" />
            <div className="mb-4 text-stone-600">{nombreMesa(qr)} · Escanea y únete a tu mesa</div>
            <QRCodeSVG value={`${origen}/mesa/${qr}`} size={220} />
            <div className="mt-3 text-xs text-stone-500">{origen}/mesa/{qr}</div>
            <div className="mt-4 flex justify-center gap-2">
              <a href={`/mesa/${qr}`} target="_blank" className="rounded-md bg-stone-900 px-3 py-2 text-sm font-medium text-white">Abrir en otra pestaña ↗</a>
              <Boton variante="secundario" onClick={() => setQr(null)}>Cerrar</Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Mesa({ n, sesion, onQr }: { n: number; sesion?: SesionMesa; onQr: () => void }) {
  const { datos, checkIn, quitarCheckIn, buscarPorTelefono, cerrarMesa } = useStore();
  const [tel, setTel] = useState("");
  const [err, setErr] = useState("");
  const [cerrando, setCerrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const checkins = sesion ? datos.checkins.filter((k) => k.sesionId === sesion.id) : [];
  const cli = new Map(datos.clientes.map((c) => [c.id, c]));

  return (
    <Card className={sesion ? "border-emerald-300" : ""}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">{nombreMesa(n)}</div>
        <div className="flex items-center gap-2">
          {sesion ? <Badge className="bg-emerald-100 text-emerald-800">Abierta</Badge> : <Badge className="bg-stone-100 text-stone-500">Libre</Badge>}
          <button onClick={onQr} className="rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50">QR</button>
        </div>
      </div>

      {checkins.length > 0 && (
        <ul className="mt-3 space-y-1">
          {checkins.map((k) => {
            const c = cli.get(k.clienteId);
            if (!c) return null;
            return (
              <li key={k.id} className="flex items-center justify-between text-sm">
                <span>
                  <Link href={`/clientes/${c.id}`} className="font-medium hover:text-oro-700">{c.nombre}</Link>
                  <span className="text-xs text-stone-500"> · {k.hechoPor === "cliente" ? "QR" : "personal"}</span>
                  {c.alergias.length > 0 && <Badge className="ml-2 bg-red-100 text-red-700">{c.alergias.join(", ")}</Badge>}
                </span>
                <button onClick={() => quitarCheckIn(k.id)} className="text-xs text-stone-400 hover:text-oro-700">quitar</button>
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const c = buscarPorTelefono(tel);
          if (!c) return setErr("No hay ningún cliente con ese teléfono.");
          checkIn(n, c.id, "personal");
          setTel("");
          setErr("");
        }}
      >
        <input className={inputCls} placeholder="Añadir comensal por teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
        <Boton type="submit" variante="secundario">Añadir</Boton>
      </form>
      {err && <p className="mt-1 text-xs text-red-700">{err}</p>}

      {sesion && !cerrando && (
        <div className="mt-3">
          <Boton onClick={() => setCerrando(true)}>Cerrar mesa (TPV)</Boton>
        </div>
      )}
      {sesion && !cerrando && checkins.length > 0 && (() => {
        const dig = destinatariosDigitales(datos, sesion.id);
        return dig.length > 0 ? <p className="mt-2 text-xs text-emerald-700">🌱 Ticket digital para: {dig.map((c) => c.nombre.split(" ")[0]).join(", ")}</p> : <p className="mt-2 text-xs text-stone-500">Ticket en papel (nadie de la mesa tiene ticket digital)</p>;
      })()}
      {sesion && cerrando && (
        <CerrarMesa
          sesion={sesion}
          minComensales={checkins.length}
          onFin={(cerrada) => {
            setCerrando(false);
            if (cerrada) {
              const dig = destinatariosDigitales(datos, sesion.id);
              setAviso(dig.length ? `Ticket ${sesion.numeroTicket} enviado al móvil de ${dig.map((c) => c.nombre.split(" ")[0]).join(", ")}. No hace falta imprimirlo 🌱` : `Ticket ${sesion.numeroTicket}: imprimir en papel.`);
            }
          }}
          cerrar={cerrarMesa}
        />
      )}
      {aviso && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{aviso}</p>}
    </Card>
  );
}

function CerrarMesa({ sesion, minComensales, onFin, cerrar }: { sesion: SesionMesa; minComensales: number; onFin: (cerrada: boolean) => void; cerrar: (id: string, p: Plato[], c: number) => void }) {
  const [lineas, setLineas] = useState<Plato[]>([]);
  const [sel, setSel] = useState("Menú del día A");
  const [com, setCom] = useState(Math.max(1, minComensales));
  const total = lineas.reduce((s, p) => s + p.cantidad * p.precio, 0);
  return (
    <div className="mt-3 rounded-lg bg-stone-50 p-3">
      <div className="flex gap-2">
        <select className={inputCls} value={sel} onChange={(e) => setSel(e.target.value)}><OpcionesCarta /></select>
        <Boton variante="secundario" onClick={() => {
          const i = lineas.findIndex((l) => l.nombre === sel);
          setLineas(i >= 0 ? lineas.map((l, j) => (j === i ? { ...l, cantidad: l.cantidad + 1 } : l)) : [...lineas, plato(sel)]);
        }}>+</Boton>
      </div>
      <ul className="mt-2 space-y-1 text-sm">{lineas.map((l) => <li key={l.nombre} className="flex justify-between"><span>{l.cantidad}× {l.nombre}</span><span>{fmtEuros(l.cantidad * l.precio)}</span></li>)}</ul>
      <div className="mt-2 flex items-center justify-between border-t border-stone-200 pt-2 text-sm">
        <label className="flex items-center gap-2">Comensales <input type="number" min={Math.max(1, minComensales)} className="w-16 rounded border border-stone-300 px-2 py-1" value={com} onChange={(e) => setCom(Number(e.target.value))} /></label>
        <span className="font-semibold">{fmtEuros(total)}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Boton disabled={!lineas.length} onClick={() => { cerrar(sesion.id, lineas, Math.max(com, minComensales, 1)); onFin(true); }}>Cobrar y cerrar</Boton>
        <Boton variante="secundario" onClick={() => onFin(false)}>Cancelar</Boton>
      </div>
    </div>
  );
}
