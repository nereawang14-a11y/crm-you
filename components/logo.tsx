/**
 * Logo de YOU: palabra YOU en tinta oscura con una línea dorada debajo.
 * Dorado tomado de la web del restaurante (#be9a66).
 */
export const ORO = "#be9a66";

const TAM = {
  sm: { texto: "text-xl", linea: "h-[2px] mt-0.5" },
  md: { texto: "text-3xl", linea: "h-[3px] mt-1" },
  lg: { texto: "text-5xl", linea: "h-1 mt-1.5" },
};

export function Logo({ size = "md", claro = false, className = "" }: { size?: keyof typeof TAM; claro?: boolean; className?: string }) {
  const t = TAM[size];
  return (
    <span className={`inline-flex flex-col items-stretch ${className}`} aria-label="YOU">
      <span className={`font-black leading-none tracking-[0.18em] ${t.texto} ${claro ? "text-white" : "text-stone-900"}`}>YOU</span>
      <span className={`block w-full rounded-full ${t.linea}`} style={{ background: ORO }} aria-hidden />
    </span>
  );
}
