export type Plato = { nombre: string; cantidad: number; precio: number };

export type Cliente = {
  id: string;
  nombre: string;
  telefono: string; // único, clave de unión entre sistemas
  fechaAlta: string;
  tieneCuenta: boolean;
  cuentaCreadaPor: "cliente" | "personal" | null;
  consentimientoWhatsapp: { acepta: boolean; fecha: string | null };
  consentimientoAlergias: boolean; // dato de salud (RGPD)
  alergias: string[];
  cumpleanos: string | null; // 'MM-DD'
  platosFavoritos: string[];
  mesaPreferida: number | null;
  diaHoraHabitual: string | null;
  comensalesHabitual: number | null;
  canalPreferido: "whatsapp" | "llamada" | null;
  comoNosConocio: "google" | "boca a boca" | "paso por la calle" | "redes" | "otro" | null;
  empresa: string | null;
  notas: string;
  pedidoHabitual?: Plato[]; // "pedido de siempre" para llevar
};

export type SesionMesa = {
  id: string;
  mesa: number;
  apertura: string;
  cierre: string | null;
  comensales: number;
  platos: Plato[];
  importe: number;
  numeroTicket: string;
};

export type CheckIn = {
  id: string;
  sesionId: string;
  clienteId: string;
  fecha: string;
  hechoPor: "cliente" | "personal";
  platosMarcados: string[];
};

export type PedidoLlevar = {
  id: string;
  clienteId: string;
  fecha: string;
  canal: "telefono" | "web" | "whatsapp";
  platos: Plato[];
  importe: number;
  entrega: "recogida" | "envio";
  botellaRegalo: boolean;
};

export type Reserva = {
  id: string;
  clienteId: string;
  fechaHora: string;
  comensales: number;
  canal: "telefono" | "whatsapp" | "web";
  estado: "pendiente" | "confirmada" | "asistio" | "no-show" | "cancelada";
};

export type Presupuesto = {
  id: string;
  clienteId: string;
  tipoEvento: "cumpleaños" | "cena de empresa" | "otro";
  fechaEvento: string;
  personas: number;
  menu: string;
  importe: number;
  fechaEnvio: string;
  estado: "enviado" | "ganado" | "perdido";
  motivoPerdida: string | null;
};

export type Feedback = {
  id: string;
  clienteId: string;
  origen: { tipo: "sesion" | "pedido"; id: string };
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario: string;
  fecha: string;
  respondido: boolean;
  respuesta: string | null;
};

export type MotivoMensaje =
  | "que-tal-fue"
  | "reactivacion"
  | "cumpleaños"
  | "resena"
  | "presupuesto"
  | "captacion"
  | "recordatorio-anual";

export type Mensaje = {
  id: string;
  clienteId: string;
  fecha: string;
  motivo: MotivoMensaje;
  texto: string;
  respondio: boolean;
};

export type Resena = {
  id: string;
  clienteId: string | null;
  autor: string;
  estrellas: number;
  fecha: string;
  respondida: boolean;
};

export type Marca = { clave: string; fecha: string; hasta?: string };

export type Datos = {
  version: number;
  fechaSemilla: string; // día en que se generaron los datos de ejemplo
  clientes: Cliente[];
  sesiones: SesionMesa[];
  checkins: CheckIn[];
  pedidos: PedidoLlevar[];
  reservas: Reserva[];
  presupuestos: Presupuesto[];
  feedback: Feedback[];
  mensajes: Mensaje[];
  resenas: Resena[];
  hechos: Marca[]; // pendientes marcados como hechos
  pospuestos: Marca[]; // pendientes pospuestos (hasta)
};
