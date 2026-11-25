"use client";

import { useEffect, useState } from "react";

export type Rol = "direccion" | "empleado";
const K = "crm-you-rol";

// Acceso SIMULADO para la demo: los PIN están en el código y se muestran en pantalla.
export const PINES: Record<Rol, string> = { direccion: "2026", empleado: "1111" };

export function getRol(): Rol | null {
  try {
    const r = localStorage.getItem(K);
    return r === "direccion" || r === "empleado" ? r : null;
  } catch {
    return null;
  }
}
export function setRol(r: Rol | null) {
  try {
    if (r) localStorage.setItem(K, r);
    else localStorage.removeItem(K);
  } catch {}
}

/** undefined mientras carga (evita parpadeos); null si no hay sesión. */
export function useRol() {
  const [rol, set] = useState<Rol | null | undefined>(undefined);
  useEffect(() => set(getRol()), []);
  return rol;
}

// Progreso de formación del empleado (por dispositivo)
const KP = "crm-you-formacion";
export function getProgreso(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KP) ?? "[]");
  } catch {
    return [];
  }
}
export function setProgreso(ids: string[]) {
  try {
    localStorage.setItem(KP, JSON.stringify(ids));
  } catch {}
}
