/**
 * Logo de YOU: sello dorado con 有 (yǒu, "tener / abundancia", que suena como YOU)
 * + palabra YOU en tinta oscura. Dorado tomado de la web del restaurante (#be9a66).
 */
export const ORO = "#be9a66";

const TAM = {
  sm: { sello: "h-7 w-7 text-base", texto: "text-xl", gap: "gap-2" },
  md: { sello: "h-9 w-9 text-xl", texto: "text-3xl", gap: "gap-2.5" },
  lg: { sello: "h-14 w-14 text-3xl", texto: "text-5xl", gap: "gap-3" },
};

export function Logo({ size = "md", claro = false, className = "" }: { size?: keyof typeof TAM; claro?: boolean; className?: string }) {
  const t = TAM[size];
  return (
    <span className={`inline-flex items-center ${t.gap} ${className}`} aria-label="YOU">
      <span className={`inline-flex items-center justify-center rounded-md font-serif font-semibold text-white shadow-sm ${t.sello}`} style={{ background: ORO }} aria-hidden>
        有
      </span>
      <span className={`font-black tracking-[0.18em] ${t.texto} ${claro ? "text-white" : "text-stone-900"}`}>YOU</span>
    </span>
  );
}
