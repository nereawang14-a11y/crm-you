"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Cliente, Datos, Feedback, PedidoLlevar, Plato, Presupuesto } from "./types";
import { generarDatos, totalPlatos, VERSION_DATOS } from "./seed";
import { aDia, aIso, hoy, rel } from "./fechas";
import type { Pendiente } from "./reglas";

const CLAVE = "crm-you-datos";

type Acciones = {
  datos: Datos;
  actualizar: (fn: (d: Datos) => Datos) => void;
  restablecer: () => void;
  actualizarCliente: (id: string, cambios: Partial<Cliente>) => void;
  crearCliente: (c: Partial<Cliente> & { nombre: string; telefono: string }, creadoPor: "cliente" | "personal") => Cliente;
  buscarPorTelefono: (tel: string) => Cliente | undefined;
  checkIn: (mesa: number, clienteId: string, hechoPor: "cliente" | "personal") => void;
  quitarCheckIn: (checkinId: string) => void;
  cerrarMesa: (sesionId: string, platos: Plato[], comensales: number) => void;
  valorar: (clienteId: string, origen: Feedback["origen"], estrellas: Feedback["estrellas"], comentario: string) => void;
  responderFeedback: (id: string, respuesta: string) => void;
  marcarPlatos: (checkinId: string, platos: string[]) => void;
  completarPendiente: (p: Pendiente) => void;
  posponerPendiente: (p: Pendiente) => void;
  crearPresupuesto: (p: Omit<Presupuesto, "id" | "fechaEnvio" | "estado" | "motivoPerdida">) => void;
  cambiarEstadoPresupuesto: (id: string, estado: Presupuesto["estado"], motivo?: string) => void;
  crearPedido: (p: Omit<PedidoLlevar, "id" | "importe" | "botellaRegalo" | "fecha">) => PedidoLlevar;
  borrarCuenta: (clienteId: string) => void;
};

const Ctx = createContext<Acciones | null>(null);

const uid = (p: string) => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const normTel = (t: string) => t.replace(/\D/g, "");

