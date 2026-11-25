"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FICHAS } from "@/lib/formacion";
import { getProgreso, setProgreso } from "@/lib/rol";
import { Badge, Card } from "@/components/ui";

export default function FichaFormacion() {
  const { id } = useParams<{ id: string }>();
  const f = FICHAS.find((x) => x.id === id);
  const [hechas, setHechas] = useState<string[]>([]);
  useEffect(() => setHechas(getProgreso()), []);
  if (!f) return <Card>Ficha no encontrada. <Link href="/formacion" className="text-red-700">Volver</Link></Card>;
  const aprendida = hechas.includes(f.id);
  const toggle = () => {
    const n = aprendida ? hechas.filter((h) => h !== f.id) : [...hechas, f.id];
    setHechas(n);
    setProgreso(n);
  };
  const idx = FICHAS.indexOf(f);
  const sig = FICHAS[idx + 1];

  return (
    <div className="max-w-3xl">
      <Link href="/formacion" className="text-sm text-stone-500 hover:text-red-700">← Todas las fichas</Link>
      <div className="mt-2 text-xs uppercase tracking-wide text-stone-400">{f.tipo === "cocina" ? "Cocina" : "Sala"} · {f.categoria}{f.codigoCarta ? ` · nº de carta ${f.codigoCarta}` : ""}</div>
      <h1 className="text-2xl font-semibold">{f.titulo}</h1>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge className="bg-stone-100 text-stone-700">⏱ {f.tiempo}</Badge>
        <Badge className="bg-stone-100 text-stone-700">Nivel: {f.nivel}</Badge>
      </div>
      <p className="mt-4 text-stone-700">{f.resumen}</p>

      <div className="mt-6 space-y-4">
        {f.ingredientes && (
          <Card>
            <h2 className="mb-2 font-semibold">Ingredientes y mise en place</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">{f.ingredientes.map((x) => <li key={x}>{x}</li>)}</ul>
          </Card>
        )}
        <Card>
          <h2 className="mb-2 font-semibold">{f.tipo === "cocina" ? "Preparación paso a paso" : "Cómo se hace"}</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">{f.pasos.map((x) => <li key={x}>{x}</li>)}</ol>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/40">
          <h2 className="mb-2 font-semibold text-emerald-900">Claves de calidad</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">{f.calidad.map((x) => <li key={x}>{x}</li>)}</ul>
        </Card>
        {f.emplatado && (
          <Card>
            <h2 className="mb-2 font-semibold">Emplatado</h2>
            <p className="text-sm">{f.emplatado}</p>
          </Card>
        )}
        {f.errores && (
          <Card className="border-amber-200 bg-amber-50/40">
            <h2 className="mb-2 font-semibold text-amber-900">Errores frecuentes</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">{f.errores.map((x) => <li key={x}>{x}</li>)}</ul>
          </Card>
        )}
        {f.alergenos && (
          <Card className="border-red-200">
            <h2 className="mb-2 font-semibold text-red-800">Alérgenos (orientativo)</h2>
            <div className="flex flex-wrap gap-1">{f.alergenos.map((x) => <Badge key={x} className="bg-red-100 text-red-800">{x}</Badge>)}</div>
            <p className="mt-2 text-xs text-stone-500">Confírmalos siempre con la ficha oficial de alérgenos del restaurante.</p>
          </Card>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button onClick={toggle} className={`rounded-md px-4 py-2 text-sm font-medium ${aprendida ? "border border-emerald-600 text-emerald-700" : "bg-red-700 text-white hover:bg-red-800"}`}>
          {aprendida ? "Aprendida ✓ (desmarcar)" : "Marcar como aprendida"}
        </button>
        {sig && <Link href={`/formacion/${sig.id}`} className="text-sm text-red-700 hover:underline">Siguiente: {sig.titulo} →</Link>}
      </div>
    </div>
  );
}
