"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PINES, setRol, type Rol } from "@/lib/rol";

const PERFILES: { rol: Rol; titulo: string; texto: string; destino: string }[] = [
  { rol: "direccion", titulo: "Dirección", texto: "CRM completo: clientes, pendientes, mesas, presupuestos, carta y formación.", destino: "/" },
  { rol: "empleado", titulo: "Empleado en formación", texto: "Solo la sección de formación: fichas de platos y protocolos de sala.", destino: "/formacion" },
];

export default function Acceso() {
  const router = useRouter();
  const [sel, setSel] = useState<Rol | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="text-5xl font-black tracking-tight text-red-700">YOU</div>
          <div className="text-sm text-stone-500">Restaurante asiático · Alcalá de Henares</div>
        </div>
        <div className="space-y-3">
          {PERFILES.map((p) => (
            <button key={p.rol} onClick={() => { setSel(p.rol); setPin(""); setError(""); }} className={`w-full rounded-xl border bg-white p-4 text-left shadow-sm ${sel === p.rol ? "border-red-600 ring-1 ring-red-600" : "border-stone-200 hover:border-stone-300"}`}>
              <div className="font-semibold">{p.titulo}</div>
              <div className="text-sm text-stone-600">{p.texto}</div>
            </button>
          ))}
        </div>
        {sel && (
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (pin !== PINES[sel]) return setError("PIN incorrecto.");
              setRol(sel);
              router.replace(PERFILES.find((p) => p.rol === sel)!.destino);
            }}
          >
            <input autoFocus type="password" inputMode="numeric" placeholder="PIN" className="w-full rounded-md border border-stone-300 px-3 py-2 text-base focus:border-red-600 focus:outline-none" value={pin} onChange={(e) => setPin(e.target.value)} />
            <button type="submit" className="rounded-md bg-red-700 px-4 py-2 font-medium text-white">Entrar</button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <p className="mt-6 text-center text-xs text-stone-400">Demo: PIN de Dirección {PINES.direccion} · PIN de Empleado {PINES.empleado}. Acceso simulado, sin seguridad real.</p>
      </div>
    </div>
  );
}
