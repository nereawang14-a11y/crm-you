/**
 * Logo de YOU: palabra YOU en dorado (color de la web del restaurante, #be9a66).
 */
export const ORO = "#be9a66";

const TAM = { sm: "text-xl", md: "text-3xl", lg: "text-5xl" };

export function Logo({ size = "md", className = "" }: { size?: keyof typeof TAM; claro?: boolean; className?: string }) {
  return (
    <span className={`inline-block font-black leading-none tracking-[0.18em] ${TAM[size]} ${className}`} style={{ color: ORO }} aria-label="YOU">
      YOU
    </span>
  );
}
