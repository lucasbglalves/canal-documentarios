import { interpolate } from "remotion";
import { montar } from "../panama/timeline";
import roteiro from "./roteiro.json";
import voz from "./voz.json";

export { rampa } from "../panama/timeline";
export const { CENAS, DURACAO_TOTAL } = montar(roteiro, voz, 12, 15);
export type Cena = (typeof CENAS)[number];
export const cena = (id: string) => CENAS.find((c) => c.id === id) as Cena;
/** Frame (relativo à cena) em que começa a fala i. */
export const fala = (c: Cena, i: number) => c.falas[i].de;

// "13:20:57" -> segundos do dia
export const hora = (h: string) => h.split(":").reduce((s, p) => s * 60 + Number(p), 0);
export const relogio = (seg: number) => {
  const s = Math.floor(seg);
  return [s / 3600, (s / 60) % 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, "0")).join(":");
};
/** Hora real do voo a partir de pares [frame, "hh:mm:ss"] da cena. */
export const horaNoFrame = (frame: number, marcos: [number, string][]) =>
  interpolate(frame, marcos.map((m) => m[0]), marcos.map((m) => hora(m[1])), {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const COR = {
  ceu: "#0B1320",
  ceu2: "#1B2A3D",
  texto: "#F2F5F7",
  apagado: "#8EA3B5",
  ambar: "#F5B731",
  vermelho: "#E5484D",
  gelo: "#CFEAF7",
  ciano: "#4CC3E8",
};
