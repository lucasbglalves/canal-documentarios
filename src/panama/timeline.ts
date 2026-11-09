import { interpolate } from "remotion";
import roteiro from "./roteiro.json";
import voz from "./voz.json";

export const FPS = 30;
const GAP = 7;
const ENTRADA = 10;

type Roteiro = { id: string; cauda: number; falas: { texto: string; legenda?: string; pausa?: number }[] }[];

// Todo o tempo vem do áudio medido: trocar a voz ressincroniza o vídeo inteiro.
export const montar = (roteiro: Roteiro, voz: Record<string, { d: number }>, gap = GAP, entrada = ENTRADA) => {
  let cursor = 0;
  const cenas = roteiro.map((cena) => {
    let t = entrada;
    const falas = cena.falas.map((f, i) => {
      const id = `${cena.id}-${i}`;
      const duracao = Math.ceil(voz[id].d * FPS);
      const fala = { id, de: t, duracao, legenda: f.legenda ?? f.texto };
      t += duracao + gap + (f.pausa ?? 0); // pausa: frames livres depois da fala (áudio real, por exemplo)
      return fala;
    });
    const out = { id: cena.id, inicio: cursor, duracao: t + cena.cauda, falas };
    cursor += out.duracao;
    return out;
  });
  return { CENAS: cenas, DURACAO_TOTAL: cursor };
};

export const { CENAS, DURACAO_TOTAL } = montar(roteiro, voz);

export type Cena = (typeof CENAS)[number];
export const cena = (id: string) => CENAS.find((c) => c.id === id) as Cena;

export const rampa = (
  frame: number,
  de: number,
  ate: number,
  saida: [number, number] = [0, 1],
  easing?: (t: number) => number,
) =>
  interpolate(frame, [de, ate], saida, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const COR = {
  oceano: "#0A1826",
  terra: "#1C3044",
  borda: "#2E4A63",
  texto: "#F2F5F7",
  apagado: "#8EA3B5",
  ouro: "#F2B632",
  vermelho: "#E4572E",
  agua: "#2EA8E0",
  aguaEscura: "#16567A",
  solo: "#3A2E26",
};
