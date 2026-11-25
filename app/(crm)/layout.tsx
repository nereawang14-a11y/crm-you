"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { calcularPendientes } from "@/lib/reglas";
import { fmtFecha, hoy, aIso, nombreDia } from "@/lib/fechas";

const MENU = [
  { href: "/", label: "Panel" },
  { href: "/pendientes", label: "Pendientes" },
  { href: "/clientes", label: "Clientes" },
  { href: "/mesas", label: "Mesas" },
  { href: "/presupuestos", label: "Presupuestos" },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { datos, restablecer } = useStore();
  const nPend = calcularPendientes(datos).filter((p) => !p.ocultoPorCortesia).length;
  const H = hoy();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
        <div className="px-5 py-6">
          <div className="text-3xl font-black tracking-tight text-red-700">YOU</div>
          <div className="text-xs text-stone-500">Restaurante asiático · Alcalá de Henares</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {MENU.map((m) => {
            const activo = m.href === "/" ? path === "/" : path.startsWith(m.href);
            return (
              <Link key={m.href} href={m.href} className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${activo ? "bg-red-50 font-medium text-red-800" : "text-stone-700 hover:bg-stone-50"}`}>
                {m.label}
                {m.href === "/pendientes" && nPend > 0 && <span className="rounded-full bg-red-700 px-2 text-xs text-white">{nPend}</span>}
              </Link>
            );
          })}
          <div className="pt-4">
            <div className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-stone-400">Vista del cliente</div>
            <a href="/mesa/4" target="_blank" className="block rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">QR mesa 4 ↗</a>
            <a href="/mi-cuenta" target="_blank" className="block rounded-md px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">Mi cuenta ↗</a>
          </div>
        </nav>
        <div className="border-t border-stone-200 p-4 text-xs text-stone-500">
          <div className="mb-2 capitalize">{nombreDia(H)}, {fmtFecha(aIso(H))}</div>
          <button
            onClick={() => {
              if (confirm("¿Restablecer todos los datos de ejemplo?")) restablecer();
            }}
            className="w-full rounded-md border border-stone-300 px-3 py-1.5 text-stone-700 hover:bg-stone-50"
          >
            Restablecer demo
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
