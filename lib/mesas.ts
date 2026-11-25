// 23 mesas de sala (1-23) + 4 de terraza (24-27, se muestran como T1-T4)
export const N_MESAS_SALA = 23;
export const N_MESAS_TERRAZA = 4;
export const MESAS = Array.from({ length: N_MESAS_SALA + N_MESAS_TERRAZA }, (_, i) => i + 1);
export const nombreMesa = (n: number) => (n > N_MESAS_SALA ? `Terraza T${n - N_MESAS_SALA}` : `Mesa ${n}`);
