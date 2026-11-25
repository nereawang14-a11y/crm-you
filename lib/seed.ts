import type { Cliente, Datos, Plato, SesionMesa, CheckIn, PedidoLlevar, Feedback, Mensaje } from "./types";
import { aDia, diasHastaUltimo, hoy, rel } from "./fechas";

export const VERSION_DATOS = 4;

export const CARTA: { nombre: string; precio: number }[] = [
  { nombre: "Menú del día", precio: 13.5 },
  { nombre: "Gyozas", precio: 7.5 },
  { nombre: "Pato laqueado", precio: 16.9 },
  { nombre: "Arroz tres delicias", precio: 6.8 },
  { nombre: "Ramen", precio: 12.9 },
  { nombre: "Sushi variado 18 piezas", precio: 21.0 },
  { nombre: "Pollo al limón", precio: 10.5 },
  { nombre: "Tallarines salteados", precio: 8.9 },
  { nombre: "Rollitos de primavera", precio: 5.5 },
  { nombre: "Bao de cerdo", precio: 6.9 },
  { nombre: "Ternera con bambú", precio: 11.9 },
  { nombre: "Dim sum variado", precio: 9.5 },
  { nombre: "Gambas al curry", precio: 13.9 },
  { nombre: "Té jazmín", precio: 2.5 },
  { nombre: "Helado de té verde", precio: 4.5 },
];

