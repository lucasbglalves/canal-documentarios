import { createContext, useContext } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import roteiro from "./roteiro.json";
import voz from "./voz.json";

export const FPS = 30;
const GAP = 8;
const ENTRADA = 15;

export type V3 = [number, number, number];
export type Quem = "narrador" | "tommy" | "nico" | "pai" | "professora" | "monstro";

const medidas = voz as Record<string, { d: number; m: string }>;

// Every timing derives from the measured audio, so swapping voices re-syncs the whole episode.
let cursor = 0;
export const CENAS = roteiro.map((cena) => {
  let t = ENTRADA;
  const falas = cena.falas.map((f, i) => {
    const id = `${cena.id}-${i}`;
    const duracao = Math.ceil(medidas[id].d * FPS);
    const fala = { ...f, quem: f.quem as Quem, id, de: t, duracao, boca: medidas[id].m };
    t += duracao + GAP;
    return fala;
  });
  const out = { id: cena.id, inicio: cursor, duracao: t + cena.cauda, falas };
  cursor += out.duracao;
  return out;
});
export const DURACAO_TOTAL = cursor;

export type Cena = (typeof CENAS)[number];

export const CenaCtx = createContext<Cena>(CENAS[0]);

/** Scene clock. `at(n)` and `fim(n)` are the start and end frames of spoken line n. */
export const useCena = () => {
  const cena = useContext(CenaCtx);
  const frame = useCurrentFrame();
  const at = (n: number) => cena.falas[n].de;
  const fim = (n: number) => cena.falas[n].de + cena.falas[n].duracao;
  const atual = [...cena.falas].reverse().find((f) => frame >= f.de);
  const falando = atual && frame < atual.de + atual.duracao ? atual : null;
  const boca = (quem: Quem) =>
    falando?.quem === quem ? Number(falando.boca[frame - falando.de] ?? 0) / 9 : 0;
  return { cena, frame, at, fim, atual, falando, boca };
};

export const mix = (frame: number, entrada: [number, number], saida: [number, number]) =>
  interpolate(frame, entrada, saida, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const lerpV = (t: number, a: V3, b: V3): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
