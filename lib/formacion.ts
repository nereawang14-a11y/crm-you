// Contenido de formación para empleados de YOU.
// BORRADOR: fichas orientativas basadas en la preparación tradicional de cada plato.
// Deben revisarlas y ajustarlas los dueños/cocina con sus cantidades y trucos reales.

export type Ficha = {
  id: string;
  tipo: "cocina" | "sala";
  titulo: string;
  codigoCarta?: string;
  categoria: string;
  tiempo: string;
  nivel: "Básico" | "Medio" | "Avanzado";
  resumen: string;
  ingredientes?: string[];
  pasos: string[];
  calidad: string[]; // puntos críticos para que salga bien
  emplatado?: string;
  alergenos?: string[]; // orientativo: confirmar con la ficha oficial de alérgenos
  errores?: string[];
};

export const FICHAS: Ficha[] = [
  {
    id: "pato-laqueado",
    tipo: "cocina",
    titulo: "Pato laqueado pekinés (3 servicios)",
    codigoCarta: "73 / 73A",
    categoria: "Especialidades",
    tiempo: "25 min de pase (el pato llega lacado y horneado)",
    nivel: "Avanzado",
    resumen: "El plato de celebración: muchos grupos lo piden para compartir. Se sirve en tres tiempos y el ritmo entre servicios es tan importante como la cocina.",
    ingredientes: ["Pato lacado y horneado (medio o entero)", "Crepes finas (calentadas al vapor)", "Pepino y cebolleta en juliana", "Salsa hoisin", "Verduras de temporada para el salteado", "Caldo de huesos del propio pato"],
    pasos: [
      "1er servicio · Piel: trinchar la piel crujiente en láminas finas con un poco de carne. Servir con crepes calientes, pepino, cebolleta y salsa hoisin.",
      "2º servicio · Salteado: deshuesar el resto de la carne, cortar en tiras y saltear a fuego muy fuerte con las verduras. Sacar cuando la verdura siga crujiente.",
      "3er servicio · Sopa: hervir los huesos en el caldo, colar y servir bien caliente.",
      "Avisar a sala de cada servicio: el siguiente sale cuando la mesa termina el anterior, no todo a la vez.",
    ],
    calidad: ["La piel tiene que crujir: se trincha justo antes de salir, nunca antes.", "Crepes calientes y tapadas para que no se sequen.", "Entre servicios, unos 10 minutos."],
    emplatado: "Piel en abanico en fuente alargada; crepes en cesta de vapor; acompañamientos en cuencos pequeños.",
    alergenos: ["Gluten (crepes, salsa)", "Soja (hoisin)", "Sésamo (según salsa)"],
    errores: ["Trinchar la piel con antelación (se reblandece).", "Sacar los tres servicios juntos."],
  },
  {
    id: "arroz-tres-delicias",
    tipo: "cocina",
    titulo: "Arroz frito tres delicias",
    codigoCarta: "32",
    categoria: "Arroz y tallarines",
    tiempo: "5 min",
    nivel: "Básico",
    resumen: "Uno de los platos que más se pide. Debe salir suelto, con cada grano separado y sin grasa en el fondo del plato.",
    ingredientes: ["Arroz cocido del día anterior (frío)", "Huevo batido", "Jamón cocido en dados", "Gambas peladas", "Guisantes", "Aceite, sal"],
    pasos: ["Calentar el wok hasta que humee y añadir poco aceite.", "Hacer el huevo revuelto y romperlo en trozos pequeños.", "Añadir jamón, gambas y guisantes, 30 segundos.", "Añadir el arroz frío y saltear moviendo sin parar hasta que cada grano esté suelto.", "Sazonar al final y probar."],
    calidad: ["Arroz frío y del día anterior: si está recién hecho se apelmaza.", "Wok muy caliente todo el rato.", "Ración igual en cada plato (usar el cazo medidor)."],
    emplatado: "Con molde o cuenco invertido para que salga en cúpula.",
    alergenos: ["Huevo", "Crustáceos (gambas)"],
    errores: ["Demasiado aceite.", "Arroz recién cocido (queda pastoso)."],
  },
  {
    id: "tallarines-gambas",
    tipo: "cocina",
    titulo: "Tallarines fritos con gambas",
    codigoCarta: "36",
    categoria: "Arroz y tallarines",
    tiempo: "6 min",
    nivel: "Básico",
    resumen: "Tallarines salteados al wok con carne, pollo, cerdo y gambas, con un huevo escalfado por encima.",
    ingredientes: ["Tallarines de trigo cocidos", "Gambas", "Tiras de pollo y cerdo", "Verdura en juliana", "Salsa de soja", "Huevo"],
    pasos: ["Saltear las carnes y las gambas en el wok muy caliente.", "Añadir la verdura y saltear 1 minuto.", "Incorporar los tallarines y la soja; mezclar con pinzas para que se impregnen.", "Escalfar el huevo aparte y ponerlo encima al emplatar."],
    calidad: ["Los tallarines no deben quedar pegados ni encharcados en salsa.", "Huevo con la yema líquida."],
    emplatado: "Nido alto en el centro del plato y el huevo encima.",
    alergenos: ["Gluten", "Huevo", "Crustáceos", "Soja"],
  },
  {
    id: "nigiri-salmon",
    tipo: "cocina",
    titulo: "Nigiri de salmón (4 piezas)",
    codigoCarta: "14A",
    categoria: "Sushi",
    tiempo: "4 min",
    nivel: "Medio",
    resumen: "El sushi que más piden los clientes habituales. Se juzga por el corte del pescado y por la bola de arroz.",
    ingredientes: ["Arroz de sushi aliñado (a temperatura ambiente)", "Lomo de salmón (previamente congelado según normativa)", "Wasabi", "Agua avinagrada para las manos"],
    pasos: ["Cortar el salmón en láminas al bies, del mismo tamaño y grosor (unos 3 x 7 cm).", "Mojar las manos en agua avinagrada y formar la bola de arroz (unos 15-20 g) sin apretar.", "Poner un punto de wasabi en la lámina y colocarla sobre el arroz.", "Dar forma con dos dedos para que el pescado abrace el arroz."],
    calidad: ["El arroz no se aprieta: debe deshacerse en la boca.", "Todas las piezas iguales.", "Cuchillo bien afilado y limpio entre cortes."],
    emplatado: "4 piezas alineadas en diagonal, con jengibre y wasabi a un lado.",
    alergenos: ["Pescado", "Soja (si se sirve con salsa)"],
    errores: ["Apretar el arroz (queda una bola dura).", "Láminas de distinto grosor."],
  },
  {
    id: "pollo-limon",
    tipo: "cocina",
    titulo: "Pollo al limón",
    codigoCarta: "49B",
    categoria: "Pollo",
    tiempo: "8 min",
    nivel: "Básico",
    resumen: "Pollo rebozado crujiente con salsa de limón aparte o napada al momento.",
    ingredientes: ["Pechuga de pollo en tiras", "Rebozado (harina, fécula, huevo)", "Salsa de limón (zumo, azúcar, fécula)", "Rodajas de limón"],
    pasos: ["Rebozar las tiras justo antes de freír.", "Freír a 175-180 °C hasta que estén doradas; escurrir.", "Calentar la salsa hasta que espese ligeramente.", "Napar el pollo con la salsa justo al salir, o servirla aparte si es para llevar."],
    calidad: ["El pollo tiene que llegar crujiente a la mesa: salsa al último segundo.", "Para llevar, salsa siempre aparte."],
    emplatado: "Tiras en abanico con rodajas de limón y la salsa por encima en hilo.",
    alergenos: ["Gluten", "Huevo"],
  },
  {
    id: "teppanyaki-solomillo",
    tipo: "cocina",
    titulo: "Teppanyaki de solomillo a la pimienta negra",
    codigoCarta: "52N",
    categoria: "Ternera",
    tiempo: "6 min",
    nivel: "Medio",
    resumen: "Solomillo a la plancha con salsa de pimienta negra. Es parte del pedido de siempre de algunos clientes habituales.",
    ingredientes: ["Solomillo de ternera en dados o tiras", "Cebolla y pimiento", "Salsa de pimienta negra", "Aceite"],
    pasos: ["Plancha muy caliente.", "Marcar la carne por todos los lados sin moverla demasiado.", "Añadir la cebolla y el pimiento y saltear 1 minuto.", "Terminar con la salsa de pimienta y servir enseguida."],
    calidad: ["Carne jugosa por dentro: preguntar el punto si el cliente es nuevo.", "Para llevar: envase que mantenga el calor, salsa por encima."],
    emplatado: "En plancha o fuente caliente, con la verdura debajo y la carne encima.",
    alergenos: ["Soja", "Gluten (según salsa)"],
  },
  {
    id: "rollo-primavera",
    tipo: "cocina",
    titulo: "Rollo de primavera",
    codigoCarta: "3",
    categoria: "Entrantes",
    tiempo: "5 min (fritura)",
    nivel: "Básico",
    resumen: "Entrante clásico y muy pedido en grupos. Debe salir dorado, crujiente y sin aceite.",
    ingredientes: ["Rollos preparados (masa de trigo, carne de cerdo, verdura, huevo)", "Aceite de freír", "Salsa agridulce"],
    pasos: ["Freír a 170 °C hasta que estén dorados por igual.", "Escurrir sobre papel 30 segundos.", "Cortar en diagonal si es para compartir."],
    calidad: ["Aceite a la temperatura correcta: si está frío, el rollo absorbe grasa.", "No amontonar en la freidora."],
    emplatado: "Cortados en diagonal, apoyados uno sobre otro, con salsa agridulce en cuenco.",
    alergenos: ["Gluten", "Huevo", "Soja"],
  },
  {
    id: "menu-del-dia",
    tipo: "cocina",
    titulo: "Menú del día (A, B y japonés)",
    categoria: "Menú del día",
    tiempo: "Mediodía, de 12:00 a 16:30",
    nivel: "Básico",
    resumen: "El menú del día (A 11 €, B 12 €, japonés 13,95 €) es el grueso del mediodía entre semana. Solo en sala y de lunes a viernes: no se sirve para llevar ni en fin de semana.",
    pasos: ["Antes de las 13:00: mise en place de primeros y segundos del día.", "Primer plato en menos de 10 minutos desde que se sienta la mesa.", "Segundo plato al retirar el primero.", "Postre o café al final."],
    calidad: ["Muchos clientes vienen en su hora de descanso: la rapidez es parte de la calidad.", "Raciones iguales en todos los platos."],
    errores: ["Aceptar el menú del día para llevar (no se permite)."],
  },
  {
    id: "alergias",
    tipo: "sala",
    titulo: "Protocolo de alergias",
    categoria: "Sala",
    tiempo: "Siempre",
    nivel: "Básico",
    resumen: "Si el CRM muestra una alergia en la reserva o en la mesa, hay que avisar a cocina antes de tomar nota.",
    pasos: ["Revisar en el CRM (Panel o Mesas) si algún comensal tiene alergias.", "Preguntar siempre: «¿Alguna alergia o intolerancia?».", "Apuntarla en la comanda en rojo y decírsela en voz alta al cocinero.", "Ante la duda sobre un ingrediente, consultar la ficha de alérgenos. Nunca suponer."],
    calidad: ["Cocina limpia utensilios y wok antes de preparar el plato.", "El plato con alergia sale aparte e identificado."],
  },
  {
    id: "qr-checkin",
    tipo: "sala",
    titulo: "Check-in con QR y captación de clientes",
    categoria: "Sala",
    tiempo: "1 min por mesa",
    nivel: "Básico",
    resumen: "Cada mesa tiene su QR. Al sentarse, invitamos al cliente a escanearlo para unirse a la mesa y crear su cuenta.",
    pasos: ["Al llevar la carta: «Si escaneáis el QR, os guardamos lo que pedís y podéis valorarnos».", "A los clientes habituales sin cuenta (el CRM los marca), explicárselo en persona.", "Si alguien no usa el móvil, crearle la cuenta desde el CRM con su teléfono.", "Nunca insistir: es opcional."],
    calidad: ["Explicar en una frase qué gana el cliente: historial, sus alergias guardadas, valorar."],
  },
  {
    id: "para-llevar",
    tipo: "sala",
    titulo: "Pedidos para llevar y Just Eat",
    categoria: "Sala",
    tiempo: "Según pedido",
    nivel: "Básico",
    resumen: "Se recogen por teléfono o llegan por Just Eat. El menú del día no se vende para llevar.",
    pasos: ["Teléfono: apuntar nombre, teléfono, platos y hora de recogida, y registrarlo en el CRM.", "Si es un habitual con «pedido de siempre», ofrecerlo: «¿Lo de siempre?».", "Salsas aparte en los fritos y rebozados para que lleguen crujientes.", "Pedidos de más de 60 €: incluir la botella de vino de regalo.", "Just Eat: los gastos de envío los paga el cliente."],
    calidad: ["Revisar el pedido contra la comanda antes de cerrar la bolsa."],
  },
  {
    id: "grupos",
    tipo: "sala",
    titulo: "Grupos, cumpleaños y cenas de empresa",
    categoria: "Sala",
    tiempo: "Preparar el día antes",
    nivel: "Medio",
    resumen: "No hay reservado fijo: las mesas se juntan según el grupo (23 mesas en sala más 4 en terraza, que se dividen o se juntan según el grupo).",
    pasos: ["Revisar en el Panel los «Grupos grandes próximos».", "Planificar qué mesas se juntan (si el cliente tiene mesa preferida, alrededor de ella).", "En cumpleaños, preguntar si traen tarta o quieren velas.", "Sugerir el pato laqueado o los menús para compartir a grupos que celebran algo."],
    calidad: ["Sacar los platos a la vez para todo el grupo.", "Una sola persona de sala de referencia para el grupo."],
  },
];

export const ID_FICHAS_FORMACION = FICHAS.map((f) => f.id);
