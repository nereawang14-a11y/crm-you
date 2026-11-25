// Documentos para compartir con clientes y calendario de campañas.
import { cumpleDesde, rel } from "./fechas";

export type Documento = { id: string; titulo: string; descripcion: string; paraQuien: string };

export const DOCUMENTOS: Documento[] = [
  { id: "carta", titulo: "Carta completa", descripcion: "Todos los platos con precio, por categorías.", paraQuien: "Cualquier cliente; nuevos clientes y pedidos para llevar." },
  { id: "menu-del-dia", titulo: "Menú del día", descripcion: "Menús A (11 €), B (12 €) y japonés (13,95 €), de lunes a viernes en sala.", paraQuien: "Oficinas y trabajadores de la zona (La Garena)." },
  { id: "menus-grupo", titulo: "Menús para compartir y grupos", descripcion: "Menú You, Cantonés, Asia y Japonés, para 2 o más personas.", paraQuien: "Cumpleaños, familias y grupos." },
  { id: "navidad-empresas", titulo: "Cenas de empresa · Navidad", descripcion: "Propuesta para grupos de empresa: menús, capacidad y cómo reservar.", paraQuien: "Empresas que celebraron con nosotros otros años y empresas de la zona." },
];

export type ReglaAntelacion = { tipo: "cena de empresa" | "cumpleaños" | "otro"; dias: number; documento: string; motivo: string };

/** Con cuántos días de antelación recordamos una celebración anual, y qué documento enviamos. */
export const ANTELACION: Record<ReglaAntelacion["tipo"], ReglaAntelacion> = {
  "cena de empresa": { tipo: "cena de empresa", dias: 30, documento: "navidad-empresas", motivo: "Las empresas cierran fecha con 3-5 semanas y en diciembre la sala se llena." },
  cumpleaños: { tipo: "cumpleaños", dias: 14, documento: "menus-grupo", motivo: "Los cumpleaños se organizan con 2 semanas de margen." },
  otro: { tipo: "otro", dias: 21, documento: "menus-grupo", motivo: "Margen intermedio para otras celebraciones." },
};

export type Campana = { id: string; nombre: string; fecha: string; envioDiasAntes: number; segmento: string; documento: string; idea: string };

/** Calendario anual de campañas (fecha MM-DD; Año Nuevo chino cambia cada año). */
export const CAMPANAS: Campana[] = [
  { id: "ano-nuevo-chino", nombre: "Año Nuevo chino", fecha: "02-06", envioDiasAntes: 21, segmento: "Habituales y familias", documento: "menus-grupo", idea: "Celebrar el Año Nuevo chino (6 feb 2027) con el pato laqueado o un menú para compartir." },
  { id: "san-valentin", nombre: "San Valentín", fecha: "02-14", envioDiasAntes: 10, segmento: "Parejas", documento: "menus-grupo", idea: "Mismo mes que el Año Nuevo chino: enviar solo a parejas que no recibieron la campaña anterior." },
  { id: "dia-madre", nombre: "Día de la Madre", fecha: "05-02", envioDiasAntes: 14, segmento: "Familias", documento: "menus-grupo", idea: "Comida familiar del domingo: reservar con antelación porque se llena." },
  { id: "terraza", nombre: "Temporada de terraza", fecha: "06-01", envioDiasAntes: 7, segmento: "Todos los activos", documento: "carta", idea: "4 mesas en terraza: avisar a los habituales de que ya están disponibles." },
  { id: "menu-septiembre", nombre: "Vuelta al menú del día", fecha: "09-07", envioDiasAntes: 7, segmento: "Clientes de mediodía entre semana", documento: "menu-del-dia", idea: "Recordar el menú del día a oficinas y trabajadores de la zona tras el verano." },
  { id: "navidad-empresas", nombre: "Cenas de empresa de Navidad", fecha: "12-12", envioDiasAntes: 50, segmento: "Empresas", documento: "navidad-empresas", idea: "Enviar a finales de octubre: las empresas eligen restaurante en noviembre." },
];

export function proximaFecha(base: Date, mmdd: string) {
  const dias = cumpleDesde(base, mmdd);
  return { dias, fecha: rel(base, dias, "00:00") };
}

export const REGLAS_ENVIO = [
  "Máximo 1 mensaje comercial por cliente cada 14 días (el CRM lo aplica solo).",
  "Máximo 1 campaña general al mes. Si coinciden dos fechas (Año Nuevo chino y San Valentín), cada cliente recibe solo la que más le encaja.",
  "Segmentar siempre: empresas, familias, parejas o clientes de mediodía. Nunca enviar todo a todos.",
  "Solo a clientes que aceptaron mensajes de WhatsApp, con una forma fácil de darse de baja.",
  "Los recordatorios personales (aniversario de una cena de empresa o cumpleaños) tienen prioridad sobre las campañas generales.",
  "Enviar entre semana de 11:00 a 12:30 o de 17:30 a 19:00, antes de las horas de comida y cena. Nunca de noche ni en fin de semana.",
];

export const INFO = "Avenida Juan Carlos I, 13 · La Garena, Alcalá de Henares · 91 802 54 52 · Lunes a domingo, 12:00–16:30 y 19:30–23:30";

export const MENUS_GRUPO = [
  { nombre: "Menú You", precio: 35, platos: ["Ensalada (2)", "Rollitos vietnamitas (4)", "Arroz frito", "Solomillo de ternera con pimientos verdes", "Pollo frito almendrado"] },
  { nombre: "Menú Cantonés", precio: 37.9, platos: ["Sopa agripicante", "Rollo de primavera", "Dim sum (ja kao y siu mai)", "Arroz frito al estilo cantonés", "Solomillo de ternera salteado con lechuga al estilo cantonés"] },
  { nombre: "Menú Asia", precio: 39.9, platos: ["Sopa Tom Yam Kum", "Rollo de pollo con mango", "Tempura de verduras", "Arroz frito con algodón de cerdo", "Gambas al estilo tailandés", "Teppanyaki de pollo"] },
  { nombre: "Menú Japonés", precio: 45.9, platos: ["Sopa de miso", "Ensalada japonesa", "Tempura mixta", "Mixto de sushi", "Arroz frito japonés", "Teppanyaki de langostinos", "Teppanyaki de ternera (yakiniku)"] },
];


export const TEXTOS = {
  menusGrupoIntro: "Menús pensados para compartir. Perfectos para cumpleaños, comidas familiares y grupos. Para grupos grandes, llámanos y preparamos la mesa.",
  navidadIntro: "Este año, celebrad la cena de empresa en YOU. Preparamos la sala a medida de vuestro grupo, juntando las mesas que haga falta, y os proponemos menús para compartir.",
  navidadReserva: "en diciembre se llena. Llámanos al 91 802 54 52 o escríbenos por WhatsApp con la fecha y el número de personas y os guardamos la mesa.",
  menuDelDia: "De lunes a viernes, a mediodía. Solo en sala. Primeros y segundos cambian cada día: pregunta al personal.",
  pato: "Nuestra especialidad para celebraciones: pato laqueado pekinés en tres servicios (piel crujiente con crepes, salteado y sopa), desde 29,00 €.",
};
