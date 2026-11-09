import { Audio } from "@remotion/media";
import { FC } from "react";
import { AbsoluteFill, Sequence, staticFile, Track } from "remotion";
import { Abertura, Adversario, Avisos, Canal, Depois, Despacho, DiarioCena, Empresa, Fatores, Minutos, Vinhedo } from "./Cenas";
import { Cena, cena, CENAS, DURACAO_TOTAL, rampa } from "./timeline";

export { DURACAO_TOTAL };

const COMPONENTES: Record<string, FC<{ c: Cena }>> = {
  abertura: Abertura,
  empresa: Empresa,
  adversario: Adversario,
  diario: DiarioCena,
  despacho: Despacho,
  avisos: Avisos,
  minutos: Minutos,
  vinhedo: Vinhedo,
  fatores: Fatores,
  depois: Depois,
  canal: Canal,
};

// Sons da cabine, com volume baixo: só onde o relatório registra o alerta.
const at = (id: string, n: number, mais = 0) => cena(id).inicio + cena(id).falas[n].de + mais;
const CHIMES = [at("avisos", 1), at("minutos", 3), at("minutos", 4), at("minutos", 8)];
const ESTOL = at("minutos", 9);
const FIM_DRONE = at("vinhedo", 0);

export const Voepass2283 = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    {CENAS.map((c) => {
      const Componente = COMPONENTES[c.id];
      return (
        <Sequence key={c.id} name={c.id} from={c.inicio} durationInFrames={c.duracao}>
          <Componente c={c} />
        </Sequence>
      );
    })}
    <Track name="Voz">
      {CENAS.flatMap((c) =>
        c.falas.map((f) => (
          <Audio key={f.id} name={f.id} src={staticFile(`voz-voepass/${f.id}.mp3`)} from={c.inicio + f.de} durationInFrames={f.duracao} />
        )),
      )}
    </Track>
    <Track name="Fundo">
      <Audio src={staticFile("sfx-voepass/drone.mp3")} durationInFrames={FIM_DRONE} volume={(f) => 0.22 * rampa(f, FIM_DRONE - 30, FIM_DRONE, [1, 0])} />
    </Track>
    <Track name="Cabine">
      {CHIMES.map((de) => (
        <Sequence key={de} from={de} durationInFrames={27}>
          <Audio src={staticFile("sfx-voepass/chime.mp3")} volume={0.18} />
        </Sequence>
      ))}
      <Sequence from={ESTOL} durationInFrames={72}>
        <Audio src={staticFile("sfx-voepass/estol.mp3")} volume={0.12} />
      </Sequence>
    </Track>
  </AbsoluteFill>
);
