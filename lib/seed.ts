import type { Cliente, Datos, Plato, SesionMesa, CheckIn, PedidoLlevar, Feedback, Mensaje } from "./types";
import { aDia, diasHastaUltimo, hoy, rel } from "./fechas";
import { CARTA, precioDe } from "./carta";

export const VERSION_DATOS = 5;

export { CARTA };

const precio = (n: string) => {
  const p = precioDe(n);
  if (p === undefined) throw new Error(`Plato no está en la carta: ${n}`);
  return p;
};
export const plato = (nombre: string, cantidad = 1): Plato => ({ nombre, cantidad, precio: precio(nombre) });
export const totalPlatos = (ps: Plato[]) => Math.round(ps.reduce((s, p) => s + p.cantidad * p.precio, 0) * 100) / 100;

// Generador pseudoaleatorio determinista
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

type Base = Partial<Cliente> & Pick<Cliente, "id" | "nombre" | "telefono">;
function cliente(b: Base, fechaAlta: string): Cliente {
  return {
    fechaAlta,
    tieneCuenta: true,
    cuentaCreadaPor: "cliente",
    consentimientoWhatsapp: { acepta: true, fecha: fechaAlta },
    consentimientoAlergias: false,
    alergias: [],
    cumpleanos: null,
    platosFavoritos: [],
    mesaPreferida: null,
    diaHoraHabitual: null,
    comensalesHabitual: null,
    canalPreferido: "whatsapp",
    comoNosConocio: null,
    empresa: null,
    notas: "",
    ...b,
  };
}

