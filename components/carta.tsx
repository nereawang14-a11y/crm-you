import { CARTA, CATEGORIAS } from "@/lib/carta";
import { fmtEuros } from "@/lib/fechas";

/** <option>s de la carta agrupadas por categoría. paraLlevar excluye lo que solo se sirve en sala (menú del día). */
export function OpcionesCarta({ paraLlevar = false }: { paraLlevar?: boolean }) {
  return (
    <>
      {CATEGORIAS.map((cat) => {
        const items = CARTA.filter((p) => p.categoria === cat && !(paraLlevar && p.soloSala));
        if (!items.length) return null;
        return (
          <optgroup key={cat} label={cat}>
            {items.map((p) => (
              <option key={p.codigo} value={p.nombre}>
                {p.codigo}. {p.nombre} · {fmtEuros(p.precio)}{p.estimado ? " (precio estimado)" : ""}
              </option>
            ))}
          </optgroup>
        );
      })}
    </>
  );
}
