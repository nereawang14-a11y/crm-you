"use client";

import { useStore } from "@/lib/store";
import { CARTA, CATEGORIAS } from "@/lib/carta";
import { diasEntre, fmtEuros, hoy } from "@/lib/fechas";
import { Badge, Card, Titulo } from "@/components/ui";

export default function Carta() {
  const { datos } = useStore();
  const H = hoy();
  // Unidades vendidas en los últimos 30 días (sala + para llevar)
  const vendidos = new Map<string, number>();
  const sumar = (nombre: string, n: number) => vendidos.set(nombre, (vendidos.get(nombre) ?? 0) + n);
  for (const s of datos.sesiones) if (s.cierre && diasEntre(s.apertura, H) <= 30) s.platos.forEach((p) => sumar(p.nombre, p.cantidad));
  for (const p of datos.pedidos) if (diasEntre(p.fecha, H) <= 30) p.platos.forEach((x) => sumar(x.nombre, x.cantidad));
  const top = [...vendidos.entries()].filter(([n]) => !CARTA.find((c) => c.nombre === n)?.categoria.match(/Bebidas|Menú del día/)).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="max-w-5xl">
      <Titulo sub={`${CARTA.length} productos. Carta real de restauranteyou.com; bebidas y postres con precio estimado.`}>Carta</Titulo>
      <Card className="mb-6">
        <h2 className="mb-3 font-semibold">Platos más pedidos (últimos 30 días)</h2>
        <ol className="grid grid-cols-1 gap-x-8 gap-y-1 text-sm md:grid-cols-2">
          {top.map(([n, u], i) => (
            <li key={n} className="flex justify-between border-b border-stone-100 py-1">
              <span><span className="mr-2 text-stone-400">{i + 1}.</span>{n}</span>
              <span className="text-stone-600">{u} uds.</span>
            </li>
          ))}
        </ol>
      </Card>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {CATEGORIAS.map((cat) => (
          <Card key={cat}>
            <h2 className="mb-2 font-semibold">{cat}</h2>
            <ul className="space-y-1 text-sm">
              {CARTA.filter((p) => p.categoria === cat).map((p) => (
                <li key={p.codigo} className="flex justify-between gap-3">
                  <span>
                    <span className="mr-1 text-xs text-stone-400">{p.codigo}</span> {p.nombre}
                    {p.soloSala && <Badge className="ml-1 bg-stone-100 text-stone-600">Solo sala · L-V</Badge>}
                    {p.estimado && <Badge className="ml-1 bg-amber-50 text-amber-700">Estimado</Badge>}
                  </span>
                  <span className="whitespace-nowrap text-stone-700">{fmtEuros(p.precio)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