export function generarDatos(): Datos {
  const H = hoy();
  const r = prng(42);
  const alta = rel(H, -120, "12:00");
  const mmdd = (dias: number) => rel(H, dias).slice(5, 10);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];

  // ---------------------------------------------------------------
  // PERFILES DE CLIENTES
  // Pedro y Tere: hábitos reales de una pareja habitual de YOU (nombres cambiados).
  // El resto: clientes de ejemplo, se irán sustituyendo por perfiles reales.
  // ---------------------------------------------------------------
  const PEDIDO_HIJO = [plato("Pan chino"), plato("Nigiri de salmón (4 piezas)"), plato("Teppanyaki de solomillo a la pimienta negra")];

  const clientes: Cliente[] = [
    cliente({ id: "c-tere", nombre: "Tere Morales", telefono: "611 234 501", platosFavoritos: ["Nigiri de salmón (4 piezas)", "Arroz frito tres delicias", "Tallarines fritos con gambas"], mesaPreferida: 16, diaHoraHabitual: "Sábado 14:00", comensalesHabitual: 2, comoNosConocio: "paso por la calle", notas: "Viene con Pedro todos los sábados. Mesa 16 (si está ocupada, la 17). De vez en cuando vienen con hijos y nietos, unas 10 personas." }, alta),
    cliente({ id: "c-pedro", nombre: "Pedro Morales", telefono: "611 234 502", canalPreferido: "llamada", platosFavoritos: ["Nigiri de salmón (4 piezas)", "Arroz frito tres delicias", "Tallarines fritos con gambas"], mesaPreferida: 16, diaHoraHabitual: "Sábado 14:00", comensalesHabitual: 2, comoNosConocio: "paso por la calle", pedidoHabitual: PEDIDO_HIJO, notas: "Cada sábado se lleva un pedido para su hijo, que se queda en casa: pan chino, nigiri de salmón y teppanyaki de solomillo." }, alta),
    cliente({ id: "c-javier", nombre: "Javier Molina", telefono: "622 345 601", platosFavoritos: ["Menú del día B", "Pato laqueado pekinés (3 servicios)"], diaHoraHabitual: "Miércoles 14:30, cada dos semanas", comensalesHabitual: 3, empresa: "Molina Asesores", comoNosConocio: "boca a boca", notas: "Uno de los tres empresarios de los miércoles. Algún fin de semana viene con su familia (5 personas)." }, alta),
    cliente({ id: "c-andres", nombre: "Andrés Pérez", telefono: "622 345 602", tieneCuenta: false, cuentaCreadaPor: null, consentimientoWhatsapp: { acepta: false, fecha: null }, canalPreferido: null, platosFavoritos: ["Menú del día B"], diaHoraHabitual: "Miércoles 14:30, cada dos semanas", comensalesHabitual: 3, empresa: "Pérez Instalaciones", comoNosConocio: "boca a boca", notas: "Viene con Javier y Raúl. Aún no tiene cuenta." }, alta),
    cliente({ id: "c-raul", nombre: "Raúl Sanz", telefono: "622 345 603", platosFavoritos: ["Menú del día B"], diaHoraHabitual: "Miércoles 14:30, cada dos semanas", comensalesHabitual: 3, empresa: "Sanz Logística", comoNosConocio: "boca a boca", notas: "Cuando celebran algo, piden pato laqueado para compartir." }, alta),
    cliente({ id: "c-antonio", nombre: "Antonio García", telefono: "633 456 701", cuentaCreadaPor: "personal", consentimientoWhatsapp: { acepta: false, fecha: null }, canalPreferido: "llamada", consentimientoAlergias: true, alergias: ["Marisco (dato de ejemplo)"], platosFavoritos: ["Pollo al limón", "Arroz frito tres delicias"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca", notas: "El abuelo de la familia de los martes. No usa el móvil: la cuenta se la creó el personal." }, alta),
    cliente({ id: "c-miguel", nombre: "Miguel García", telefono: "633 456 702", platosFavoritos: ["Solomillo con bambú y setas chinas", "Saomai (4 piezas)"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-pablo", nombre: "Pablo García", telefono: "633 456 703", cumpleanos: mmdd(5), platosFavoritos: ["Xiao long bao (4 piezas)", "Tallarines fritos con gambas"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-sofia", nombre: "Sofía Martín", telefono: "644 567 801", platosFavoritos: ["Menú del día A"], mesaPreferida: 2, diaHoraHabitual: "Lunes a viernes 14:00", comensalesHabitual: 1, comoNosConocio: "google", notas: "Comía a diario en su hora de descanso del trabajo." }, alta),
    cliente({ id: "c-lucia", nombre: "Lucía Fernández", telefono: "655 678 901", platosFavoritos: ["Sushi variado (10 piezas)", "Wan-Tun frito"], diaHoraHabitual: "Para llevar, viernes noche", comensalesHabitual: 4, comoNosConocio: "redes" }, alta),
    cliente({ id: "c-elena", nombre: "Elena Navarro", telefono: "666 789 001", comoNosConocio: "google" }, rel(H, -60, "20:00")),
    cliente({ id: "c-marta", nombre: "Marta Gil", telefono: "677 890 101", empresa: "Gestoría Gil", comoNosConocio: "boca a boca" }, rel(H, -80, "13:00")),
    cliente({ id: "c-diego", nombre: "Diego Romero", telefono: "688 901 201", platosFavoritos: ["Yakisoba (tallarines)", "Xiao long bao (4 piezas)"], mesaPreferida: 4, comensalesHabitual: 1, comoNosConocio: "google" }, alta),
    cliente({ id: "c-irene", nombre: "Irene Castro", telefono: "699 012 301", cumpleanos: mmdd(4), comoNosConocio: "google" }, rel(H, -5, "21:00")),
  ];

  const sesiones: SesionMesa[] = [];
  const checkins: CheckIn[] = [];
  const pedidos: PedidoLlevar[] = [];
  let nTicket = 1000;

  function sesion(diasAtras: number, hora: string, mesa: number, comensales: number, miembros: string[], platos: Plato[]) {
    const id = `s-${sesiones.length + 1}`;
    const apertura = rel(H, -diasAtras, hora);
    const [hh, mm] = hora.split(":").map(Number);
    const cierre = rel(H, -diasAtras, `${String(hh + 1).padStart(2, "0")}:${String((mm + 15) % 60).padStart(2, "0")}`);
    sesiones.push({ id, mesa, apertura, cierre, comensales, platos, importe: totalPlatos(platos), numeroTicket: `T-${nTicket++}` });
    for (const c of miembros) {
      checkins.push({ id: `k-${checkins.length + 1}`, sesionId: id, clienteId: c, fecha: apertura, hechoPor: c === "c-antonio" ? "personal" : "cliente", platosMarcados: [] });
    }
    return id;
  }
  function pedido(clienteId: string, diasAtras: number, hora: string, canal: PedidoLlevar["canal"], ps: Plato[], entrega: PedidoLlevar["entrega"] = "recogida") {
    const importe = totalPlatos(ps);
    const p: PedidoLlevar = { id: `p-${pedidos.length + 1}`, clienteId, fecha: rel(H, -diasAtras, hora), canal, platos: ps, importe, entrega, botellaRegalo: importe > 60 };
    pedidos.push(p);
    return p;
  }

  // --- Pedro y Tere: cada sábado 14:00, mesa 16 (a veces 17) + pedido para llevar del hijo
  const TERCER_PLATO = ["Pollo al limón", "Solomillo de ternera con pimientos verdes", "Pato a la naranja"];
  const sab = diasHastaUltimo(H, 6);
  let sesionParejaReciente = "";
  let semana = 0;
  for (let d = sab; d <= 90; d += 7, semana++) {
    const familiar = semana === 5; // comida familiar con hijos y nietos
    const platos = familiar
      ? [plato("Pato laqueado pekinés grande (3 servicios)"), plato("Nigiri de salmón (4 piezas)", 3), plato("Sushi variado (10 piezas)", 2), plato("Arroz frito tres delicias", 3), plato("Tallarines fritos con gambas", 2), plato("Pollo al limón", 2), plato("Rollo de primavera", 6), plato("Refresco", 6), plato("Cerveza", 4), plato("Helado frito", 4)]
      : [plato("Nigiri de salmón (4 piezas)"), plato("Arroz frito tres delicias"), plato("Tallarines fritos con gambas"), plato(TERCER_PLATO[semana % 3]), plato("Cerveza"), plato("Refresco"), plato("Helado frito"), plato("Café", 2)];
    const id = sesion(d, "14:00", familiar || semana % 4 === 3 ? 17 : 16, familiar ? 10 : 2, ["c-pedro", "c-tere"], platos);
    if (!sesionParejaReciente) sesionParejaReciente = id;
    pedido("c-pedro", d, "15:10", "telefono", PEDIDO_HIJO);
  }

  // --- Empresarios de los miércoles (hábitos reales, nombres inventados):
  // cada dos semanas a las 14:30, mesa de 4, menú del día B (12 €). Algunos días especiales, pato laqueado para compartir.
  // Últimamente vienen menos: el último hueco entre visitas es más largo. Javier trae a su familia algún fin de semana.
  const mie = diasHastaUltimo(H, 3);
  const MESAS_4 = [3, 5, 9, 12];
  const diasEmpresarios = [mie + 14, mie + 28, mie + 42, mie + 56, mie + 70].filter((d) => d <= 90); // el último miércoles que tocaba no vinieron
  diasEmpresarios.forEach((d, i) => {
    const especial = i === 2; // celebran algo: pato laqueado para compartir
    const ps = [plato("Menú del día B", 3), ...(especial ? [plato("Pato laqueado pekinés (3 servicios)")] : [])];
    sesion(d, "14:30", MESAS_4[i % MESAS_4.length], 3, ["c-javier", "c-andres", "c-raul"], ps);
  });
  // Javier, comida familiar de fin de semana (~cada mes)
  const dom = diasHastaUltimo(H, 0);
  for (const d of [dom + 7, dom + 35, dom + 63].filter((x) => x <= 90)) {
    sesion(d, "14:30", 20, 5, ["c-javier"], [plato("Pato laqueado pekinés (3 servicios)"), plato("Arroz frito tres delicias", 2), plato("Pollo frito almendrado"), plato("Rollo de primavera", 5), plato("Sushi variado (10 piezas)"), plato("Refresco", 3), plato("Cerveza", 2)]);
  }

  // --- Familia de los martes (3 generaciones), siempre los mismos platos
  const mar = diasHastaUltimo(H, 2);
  for (let d = mar; d <= 90; d += 7) {
    sesion(d, "21:00", 8, 3, ["c-antonio", "c-miguel", "c-pablo"], [plato("Pollo al limón"), plato("Arroz frito tres delicias", 2), plato("Solomillo con bambú y setas chinas"), plato("Saomai (4 piezas)"), plato("Xiao long bao (4 piezas)"), plato("Tallarines fritos con gambas"), plato("Agua"), plato("Cerveza", 2)]);
  }

  // --- Sofía: a diario (laborables) hasta hace 9 días
  for (let d = 9; d <= 90; d++) {
    const dia = new Date(H);
    dia.setDate(dia.getDate() - d);
    if (dia.getDay() === 0 || dia.getDay() === 6) continue;
    sesion(d, "14:00", 2, 1, ["c-sofia"], [plato("Menú del día A")]);
  }

  // --- Diego: quincenal, última visita ayer
  let sesionDiegoAyer = "";
  for (let d = 1; d <= 90; d += 14) {
    const id = sesion(d, "21:30", 4, 1, ["c-diego"], [plato("Yakisoba (tallarines)"), plato("Xiao long bao (4 piezas)"), plato("Cerveza Tsingtao")]);
    if (!sesionDiegoAyer) sesionDiegoAyer = id;
  }

  // --- Ocasionales
  sesion(55, "21:00", 5, 4, ["c-elena"], [plato("Sushi variado (10 piezas)"), plato("Wan-Tun frito", 2), plato("Pato laqueado pekinés (3 servicios)"), plato("Refresco", 4)]);
  sesion(20, "21:15", 5, 2, ["c-elena"], [plato("Yakisoba con pollo y verduras"), plato("Gambas Gon-Bao"), plato("Rollo de primavera", 2), plato("Copa de vino", 2)]);
  sesion(70, "14:00", 7, 6, ["c-marta"], [plato("Menú del día B", 6)]);
  sesion(30, "14:00", 7, 5, ["c-marta"], [plato("Menú del día B", 5)]);
  sesion(5, "21:00", 1, 2, ["c-irene"], [plato("Saomai (4 piezas)"), plato("Yakisoba con pollo y verduras"), plato("Pollo Gon-Bao"), plato("Helado de té verde")]);

  // --- Mesas de clientes sin identificar (sin check-in): volumen realista.
  // Entre semana ~25 mesas/día (mediodía con menú del día, ticket ~12 €/pers; noche ~18 €/pers); fin de semana, sala llena.
  const PRINCIPALES = CARTA.filter((p) => ["Pollo", "Ternera", "Gambas y mariscos", "Cerdo", "Pato y especialidades", "Sushi, sashimi y maki"].includes(p.categoria) && p.precio < 20).map((p) => p.nombre);
  const ACOMP = CARTA.filter((p) => ["Arroz y tallarines", "Entrantes y sopas"].includes(p.categoria)).map((p) => p.nombre);
  const BEBIDAS = ["Agua", "Refresco", "Cerveza", "Copa de vino", "Té jazmín"];
  const MENUS = ["Menú del día A", "Menú del día B", "Menú del día japonés"];
  for (let d = 1; d <= 65; d++) {
    const dia = new Date(H);
    dia.setDate(dia.getDate() - d);
    const finde = dia.getDay() === 0 || dia.getDay() === 6;
    const mediodia = finde ? 18 + Math.floor(r() * 6) : 12 + Math.floor(r() * 5);
    const noche = finde ? 16 + Math.floor(r() * 6) : 8 + Math.floor(r() * 4);
    for (let i = 0; i < mediodia + noche; i++) {
      const esComida = i < mediodia;
      const com = 1 + Math.floor(r() * (finde ? 5 : 3));
      let ps: Plato[];
      if (esComida && !finde) {
        ps = Array.from({ length: com }, () => plato(pick(MENUS)));
      } else {
        ps = [
          ...Array.from({ length: com }, () => plato(pick(PRINCIPALES))),
          ...Array.from({ length: Math.ceil(com / 2) }, () => plato(pick(ACOMP))),
          plato(pick(BEBIDAS), com),
        ];
      }
      sesion(d, esComida ? pick(["13:30", "14:00", "14:30"]) : pick(["20:30", "21:00", "21:30"]), 1 + Math.floor(r() * 27), com, [], ps);
    }
  }

  // --- Pedidos para llevar: Lucía, quincenal (Just Eat / teléfono); el último de más de 60 €
  for (let d = 3; d <= 90; d += 14) {
    const ps = d === 3
      ? [plato("Sushi variado (10 piezas)", 2), plato("Maki variado"), plato("Wan-Tun frito"), plato("Rollitos de langostinos (6 piezas)")]
      : [plato("Sushi variado (10 piezas)"), plato("Wan-Tun frito"), plato("Tallarines fritos con gambas", 2)];
    pedido("c-lucia", d, "21:00", d === 3 ? "web" : "telefono", ps, d === 3 ? "envio" : "recogida");
  }
  pedido("c-diego", 8, "21:00", "telefono", [plato("Yakisoba (tallarines)"), plato("Wan-Tun frito")]);

  const ultimoPedidoLucia = pedidos.find((p) => p.clienteId === "c-lucia")!.id;
  const primeraSesion = (mesa: number) => sesiones.find((s) => s.mesa === mesa)!.id;

  const feedback: Feedback[] = [
    { id: "f-1", clienteId: "c-lucia", origen: { tipo: "pedido", id: ultimoPedidoLucia }, estrellas: 2, comentario: "El pedido llegó 40 minutos tarde y el sushi algo templado.", fecha: rel(H, -2, "10:15"), respondido: false, respuesta: null },
    { id: "f-2", clienteId: "c-pedro", origen: { tipo: "sesion", id: sesionParejaReciente }, estrellas: 5, comentario: "Como siempre, de diez. Y el pedido del chaval, listo a la hora.", fecha: rel(H, -1, "11:00"), respondido: true, respuesta: "¡Gracias, Pedro! Os esperamos el sábado." },
    { id: "f-3", clienteId: "c-javier", origen: { tipo: "sesion", id: primeraSesion(3) }, estrellas: 4, comentario: "Menú rico y rápido, perfecto para comer entre reuniones.", fecha: rel(H, -(mie + 20), "17:30"), respondido: true, respuesta: null },
    { id: "f-4", clienteId: "c-miguel", origen: { tipo: "sesion", id: primeraSesion(8) }, estrellas: 5, comentario: "Nos tratan como en casa.", fecha: rel(H, -20, "10:00"), respondido: true, respuesta: null },
    { id: "f-5", clienteId: "c-irene", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 1 && checkins.some((k) => k.sesionId === s.id))!.id }, estrellas: 4, comentario: "Primera vez, volveremos. El saomai muy bueno.", fecha: rel(H, -4, "12:00"), respondido: true, respuesta: null },
    { id: "f-6", clienteId: "c-diego", origen: { tipo: "sesion", id: sesiones.filter((s) => s.mesa === 4 && checkins.some((k) => k.sesionId === s.id))[1]?.id ?? sesionDiegoAyer }, estrellas: 5, comentario: "", fecha: rel(H, -14, "10:00"), respondido: true, respuesta: null },
    { id: "f-7", clienteId: "c-tere", origen: { tipo: "sesion", id: sesionParejaReciente }, estrellas: 5, comentario: "Nuestro sitio de los sábados.", fecha: rel(H, -38, "11:00"), respondido: true, respuesta: null },
    { id: "f-8", clienteId: "c-sofia", origen: { tipo: "sesion", id: primeraSesion(2) }, estrellas: 4, comentario: "Menú del día muy completo.", fecha: rel(H, -45, "16:00"), respondido: true, respuesta: null },
    { id: "f-9", clienteId: "c-raul", origen: { tipo: "sesion", id: primeraSesion(3) }, estrellas: 3, comentario: "Ese día tardaron bastante en servir.", fecha: rel(H, -(mie + 20), "17:00"), respondido: true, respuesta: "Llamada realizada" },
  ];

  const mensajes: Mensaje[] = [
    // Pablo recibió una petición de reseña hace 6 días: su felicitación queda oculta por la regla de cortesía
    { id: "m-1", clienteId: "c-pablo", fecha: rel(H, -6, "12:00"), motivo: "resena", texto: "Gracias por tu valoración, Pablo. Si te apetece contarlo en Google, nos ayudas muchísimo.", respondio: true },
    { id: "m-2", clienteId: "c-pedro", fecha: rel(H, -1, "11:05"), motivo: "que-tal-fue", texto: "Hola Pedro, gracias por venir a YOU. ¿Nos cuentas qué tal?", respondio: true },
    { id: "m-3", clienteId: "c-elena", fecha: rel(H, -7, "18:00"), motivo: "presupuesto", texto: "Hola Elena, te enviamos el presupuesto para el cumpleaños de 20 personas.", respondio: false },
  ];

  const proxSab = sab === 7 ? 0 : 7 - sab;

  return {
    version: VERSION_DATOS,
    fechaSemilla: aDia(H),
    clientes,
    sesiones,
    checkins,
    pedidos,
    reservas: [
      { id: "r-1", clienteId: "c-antonio", fechaHora: rel(H, 0, "21:00"), comensales: 3, canal: "telefono", estado: "confirmada" },
      { id: "r-3", clienteId: "c-tere", fechaHora: rel(H, proxSab, "14:00"), comensales: 2, canal: "telefono", estado: "confirmada" },
      { id: "r-4", clienteId: "c-irene", fechaHora: rel(H, 0, "21:30"), comensales: 2, canal: "web", estado: "pendiente" },
      { id: "r-5", clienteId: "c-pedro", fechaHora: rel(H, proxSab + 14, "14:00"), comensales: 10, canal: "telefono", estado: "confirmada" },
    ],
    presupuestos: [
      { id: "b-1", clienteId: "c-elena", tipoEvento: "cumpleaños", fechaEvento: rel(H, 18, "21:00"), personas: 20, menu: "Menú Cantonés para compartir", importe: 380, fechaEnvio: rel(H, -7, "18:00"), estado: "enviado", motivoPerdida: null },
      { id: "b-2", clienteId: "c-marta", tipoEvento: "cena de empresa", fechaEvento: rel(H, 2, "21:00"), personas: 14, menu: "Menú Asia para compartir", importe: 280, fechaEnvio: rel(H, -20, "12:00"), estado: "ganado", motivoPerdida: null },
      { id: "b-3", clienteId: "c-javier", tipoEvento: "cena de empresa", fechaEvento: rel(H, 25, "21:00"), personas: 10, menu: "Menú You para compartir", importe: 175, fechaEnvio: rel(H, -2, "16:00"), estado: "enviado", motivoPerdida: null },
      { id: "b-4", clienteId: "c-diego", tipoEvento: "cumpleaños", fechaEvento: rel(H, -30, "21:00"), personas: 12, menu: "Menú Japonés para compartir", importe: 275, fechaEnvio: rel(H, -45, "12:00"), estado: "perdido", motivoPerdida: "Lo celebró en otra ciudad" },
    ],
    feedback,
    mensajes,
    resenas: [
      { id: "g-1", clienteId: "c-miguel", autor: "Miguel G.", estrellas: 5, fecha: rel(H, -18, "22:00"), respondida: true },
      { id: "g-2", clienteId: null, autor: "Laura P.", estrellas: 4, fecha: rel(H, -9, "15:00"), respondida: false },
      { id: "g-3", clienteId: "c-irene", autor: "Irene C.", estrellas: 5, fecha: rel(H, -4, "13:00"), respondida: true },
    ],
    hechos: [],
    pospuestos: [],
  };
}
