"use client";
const K = "crm-you-cliente";
export const getClienteActual = () => {
  try { return localStorage.getItem(K); } catch { return null; }
};
export const setClienteActual = (id: string | null) => {
  try { if (id) localStorage.setItem(K, id); else localStorage.removeItem(K); } catch {}
};
