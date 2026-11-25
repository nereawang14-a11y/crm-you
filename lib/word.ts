"use client";

import { CARTA, CATEGORIAS } from "./carta";
import { DOCUMENTOS, INFO, MENUS_GRUPO, TEXTOS } from "./documentos";
import { fmtEuros } from "./fechas";

/** Genera y descarga el documento como Word (.docx) editable. */
export async function descargarWord(id: string) {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, TabStopType } = await import("docx");
  const doc = DOCUMENTOS.find((d) => d.id === id);
  if (!doc) return;
  const ROJO = "8A6A3E"; // dorado oscuro de marca
  const p = (text: string, opts: { bold?: boolean; color?: string; size?: number; italics?: boolean } = {}) =>
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, ...opts })] });
  const h = (text: string) => new Paragraph({ spacing: { before: 240, after: 80 }, children: [new TextRun({ text: text.toUpperCase(), color: ROJO, bold: true })] });
  // línea "plato ........ precio" con tabulador a la derecha
  const linea = (izq: string, der: string) =>
    new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9000 }], spacing: { after: 40 }, children: [new TextRun(izq), new TextRun({ text: `\t${der}` })] });

  const cuerpo: InstanceType<typeof Paragraph>[] = [
    new Paragraph({ children: [new TextRun({ text: "YOU", bold: true, size: 64, color: ROJO })] }),
    p("Cocina asiática y japonesa · Alcalá de Henares", { color: "78716C" }),
    new Paragraph({ spacing: { before: 200, after: 200 }, border: { bottom: { style: "single", size: 12, color: ROJO, space: 4 } }, children: [new TextRun({ text: doc.titulo, bold: true, size: 32 })] }),
  ];

  const menus = () => {
    for (const m of MENUS_GRUPO) {
      cuerpo.push(new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9000 }], spacing: { before: 200, after: 40 }, children: [new TextRun({ text: m.nombre, bold: true }), new TextRun({ text: `\t${fmtEuros(m.precio)} (2 personas)`, bold: true, color: ROJO })] }));
      m.platos.forEach((x) => cuerpo.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(x)] })));
    }
  };

  if (id === "carta") {
    for (const cat of CATEGORIAS.filter((c) => !c.startsWith("Menú del día"))) {
      cuerpo.push(h(cat));
      CARTA.filter((x) => x.categoria === cat).forEach((x) => cuerpo.push(linea(`${x.codigo}. ${x.nombre}`, fmtEuros(x.precio))));
    }
  } else if (id === "menu-del-dia") {
    cuerpo.push(p(TEXTOS.menuDelDia));
    [["Menú A", 11], ["Menú B", 12], ["Menú japonés", 13.95]].forEach(([n, pr]) => cuerpo.push(linea(n as string, fmtEuros(pr as number))));
  } else if (id === "menus-grupo") {
    cuerpo.push(p(TEXTOS.menusGrupoIntro));
    menus();
    cuerpo.push(p(""), p(TEXTOS.pato));
  } else if (id === "navidad-empresas") {
    cuerpo.push(p(TEXTOS.navidadIntro));
    menus();
    cuerpo.push(p(""), new Paragraph({ children: [new TextRun({ text: "Reserva con antelación: ", bold: true }), new TextRun(TEXTOS.navidadReserva)] }));
  }
  cuerpo.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: `${INFO} · restauranteyou.com`, size: 16, color: "78716C" })] }));

  const blob = await Packer.toBlob(new Document({ creator: "YOU", title: doc.titulo, styles: { default: { document: { run: { font: "Arial", size: 21 } } } }, sections: [{ children: cuerpo }] }));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `YOU - ${doc.titulo}.docx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
