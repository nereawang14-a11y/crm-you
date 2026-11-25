"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { esHabitual, statsCliente, type Segmento } from "@/lib/reglas";
import { fmtFecha, haceTexto } from "@/lib/fechas";
import { Badge, Boton, Card, Estrellas, SegmentoBadge, Titulo, inputCls } from "@/components/ui";

export default function Clientes() {
  const { datos, crearCliente, buscarPorTelefono } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<Segmento | "todos" | "riesgo" | "menos" | "sin-cuenta" | "habituales">("todos");
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "" });
  const [error, setError] = useState("");

  const filas = datos.clientes
    .map((c) => ({ c, s: statsCliente(datos, c) }))
    .filter(({ c }) => {
      const t = q.toLowerCase().trim();
      return !t || c.nombre.toLowerCase().includes(t) || c.telefono.replace(/\D/g, "").includes(t.replace(/\D/g, "") || "§");
    })
    .filter(({ c, s }) => {
      if (seg === "todos") return true;
      if (seg === "riesgo") return s.enRiesgo;
      if (seg === "menos") return s.vieneMenos;
      if (seg === "sin-cuenta") return !c.tieneCuenta;
      if (seg === "habituales") return esHabitual(s.segmento);
      return s.segmento === seg;
    })
    .sort((a, b) => (b.s.ultimaVisita ?? "").localeCompare(a.s.ultimaVisita ?? ""));

  const filtros: [typeof seg, string][] = [
    ["todos", "Todos"], ["habituales", "Habituales"], ["riesgo", "En riesgo"], ["menos", "Viene menos"], ["sin-cuenta", "Sin cuenta"],
    ["Diario", "Diario"], ["Semanal", "Semanal"], ["Quincenal", "Quincenal"], ["Ocasional", "Ocasional"], ["Nuevo", "Nuevo"],
  ];

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between">
        <Titulo sub={`${datos.clientes.length} clientes identificados. Cada persona es un cliente por separado.`}>Clientes</Titulo>
        <Boton onClick={() => setNuevo(!nuevo)}>+ Nuevo cliente</Boton>
      </div>

      {nuevo && (
        <Card className="mb-4">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.nombre.trim() || form.telefono.replace(/\D/g, "").length < 9) return setError("Nombre y teléfono (9 cifras) obligatorios.");
              if (buscarPorTelefono(form.telefono)) return setError("Ya existe un cliente con ese teléfono.");
              const c = crearCliente({ nombre: form.nombre.trim(), telefono: form.telefono.trim() }, "personal");
              router.push(`/clientes/${c.id}`);
            }}
          >
            <div className="w-64"><label className="text-xs text-stone-500">Nombre</label><input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="w-48"><label className="text-xs text-stone-500">Teléfono</label><input className={inputCls} value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></div>
            <Boton type="submit">Crear cuenta para este cliente</Boton>
            {error && <span className="text-sm text-red-700">{error}</span>}
          </form>
          <p className="mt-2 text-xs text-stone-500">Para clientes poco digitales: el personal crea la cuenta. Los consentimientos se recogen después en su ficha.</p>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input placeholder="Buscar por nombre o teléfono…" className={`${inputCls} max-w-xs`} value={q} onChange={(e) => setQ(e.target.value)} />
        {filtros.map(([k, l]) => (
          <button key={k} onClick={() => setSeg(k)} className={`rounded-full px-3 py-1 text-sm ${seg === k ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>{l}</button>
        ))}
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Segmento</th>
              <th className="px-4 py-3">Última visita</th>
              <th className="px-4 py-3 text-right">Visitas (90 d)</th>
              <th className="px-4 py-3">Valoración</th>
              <th className="px-4 py-3">Cuenta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filas.map(({ c, s }) => (
              <tr key={c.id} className="hover:bg-stone-50">
                <td className="px-4 py-3">
                  <Link href={`/clientes/${c.id}`} className="font-medium text-stone-900 hover:text-oro-700">{c.nombre}</Link>
                  <div className="text-xs text-stone-500">{c.telefono}{c.empresa ? ` · ${c.empresa}` : ""}</div>
                </td>
                <td className="px-4 py-3"><SegmentoBadge s={s.segmento} riesgo={s.enRiesgo} menos={s.vieneMenos} /></td>
                <td className="px-4 py-3">{s.ultimaVisita ? <>{fmtFecha(s.ultimaVisita)} <span className="text-xs text-stone-500">({haceTexto(s.diasSinVenir!)})</span></> : "—"}</td>
                <td className="px-4 py-3 text-right">{s.visitas90}</td>
                <td className="px-4 py-3">{s.valoracionMedia ? <Estrellas n={s.valoracionMedia} /> : <span className="text-stone-400">—</span>}</td>
                <td className="px-4 py-3">
                  {c.tieneCuenta ? <Badge className="bg-emerald-100 text-emerald-800">{c.cuentaCreadaPor === "personal" ? "Sí (personal)" : "Sí"}</Badge> : <Badge className="bg-amber-100 text-amber-800">No</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filas.length === 0 && <div className="p-4 text-sm text-stone-500">Ningún cliente coincide con el filtro.</div>}
      </Card>
    </div>
  );
}
