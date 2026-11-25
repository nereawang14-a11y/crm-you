"use client";

import { useParams } from "next/navigation";
import { CARTA, CATEGORIAS } from "@/lib/carta";
import { DOCUMENTOS } from "@/lib/documentos";
import { fmtEuros } from "@/lib/fechas";

const INFO = "Avenida Juan Carlos I, 13 · La Garena, Alcalá de Henares · 91 802 54 52 · Lunes a domingo, 12:00–16:30 y 19:30–23:30";

const MENUS_GRUPO = [
  { nombre: "Menú You", precio: 35, platos: ["Ensalada (2)", "Rollitos vietnamitas (4)", "Arroz frito", "Solomillo de ternera con pimientos verdes", "Pollo frito almendrado"] },
  { nombre: "Menú Cantonés", precio: 37.9, platos: ["Sopa agripicante", "Rollo de primavera", "Dim sum (ja kao y siu mai)", "Arroz frito al estilo cantonés", "Solomillo de ternera salteado con lechuga al estilo cantonés"] },
  { nombre: "Menú Asia", precio: 39.9, platos: ["Sopa Tom Yam Kum", "Rollo de pollo con mango", "Tempura de verduras", "Arroz frito con algodón de cerdo", "Gambas al estilo tailandés", "Teppanyaki de pollo"] },
  { nombre: "Menú Japonés", precio: 45.9, platos: ["Sopa de miso", "Ensalada japonesa", "Tempura mixta", "Mixto de sushi", "Arroz frito japonés", "Teppanyaki de langostinos", "Teppanyaki de ternera (yakiniku)"] },
];

function Menus() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {MENUS_GRUPO.map((m) => (
        <div key={m.nombre} className="break-inside-avoid rounded-xl border border-stone-200 p-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">{m.nombre}</h3>
            <span className="font-semibold text-red-700">{fmtEuros(m.precio)}</span>
          </div>
          <div className="text-xs text-stone-500">Para 2 personas</div>
          <ul className="mt-2 space-y-0.5 text-sm">{m.platos.map((p) => <li key={p}>· {p}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

export default function Doc() {
  const { id } = useParams<{ id: string }>();
  const doc = DOCUMENTOS.find((d) => d.id === id);
  if (!doc) return <div className="p-10 text-center">Documento no encontrado.</div>;

  return (
    <div className="mx-auto max-w-3xl bg-white px-8 py-10 print:max-w-none print:px-0 print:py-0">
      <div className="mb-6 flex items-start justify-between print:mb-4">
        <div>
          <div className="text-5xl font-black tracking-tight text-red-700">YOU</div>
          <div className="text-sm text-stone-500">Cocina asiática y japonesa · Alcalá de Henares</div>
        </div>
        <button onClick={() => window.print()} className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white print:hidden">Descargar PDF</button>
      </div>
      <h1 className="mb-4 border-b-2 border-red-700 pb-2 text-2xl font-semibold">{doc.titulo}</h1>

      {id === "carta" && (
        <div className="columns-1 gap-8 sm:columns-2">
          {CATEGORIAS.filter((c) => !c.startsWith("Menú del día")).map((cat) => (
            <div key={cat} className="mb-5 break-inside-avoid">
              <h2 className="mb-1 font-semibold uppercase tracking-wide text-red-700">{cat}</h2>
              <ul className="space-y-0.5 text-sm">
                {CARTA.filter((p) => p.categoria === cat).map((p) => (
                  <li key={p.codigo} className="flex justify-between gap-3">
                    <span><span className="text-xs text-stone-400">{p.codigo}</span> {p.nombre}</span>
                    <span className="whitespace-nowrap">{fmtEuros(p.precio)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {id === "menu-del-dia" && (
        <div className="space-y-3">
          <p className="text-stone-700">De lunes a viernes, a mediodía. Solo en sala.</p>
          {[["Menú A", 11], ["Menú B", 12], ["Menú japonés", 13.95]].map(([n, p]) => (
            <div key={n as string} className="flex justify-between rounded-xl border border-stone-200 p-4 text-lg">
              <span className="font-semibold">{n}</span>
              <span className="font-semibold text-red-700">{fmtEuros(p as number)}</span>
            </div>
          ))}
          <p className="text-sm text-stone-500">Primeros y segundos cambian cada día: pregunta al personal.</p>
        </div>
      )}

      {id === "menus-grupo" && (
        <>
          <p className="mb-4 text-stone-700">Menús pensados para compartir. Perfectos para cumpleaños, comidas familiares y grupos. Para grupos grandes, llámanos y preparamos la mesa.</p>
          <Menus />
          <p className="mt-4 text-sm text-stone-600">Nuestra especialidad para celebraciones: <strong>pato laqueado pekinés en tres servicios</strong> (piel crujiente con crepes, salteado y sopa), desde {fmtEuros(29)}.</p>
        </>
      )}

      {id === "navidad-empresas" && (
        <>
          <p className="mb-4 text-stone-700">Este año, celebrad la cena de empresa en YOU. Preparamos la sala a medida de vuestro grupo, juntando las mesas que haga falta, y os proponemos menús para compartir.</p>
          <Menus />
          <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-900 print:bg-white">
            <strong>Reserva con antelación:</strong> en diciembre se llena. Llámanos al 91 802 54 52 o escríbenos por WhatsApp con la fecha y el número de personas y os guardamos la mesa.
          </div>
          <p className="mt-3 text-xs text-stone-400 print:hidden">Texto propuesto para la demo: condiciones a validar por el restaurante.</p>
        </>
      )}

      <footer className="mt-10 border-t border-stone-200 pt-3 text-center text-xs text-stone-500">{INFO} · restauranteyou.com</footer>
    </div>
  );
}