const precio = (n: string) => CARTA.find((p) => p.nombre === n)?.precio ?? 8;
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

  const clientes: Cliente[] = [
    cliente({ id: "c-carmen", nombre: "Carmen Ruiz", telefono: "611 234 501", cumpleanos: mmdd(4), platosFavoritos: ["Pato laqueado", "Gyozas"], mesaPreferida: 6, diaHoraHabitual: "Sábado 14:00", comensalesHabitual: 2, comoNosConocio: "paso por la calle", notas: "Viene con Luis. Siempre la mesa 6, junto a la ventana." }, alta),
    cliente({ id: "c-luis", nombre: "Luis Ortega", telefono: "611 234 502", platosFavoritos: ["Ramen", "Gyozas"], mesaPreferida: 6, diaHoraHabitual: "Sábado 14:00", comensalesHabitual: 2, comoNosConocio: "paso por la calle" }, alta),
    cliente({ id: "c-javier", nombre: "Javier Molina", telefono: "622 345 601", platosFavoritos: ["Menú del día"], mesaPreferida: 3, diaHoraHabitual: "Miércoles 14:30", comensalesHabitual: 3, empresa: "Molina Asesores", comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-andres", nombre: "Andrés Pérez", telefono: "622 345 602", tieneCuenta: false, cuentaCreadaPor: null, consentimientoWhatsapp: { acepta: false, fecha: null }, canalPreferido: null, platosFavoritos: ["Menú del día"], mesaPreferida: 3, diaHoraHabitual: "Miércoles 14:30", comensalesHabitual: 3, empresa: "Pérez Instalaciones", comoNosConocio: "boca a boca", notas: "Viene con Javier y Raúl. Aún no tiene cuenta." }, alta),
    cliente({ id: "c-raul", nombre: "Raúl Sanz", telefono: "622 345 603", platosFavoritos: ["Menú del día", "Té jazmín"], mesaPreferida: 3, diaHoraHabitual: "Miércoles 14:30", comensalesHabitual: 3, empresa: "Sanz Logística", comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-antonio", nombre: "Antonio García", telefono: "633 456 701", cuentaCreadaPor: "personal", consentimientoWhatsapp: { acepta: false, fecha: null }, canalPreferido: "llamada", consentimientoAlergias: true, alergias: ["Marisco"], platosFavoritos: ["Pollo al limón", "Arroz tres delicias"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca", notas: "El abuelo de la familia de los martes. No usa el móvil: la cuenta se la creó el personal." }, alta),
    cliente({ id: "c-miguel", nombre: "Miguel García", telefono: "633 456 702", platosFavoritos: ["Ternera con bambú", "Dim sum variado"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-pablo", nombre: "Pablo García", telefono: "633 456 703", cumpleanos: mmdd(5), platosFavoritos: ["Bao de cerdo", "Tallarines salteados"], mesaPreferida: 8, diaHoraHabitual: "Martes 21:00", comensalesHabitual: 3, comoNosConocio: "boca a boca" }, alta),
    cliente({ id: "c-sofia", nombre: "Sofía Martín", telefono: "644 567 801", platosFavoritos: ["Menú del día"], mesaPreferida: 2, diaHoraHabitual: "Lunes a viernes 14:00", comensalesHabitual: 1, comoNosConocio: "google", notas: "Comía a diario en su hora de descanso del trabajo." }, alta),
    cliente({ id: "c-lucia", nombre: "Lucía Fernández", telefono: "655 678 901", platosFavoritos: ["Sushi variado 18 piezas", "Gyozas"], diaHoraHabitual: "Pedido para llevar, viernes noche", comensalesHabitual: 4, comoNosConocio: "redes" }, alta),
    cliente({ id: "c-elena", nombre: "Elena Navarro", telefono: "666 789 001", comoNosConocio: "google" }, rel(H, -60, "20:00")),
    cliente({ id: "c-marta", nombre: "Marta Gil", telefono: "677 890 101", empresa: "Gestoría Gil", comoNosConocio: "boca a boca" }, rel(H, -80, "13:00")),
    cliente({ id: "c-diego", nombre: "Diego Romero", telefono: "688 901 201", platosFavoritos: ["Ramen", "Bao de cerdo"], mesaPreferida: 4, comensalesHabitual: 1, comoNosConocio: "google" }, alta),
    cliente({ id: "c-irene", nombre: "Irene Castro", telefono: "699 012 301", comoNosConocio: "google" }, rel(H, -5, "21:00")),
  ];

  const sesiones: SesionMesa[] = [];
  const checkins: CheckIn[] = [];
  let nTicket = 1000;

  function sesion(diasAtras: number, hora: string, mesa: number, comensales: number, miembros: string[], platos: Plato[]) {
    const id = `s-${sesiones.length + 1}`;
    const apertura = rel(H, -diasAtras, hora);
    const [hh, mm] = hora.split(":").map(Number);
    const cierre = rel(H, -diasAtras, `${String(hh + 1).padStart(2, "0")}:${String(mm + 15).padStart(2, "0")}`);
    sesiones.push({ id, mesa, apertura, cierre, comensales, platos, importe: totalPlatos(platos), numeroTicket: `T-${nTicket++}` });
    for (const c of miembros) {
      checkins.push({ id: `k-${checkins.length + 1}`, sesionId: id, clienteId: c, fecha: apertura, hechoPor: c === "c-antonio" ? "personal" : "cliente", platosMarcados: [] });
    }
    return id;
  }

  const extra = () => [plato(CARTA[1 + Math.floor(r() * 12)].nombre)];

  // Pareja de los sábados (semanal)
  const sab = diasHastaUltimo(H, 6);
  let sesionParejaReciente = "";
  for (let d = sab; d <= 90; d += 7) {
    const id = sesion(d, "14:00", 6, 2, ["c-carmen", "c-luis"], [plato("Pato laqueado"), plato("Ramen"), plato("Gyozas"), ...extra()]);
    if (!sesionParejaReciente) sesionParejaReciente = id;
  }

  // Empresarios de los miércoles: Raúl deja de venir hace 25 días
  const mie = diasHastaUltimo(H, 3);
  for (let d = mie; d <= 90; d += 7) {
    const miembros = ["c-javier", "c-andres", ...(d >= 25 ? ["c-raul"] : [])];
    sesion(d, "14:30", 3, miembros.length, miembros, [plato("Menú del día", miembros.length), plato("Té jazmín", d % 2 ? 1 : 2)]);
  }

  // Familia de los martes (3 generaciones), siempre los mismos platos
  const mar = diasHastaUltimo(H, 2);
  for (let d = mar; d <= 90; d += 7) {
    sesion(d, "21:00", 8, 3, ["c-antonio", "c-miguel", "c-pablo"], [plato("Pollo al limón"), plato("Arroz tres delicias", 2), plato("Ternera con bambú"), plato("Dim sum variado"), plato("Bao de cerdo"), plato("Tallarines salteados")]);
  }

  // Sofía: a diario (laborables) hasta hace 9 días
  for (let d = 9; d <= 90; d++) {
    const dia = new Date(H);
    dia.setDate(dia.getDate() - d);
    if (dia.getDay() === 0 || dia.getDay() === 6) continue;
    sesion(d, "14:00", 2, 1, ["c-sofia"], [plato("Menú del día")]);
  }

  // Diego: quincenal, última visita ayer
  let sesionDiegoAyer = "";
  for (let d = 1; d <= 90; d += 14) {
    const id = sesion(d, "21:30", 4, 1, ["c-diego"], [plato("Ramen"), plato("Bao de cerdo")]);
    if (!sesionDiegoAyer) sesionDiegoAyer = id;
  }

  // Ocasionales
  sesion(55, "21:00", 5, 4, ["c-elena"], [plato("Sushi variado 18 piezas"), plato("Gyozas", 2), plato("Pato laqueado")]);
  sesion(20, "21:15", 5, 2, ["c-elena"], [plato("Ramen", 2), plato("Rollitos de primavera")]);
  sesion(70, "14:00", 7, 6, ["c-marta"], [plato("Menú del día", 6)]);
  sesion(30, "14:00", 7, 5, ["c-marta"], [plato("Menú del día", 5)]);
  sesion(5, "21:00", 1, 2, ["c-irene"], [plato("Dim sum variado"), plato("Ramen"), plato("Helado de té verde")]);

  // Mesas de clientes sin identificar (sin check-in): dan volumen realista a los ingresos
  for (let d = 1; d <= 65; d++) {
    const n = 8 + Math.floor(r() * 7);
    for (let i = 0; i < n; i++) {
      const comida = i % 2 === 0;
      const com = 1 + Math.floor(r() * 4);
      const ps = comida
        ? [plato("Menú del día", com)]
        : [plato(CARTA[1 + Math.floor(r() * 12)].nombre, com), plato(CARTA[1 + Math.floor(r() * 12)].nombre), plato("Té jazmín", com)];
      sesion(d, comida ? "14:00" : "21:00", 9 + (i % 10), com, [], ps);
    }
  }

  // Pedidos para llevar: Lucía, quincenal; último hace 3 días de 72 €
  const pedidos: PedidoLlevar[] = [];
  for (let d = 3; d <= 90; d += 14) {
    const ps = d === 3
      ? [plato("Sushi variado 18 piezas", 2), plato("Gyozas", 2), plato("Rollitos de primavera"), plato("Helado de té verde")]
      : [plato("Sushi variado 18 piezas"), plato("Gyozas"), plato("Tallarines salteados", 2)];
    const importe = totalPlatos(ps);
    pedidos.push({ id: `p-${pedidos.length + 1}`, clienteId: "c-lucia", fecha: rel(H, -d, "21:00"), canal: d === 3 ? "web" : "whatsapp", platos: ps, importe, entrega: "envio", botellaRegalo: importe > 60 });
  }
  pedidos.push({ id: `p-${pedidos.length + 1}`, clienteId: "c-diego", fecha: rel(H, -8, "21:00"), canal: "telefono", platos: [plato("Ramen"), plato("Gyozas")], importe: totalPlatos([plato("Ramen"), plato("Gyozas")]), entrega: "recogida", botellaRegalo: false });

  const ultimoPedidoLucia = pedidos[0].id;

  const feedback: Feedback[] = [
    { id: "f-1", clienteId: "c-lucia", origen: { tipo: "pedido", id: ultimoPedidoLucia }, estrellas: 2, comentario: "El pedido llegó 40 minutos tarde y el sushi algo templado.", fecha: rel(H, -2, "10:15"), respondido: false, respuesta: null },
    { id: "f-2", clienteId: "c-luis", origen: { tipo: "sesion", id: sesionParejaReciente }, estrellas: 5, comentario: "Como siempre, de diez. El ramen, espectacular.", fecha: rel(H, -1, "11:00"), respondido: true, respuesta: "¡Gracias, Luis! Os esperamos el sábado." },
    { id: "f-3", clienteId: "c-javier", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 3)!.id }, estrellas: 4, comentario: "Menú rico y rápido, perfecto para comer entre reuniones.", fecha: rel(H, -12, "17:00"), respondido: true, respuesta: null },
    { id: "f-4", clienteId: "c-miguel", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 8)!.id }, estrellas: 5, comentario: "Nos tratan como en casa.", fecha: rel(H, -20, "10:00"), respondido: true, respuesta: null },
    { id: "f-5", clienteId: "c-irene", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 1)!.id }, estrellas: 4, comentario: "Primera vez, volveremos. El dim sum muy bueno.", fecha: rel(H, -4, "12:00"), respondido: true, respuesta: null },
    { id: "f-7", clienteId: "c-carmen", origen: { tipo: "sesion", id: sesionParejaReciente }, estrellas: 5, comentario: "Nuestro sitio de los sábados.", fecha: rel(H, -38, "11:00"), respondido: true, respuesta: null },
    { id: "f-8", clienteId: "c-sofia", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 2)!.id }, estrellas: 4, comentario: "Menú del día muy completo.", fecha: rel(H, -45, "16:00"), respondido: true, respuesta: null },
    { id: "f-9", clienteId: "c-raul", origen: { tipo: "sesion", id: sesiones.find((s) => s.mesa === 3)!.id }, estrellas: 3, comentario: "Ese día tardaron bastante en servir.", fecha: rel(H, -33, "17:00"), respondido: true, respuesta: "Llamada realizada" },
    { id: "f-6", clienteId: "c-diego", origen: { tipo: "sesion", id: sesiones.filter((s) => s.mesa === 4)[1]?.id ?? sesionDiegoAyer }, estrellas: 5, comentario: "", fecha: rel(H, -14, "10:00"), respondido: true, respuesta: null },
  ];

  const mensajes: Mensaje[] = [
    // Pablo recibió una petición de reseña hace 6 días: su felicitación queda oculta por la regla de cortesía
    { id: "m-1", clienteId: "c-pablo", fecha: rel(H, -6, "12:00"), motivo: "resena", texto: "Gracias por tu valoración, Pablo. Si te apetece contarlo en Google, nos ayudas muchísimo.", respondio: true },
    { id: "m-2", clienteId: "c-luis", fecha: rel(H, -1, "11:05"), motivo: "que-tal-fue", texto: "Hola Luis, gracias por venir a YOU. ¿Nos cuentas qué tal?", respondio: true },
    { id: "m-3", clienteId: "c-elena", fecha: rel(H, -7, "18:00"), motivo: "presupuesto", texto: "Hola Elena, te enviamos el presupuesto para el cumpleaños de 20 personas.", respondio: false },
  ];

  return {
    version: VERSION_DATOS,
    fechaSemilla: aDia(H),
    clientes,
    sesiones,
    checkins,
    pedidos,
    reservas: [
      { id: "r-1", clienteId: "c-antonio", fechaHora: rel(H, 0, "21:00"), comensales: 3, canal: "telefono", estado: "confirmada" },
      { id: "r-2", clienteId: "c-andres", fechaHora: rel(H, 0, "14:30"), comensales: 3, canal: "whatsapp", estado: "confirmada" },
      { id: "r-3", clienteId: "c-carmen", fechaHora: rel(H, diasHastaUltimo(H, 6) === 7 ? 0 : 7 - diasHastaUltimo(H, 6), "14:00"), comensales: 2, canal: "whatsapp", estado: "confirmada" },
      { id: "r-4", clienteId: "c-irene", fechaHora: rel(H, 0, "21:30"), comensales: 2, canal: "web", estado: "pendiente" },
    ],
    presupuestos: [
      { id: "b-1", clienteId: "c-elena", tipoEvento: "cumpleaños", fechaEvento: rel(H, 18, "21:00"), personas: 20, menu: "Menú degustación con tarta", importe: 560, fechaEnvio: rel(H, -7, "18:00"), estado: "enviado", motivoPerdida: null },
      { id: "b-2", clienteId: "c-marta", tipoEvento: "cena de empresa", fechaEvento: rel(H, 2, "21:00"), personas: 14, menu: "Menú de Navidad", importe: 434, fechaEnvio: rel(H, -20, "12:00"), estado: "ganado", motivoPerdida: null },
      { id: "b-3", clienteId: "c-javier", tipoEvento: "cena de empresa", fechaEvento: rel(H, 25, "21:00"), personas: 10, menu: "Menú de grupo", importe: 290, fechaEnvio: rel(H, -2, "16:00"), estado: "enviado", motivoPerdida: null },
      { id: "b-4", clienteId: "c-diego", tipoEvento: "cumpleaños", fechaEvento: rel(H, -30, "21:00"), personas: 12, menu: "Menú de grupo", importe: 300, fechaEnvio: rel(H, -45, "12:00"), estado: "perdido", motivoPerdida: "Lo celebró en otra ciudad" },
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
