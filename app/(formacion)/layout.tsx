"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { setRol, useRol } from "@/lib/rol";
import { Logo } from "@/components/logo";

export default function FormacionLayout({ children }: { children: React.ReactNode }) {
  const rol = useRol();
  const router = useRouter();
  useEffect(() => {
    if (rol === null) router.replace("/acceso");
  }, [rol, router]);
  if (!rol) return <div className="flex min-h-screen items-center justify-center text-stone-500">Cargando…</div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3">
          <Link href="/formacion" className="flex items-baseline gap-2">
            <Logo size="sm" />
            <span className="text-sm font-medium text-stone-600">Formación del equipo</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {rol === "direccion" ? (
              <Link href="/" className="text-stone-600 hover:text-oro-700">← Volver al CRM</Link>
            ) : (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">Empleado en formación</span>
            )}
            <button onClick={() => { setRol(null); router.replace("/acceso"); }} className="text-stone-500 underline">Salir</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