function cargar(): Datos {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw) {
      const d = JSON.parse(raw) as Datos;
      // Datos de otro día o versión → se regeneran para que la demo siempre cuadre con HOY
      if (d.version === VERSION_DATOS && d.fechaSemilla === aDia(hoy())) return d;
    }
  } catch {}
  return generarDatos();
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [datos, setDatos] = useState<Datos | null>(null);

  useEffect(() => {
    setDatos(cargar());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CLAVE && e.newValue) {
        try {
          setDatos(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (datos) {
      try {
        localStorage.setItem(CLAVE, JSON.stringify(datos));
      } catch {}
    }
  }, [datos]);

  const actualizar = useCallback((fn: (d: Datos) => Datos) => setDatos((d) => (d ? fn(d) : d)), []);

  const acciones = useMemo<Acciones | null>(() => {
    if (!datos) return null;
    const ahora = () => aIso(new Date());
    return {
      datos,
      actualizar,
      restablecer: () => {
        try {
          localStorage.removeItem(CLAVE);
        } catch {}
        setDatos(generarDatos());
      },
      actualizarCliente: (id, cambios) =>
        actualizar((d) => ({ ...d, clientes: d.clientes.map((c) => (c.id === id ? { ...c, ...cambios } : c)) })),
      crearCliente: (c, creadoPor) => {
        const nuevo: Cliente = {
          id: uid("c"),
          fechaAlta: ahora(),
          tieneCuenta: true,
          cuentaCreadaPor: creadoPor,
          consentimientoWhatsapp: { acepta: false, fecha: null },
          consentimientoAlergias: false,
          alergias: [],
          cumpleanos: null,
          platosFavoritos: [],
          mesaPreferida: null,
          diaHoraHabitual: null,
          comensalesHabitual: null,
          canalPreferido: null,
          comoNosConocio: null,
          empresa: null,
          notas: "",
          ...c,
        };
        actualizar((d) => ({ ...d, clientes: [...d.clientes, nuevo] }));
        return nuevo;
      },
      buscarPorTelefono: (tel) => datos.clientes.find((c) => normTel(c.telefono) === normTel(tel) && normTel(tel).length > 0),
      checkIn: (mesa, clienteId, hechoPor) =>
        actualizar((d) => {
          let ses = d.sesiones.find((s) => s.mesa === mesa && !s.cierre);
          const sesiones = [...d.sesiones];
          if (!ses) {
            ses = { id: uid("s"), mesa, apertura: ahora(), cierre: null, comensales: 0, platos: [], importe: 0, numeroTicket: `T-${2000 + d.sesiones.length}` };
            sesiones.push(ses);
          }
          if (d.checkins.some((k) => k.sesionId === ses!.id && k.clienteId === clienteId)) return { ...d, sesiones };
          return {
            ...d,
            sesiones,
            checkins: [...d.checkins, { id: uid("k"), sesionId: ses.id, clienteId, fecha: ahora(), hechoPor, platosMarcados: [] }],
          };
        }),
      quitarCheckIn: (id) => actualizar((d) => ({ ...d, checkins: d.checkins.filter((k) => k.id !== id) })),
      cerrarMesa: (sesionId, platos, comensales) =>
        actualizar((d) => ({
          ...d,
          sesiones: d.sesiones.map((s) => (s.id === sesionId ? { ...s, platos, comensales, importe: totalPlatos(platos), cierre: ahora() } : s)),
        })),
      valorar: (clienteId, origen, estrellas, comentario) =>
        actualizar((d) => ({
          ...d,
          feedback: [
            ...d.feedback.filter((f) => !(f.clienteId === clienteId && f.origen.id === origen.id)),
            { id: uid("f"), clienteId, origen, estrellas, comentario, fecha: ahora(), respondido: estrellas >= 4, respuesta: null },
          ],
        })),
      responderFeedback: (id, respuesta) =>
        actualizar((d) => ({ ...d, feedback: d.feedback.map((f) => (f.id === id ? { ...f, respondido: true, respuesta } : f)) })),
      marcarPlatos: (checkinId, platos) =>
        actualizar((d) => ({ ...d, checkins: d.checkins.map((k) => (k.id === checkinId ? { ...k, platosMarcados: platos } : k)) })),
      completarPendiente: (p) =>
        actualizar((d) => {
          const nd: Datos = { ...d, hechos: [...d.hechos, { clave: p.clave, fecha: ahora() }] };
          if (p.mensaje) nd.mensajes = [...d.mensajes, { id: uid("m"), clienteId: p.clienteId, fecha: ahora(), motivo: p.mensaje.motivo, texto: p.mensaje.texto, respondio: false }];
          if (p.tipo === "feedback-negativo") {
            const fid = p.clave.slice(3);
            nd.feedback = d.feedback.map((f) => (f.id === fid ? { ...f, respondido: true, respuesta: "Llamada realizada" } : f));
          }
          return nd;
        }),
      posponerPendiente: (p) => actualizar((d) => ({ ...d, pospuestos: [...d.pospuestos, { clave: p.clave, fecha: ahora(), hasta: rel(hoy(), 3, "00:00") }] })),
      crearPresupuesto: (p) =>
        actualizar((d) => ({ ...d, presupuestos: [...d.presupuestos, { ...p, id: uid("b"), fechaEnvio: ahora(), estado: "enviado", motivoPerdida: null }] })),
      cambiarEstadoPresupuesto: (id, estado, motivo) =>
        actualizar((d) => ({ ...d, presupuestos: d.presupuestos.map((p) => (p.id === id ? { ...p, estado, motivoPerdida: estado === "perdido" ? motivo ?? null : null } : p)) })),
      crearPedido: (p) => {
        const importe = totalPlatos(p.platos);
        const nuevo: PedidoLlevar = { ...p, id: uid("p"), fecha: ahora(), importe, botellaRegalo: importe > 60 };
        actualizar((d) => ({ ...d, pedidos: [...d.pedidos, nuevo] }));
        return nuevo;
      },
      borrarCuenta: (clienteId) =>
        actualizar((d) => ({
          ...d,
          clientes: d.clientes.map((c) =>
            c.id === clienteId
              ? { ...c, tieneCuenta: false, cuentaCreadaPor: null, consentimientoWhatsapp: { acepta: false, fecha: null }, consentimientoAlergias: false, alergias: [], cumpleanos: null }
              : c,
          ),
        })),
    };
  }, [datos, actualizar]);

  if (!acciones) {
    return <div className="flex min-h-screen items-center justify-center text-stone-500">Cargando YOU…</div>;
  }
  return <Ctx.Provider value={acciones}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fuera de StoreProvider");
  return c;
}
