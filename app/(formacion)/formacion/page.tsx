"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FICHAS } from "@/lib/formacion";
import { getProgreso } from "@/lib/rol";
import { Badge, Card } from "@/components/ui";

export default function Formacion() {
  const [tipo, setTipo] = useState<"todas" | "cocina" | "sala">("todas");
  const [hechas, setHechas] = useState<string[]>([]);
  useEffect(() => setHechas(getProgreso()), []);
  const lista = FICHAS.filter((f) => tipo === "todas" || f.tipo === tipo);
  const pct = Math.round((hechas.filter((h) => FICHAS.some((f) => f.id === h)).length / FICHAS.length) * 100);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Know-how de YOU</h1>
      <p className="mt-1 max-w-2xl text-sm text-stone-600">Cómo preparamos nuestros platos y cómo atendemos en sala, para que cada cliente reciba siempre la misma calidad. Lee cada ficha y márcala como aprendida cuando la domines.</p>

      <Card className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tu progreso</span>
          <span className="text-stone-600">{hechas.length} de {FICHAS.length} fichas · {pct} %</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-stone-100">
          <div className="h-2 rounded-full bg-stone-900 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Card>

      <div className="mt-5 flex gap-2">
        {([["todas", "Todas"], ["cocina", "Cocina"], ["sala", "Sala"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTipo(k)} className={`rounded-full px-3 py-1 text-sm ${tipo === k ? "bg-stone-900 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}>{l}</button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {lista.map((f) => (
          <Link key={f.id} href={`/formacion/${f.id}`}>
            <Card className="h-full transition hover:border-oro">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-stone-400">{f.tipo === "cocina" ? "Cocina" : "Sala"} · {f.categoria}{f.codigoCarta ? ` · nº ${f.codigoCarta}` : ""}</div>
                  <div className="mt-0.5 font-semibold">{f.titulo}</div>
                </div>
                {hechas.includes(f.id) ? <Badge className="bg-emerald-100 text-emerald-800">Aprendida ✓</Badge> : <Badge className="bg-stone-100 text-stone-600">{f.nivel}</Badge>}
              </div>
              <p className="mt-2 text-sm text-stone-600">{f.resumen}</p>
              <div className="mt-2 text-xs text-stone-400">⏱ {f.tiempo}</div>
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-xs text-stone-400">Fichas en borrador: las cantidades y trucos deben validarlos los responsables de cocina. Alérgenos orientativos: consulta siempre la ficha oficial de alérgenos.</p>
    </div>
  );
}
