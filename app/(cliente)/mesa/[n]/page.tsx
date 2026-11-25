"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { setClienteActual } from "@/lib/sesionCliente";
import type { Cliente } from "@/lib/types";
import { Boton, Card, inputCls } from "@/components/ui";
import { MESAS, nombreMesa } from "@/lib/mesas";

export default function MesaQR() {
  const { n } = useParams<{ n: string }>();
  const mesa = Number(n);
  const { buscarPorTelefono, crearCliente, checkIn, actualizarCliente } = useStore();
  const [esNuevo, setEsNuevo] = useState(false);
  const [paso, setPaso] = useState<"telefono" | "registro" | "hecho">("telefono");
  const [tel, setTel] = useState("");
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [error, setError] = useState("");
  const [f, setF] = useState({ nombre: "", wa: false, consAl: false, alergias: "", cumple: "" });

  if (!MESAS.includes(mesa)) return <Card>Mesa no válida.</Card>;

  const entrar = (c: Cliente) => {
    checkIn(mesa, c.id, "cliente");
    setClienteActual(c.id);
    setCliente(c);
    setPaso("hecho");
  };

  return (
    <div>
      <div className="mb-5 text-center">
        <div className="text-sm text-stone-500">Estás en</div>
        <div className="text-4xl font-bold text-stone-900">{nombreMesa(mesa)}</div>
      </div>

      {paso === "telefono" && (
        <Card>
          <h1 className="text-lg font-semibold">Únete a tu mesa</h1>
          <p className="mt-1 text-sm text-stone-600">Así guardamos lo que pides, tus alergias y podrás valorar cada visita.</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (tel.replace(/\D/g, "").length < 9) return setError("Introduce un teléfono de 9 cifras.");
              setError("");
              const c = buscarPorTelefono(tel);
              if (c && c.tieneCuenta) entrar(c);
              else if (c) {
                setCliente(c);
                setF({ ...f, nombre: c.nombre });
                setPaso("registro");
              } else setPaso("registro");
            }}
          >
            <input className={`${inputCls} text-base`} inputMode="tel" placeholder="Tu teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-red-700 py-3 font-medium text-white">Estoy en {nombreMesa(mesa).toLowerCase()}</button>
          </form>
          <p className="mt-3 text-xs text-stone-500">Si ya tienes cuenta, entras directamente. Si no, te la creamos en 30 segundos.</p>
        </Card>
      )}

      {paso === "registro" && (
        <Card>
          <h1 className="text-lg font-semibold">{cliente ? `¡Hola, ${cliente.nombre.split(" ")[0]}! Activa tu cuenta` : "Crea tu cuenta"}</h1>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!f.nombre.trim()) return setError("Dinos tu nombre.");
              const datosCuenta: Partial<Cliente> = {
                nombre: f.nombre.trim(),
                tieneCuenta: true,
                cuentaCreadaPor: "cliente",
                consentimientoWhatsapp: { acepta: f.wa, fecha: f.wa ? new Date().toISOString().slice(0, 16) : null },
                consentimientoAlergias: f.consAl,
                alergias: f.consAl ? f.alergias.split(",").map((x) => x.trim()).filter(Boolean) : [],
                cumpleanos: /^\d{2}-\d{2}$/.test(f.cumple) ? f.cumple : null,
                canalPreferido: f.wa ? "whatsapp" : null,
              };
              if (cliente) {
                // cliente que ya existía en el CRM (lo registró el personal) y activa su cuenta
                actualizarCliente(cliente.id, datosCuenta);
                setEsNuevo(true);
                entrar({ ...cliente, ...datosCuenta } as Cliente);
              } else {
                const c = crearCliente({ ...datosCuenta, nombre: f.nombre.trim(), telefono: tel.trim() }, "cliente");
                setEsNuevo(true);
                entrar(c);
              }
            }}
          >
            <div><label className="text-xs text-stone-500">Nombre</label><input className={`${inputCls} text-base`} value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></div>
            <div><label className="text-xs text-stone-500">Teléfono</label><input className={`${inputCls} bg-stone-100 text-base`} value={tel} readOnly /></div>
            <div>
              <label className="text-xs text-stone-500">Cumpleaños (opcional, día y mes)</label>
              <input type="date" className={`${inputCls} text-base`} onChange={(e) => setF({ ...f, cumple: e.target.value ? e.target.value.slice(5) : "" })} />
            </div>
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.consAl} onChange={(e) => setF({ ...f, consAl: e.target.checked })} /> Quiero que YOU guarde mis alergias para avisar a cocina en cada visita.</label>
            {f.consAl && <input className={`${inputCls} text-base`} placeholder="Ej.: marisco, frutos secos" value={f.alergias} onChange={(e) => setF({ ...f, alergias: e.target.value })} />}
            <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={f.wa} onChange={(e) => setF({ ...f, wa: e.target.checked })} /> Acepto recibir mensajes de YOU por WhatsApp (felicitaciones, preguntarme qué tal fue). Puedo darme de baja cuando quiera.</label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full rounded-lg bg-red-700 py-3 font-medium text-white">Crear cuenta y unirme a {nombreMesa(mesa).toLowerCase()}</button>
            <p className="text-xs text-stone-500">Responsable: YOU (restaurante familiar, Alcalá de Henares). Usamos tus datos para guardar tu historial y avisos de alergias y, si lo aceptas, para escribirte. Puedes editarlos o borrar tu cuenta desde “Mi cuenta”.</p>
          </form>
        </Card>
      )}

      {paso === "hecho" && cliente && (
        <Card className="text-center">
          <div className="text-4xl">🥢</div>
          <h1 className="mt-2 text-xl font-semibold">{esNuevo ? "¡Bienvenido a YOU" : "¡Bienvenido de nuevo"}, {cliente.nombre.split(" ")[0]}!</h1>
          <p className="mt-1 text-sm text-stone-600">Ya estás en {nombreMesa(mesa).toLowerCase()}. Que aproveche.</p>
          {cliente.alergias.length > 0 && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">Avisaremos a cocina de tu alergia: {cliente.alergias.join(", ")}.</p>}
          <Link href="/mi-cuenta" className="mt-4 inline-block"><Boton variante="secundario">Ver mi cuenta</Boton></Link>
        </Card>
      )}
    </div>
  );
}
