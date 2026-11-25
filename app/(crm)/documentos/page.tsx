"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { calcularPendientes } from "@/lib/reglas";
import { ANTELACION, CAMPANAS, DOCUMENTOS, REGLAS_ENVIO, proximaFecha } from "@/lib/documentos";
import { fmtFecha, hoy, rel } from "@/lib/fechas";
import { descargarWord } from "@/lib/word";
import { Badge, Card, PendienteItem, Titulo } from "@/components/ui";

export default function Documentos() {
  const { datos } = useStore();
  const [copiado, setCopiado] = useState<string | null>(null);
  const H = hoy();
  const cli = new Map(datos.clientes.map((c) => [c.id, c]));
  const recordatorios = calcularPendientes(datos).filter((p) => p.tipo === "recordatorio-anual");
  const campanas = CAMPANAS.map((c) => {
    const { dias, fecha } = proximaFecha(H, c.fecha);
    const diasEnvio = dias - c.envioDiasAntes;
    return { ...c, dias, fecha, diasEnvio, fechaEnvio: rel(H, diasEnvio, "00:00") };
  }).sort((a, b) => a.diasEnvio - b.diasEnvio);

  const copiar = async (id: string) => {
    const url = `${window.location.origin}/doc/${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="max-w-6xl">
      <Titulo sub="Documentos para compartir con clientes, recordatorios de celebraciones anuales y calendario de campañas sin saturar.">Documentos y campañas</Titulo>

      <h2 className="mb-3 text-lg font-semibold">Documentos para compartir</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {DOCUMENTOS.map((d) => (
          <Card key={d.id}>
            <div className="font-semibold">{d.titulo}</div>
            <p className="mt-1 text-sm text-stone-600">{d.descripcion}</p>
            <p className="mt-1 text-xs text-stone-500">Para: {d.paraQuien}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`/doc/${d.id}`} target="_blank" className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800">Ver y descargar PDF ↗</a>
              <button onClick={() => descargarWord(d.id)} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">Word (editable)</button>
              <button onClick={() => copiar(d.id)} className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">{copiado === d.id ? "¡Enlace copiado!" : "Copiar enlace para el cliente"}</button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-1 mt-8 text-lg font-semibold">Recordatorios de celebraciones anuales</h2>
      <p className="mb-3 text-sm text-stone-600">
        Si un cliente celebró con nosotros hace un año, el CRM avisa con antelación para enviarle la propuesta y no perderlo:{" "}
        {Object.values(ANTELACION).map((a, i) => <span key={a.tipo}>{i > 0 && " · "}<strong>{a.tipo}</strong> {a.dias} días antes</span>)}.
      </p>
      <div className="space-y-3">
        {recordatorios.map((p) => <PendienteItem key={p.clave} p={p} cliente={cli.get(p.clienteId)} />)}
        {recordatorios.length === 0 && <Card className="text-sm text-stone-500">Ningún aniversario de celebración en las próximas semanas.</Card>}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold">Calendario de campañas</h2>
          <Card className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs uppercase tracking-wide text-stone-500">
                <tr><th className="px-4 py-3">Campaña</th><th className="px-4 py-3">Enviar el</th><th className="px-4 py-3">A quién</th><th className="px-4 py-3">Documento</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {campanas.map((c) => (
                  <tr key={c.id} className="align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.nombre}</div>
                      <div className="text-xs text-stone-500">{c.idea}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {c.diasEnvio <= 0 ? <Badge className="bg-red-100 text-red-700">Enviar ya</Badge> : c.diasEnvio <= 14 ? <Badge className="bg-amber-100 text-amber-800">En {c.diasEnvio} días</Badge> : <span>{fmtFecha(c.fechaEnvio)}</span>}
                      <div className="text-xs text-stone-500">Fecha clave: {fmtFecha(c.fecha)}</div>
                    </td>
                    <td className="px-4 py-3">{c.segmento}</td>
                    <td className="px-4 py-3"><Link href={`/doc/${c.documento}`} target="_blank" className="text-red-700 hover:underline">{DOCUMENTOS.find((d) => d.id === c.documento)?.titulo}</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-semibold">Reglas para no ser un tostón</h2>
          <Card>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-stone-700">{REGLAS_ENVIO.map((r) => <li key={r}>{r}</li>)}</ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
