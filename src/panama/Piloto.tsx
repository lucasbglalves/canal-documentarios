import { Audio } from "@remotion/media";
import { FC } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, Track, useCurrentFrame } from "remotion";
import { corpo, Custo, Eclusas, Fim, Gancho, Rota, Seca } from "./Cenas";
import { Mapa } from "./Mapa";
import { Cena, CENAS, DURACAO_TOTAL } from "./timeline";

const COMPONENTES: Record<string, FC<{ c: Cena }>> = {
  gancho: Gancho,
  rota: Rota,
  custo: Custo,
  eclusas: Eclusas,
  seca: Seca,
  fim: Fim,
};

const Legendas = () => {
  const frame = useCurrentFrame();
  const c = CENAS.find((x) => frame < x.inicio + x.duracao);
  const fala = c?.falas.find((f) => frame >= c.inicio + f.de && frame < c.inicio + f.de + f.duracao);
  if (!fala) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 46 }}>
      <div style={{ fontFamily: corpo, fontWeight: 500, fontSize: 38, lineHeight: 1.3, maxWidth: 1400, textAlign: "center", color: "#fff", background: "rgba(5,12,20,.72)", padding: "10px 26px", borderRadius: 10 }}>
        {fala.legenda}
      </div>
    </AbsoluteFill>
  );
};

const SFX = {
  whoosh: "https://remotion.media/whoosh.wav",
  ding: "https://remotion.media/ding.wav",
};

const PING: [string, number][] = [
  ["gancho", 0],
  ["rota", 2],
  ["rota", 3],
  ["custo", 1],
  ["seca", 2],
  ["fim", 1],
];

export const Piloto = () => (
  <AbsoluteFill style={{ backgroundColor: "#0A1826" }}>
    <Mapa />
    {CENAS.map((c) => {
      const Componente = COMPONENTES[c.id];
      return (
        <Sequence key={c.id} name={c.id} from={c.inicio} durationInFrames={c.duracao}>
          <Componente c={c} />
        </Sequence>
      );
    })}
    <Legendas />
    <Track name="Voz">
      {CENAS.flatMap((c) =>
        c.falas.map((f) => (
          <Audio key={f.id} name={f.id} src={staticFile(`voz-panama/${f.id}.mp3`)} from={c.inicio + f.de} durationInFrames={f.duracao} />
        )),
      )}
    </Track>
    <Track name="Música">
      <Audio
        name="trilha"
        src={staticFile("panama-musica.mp3")}
        durationInFrames={DURACAO_TOTAL}
        volume={(f) => 0.16 * interpolate(f, [DURACAO_TOTAL - 45, DURACAO_TOTAL], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </Track>
    <Track name="Transições">
      {CENAS.slice(1).map((c) => (
        <Sequence key={c.id} name={`whoosh ${c.id}`} from={c.inicio - 8} durationInFrames={40} layout="none">
          <Audio src={SFX.whoosh} volume={0.3} />
        </Sequence>
      ))}
    </Track>
    <Track name="Destaques">
      {PING.map(([id, n]) => {
        const c = CENAS.find((x) => x.id === id) as Cena;
        const f = c.falas[n];
        return (
          <Sequence key={`${id}${n}`} name={`ding ${id}`} from={c.inicio + f.de + f.duracao - 12} durationInFrames={45} layout="none">
            <Audio src={SFX.ding} volume={0.14} />
          </Sequence>
        );
      })}
    </Track>
  </AbsoluteFill>
);
