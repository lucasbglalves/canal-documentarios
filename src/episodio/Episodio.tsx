import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { FC } from "react";
import { AbsoluteFill, interpolate, Sequence, spring, staticFile, Track, useCurrentFrame, useVideoConfig } from "remotion";
import { Abertura, CenaBanheiro, CenaEscola, CenaExpulsos, CenaFinal, CenaForte, CenaFuga, CenaMonstro } from "./Cenas";
import { CENAS, CenaCtx, DURACAO_TOTAL, Quem } from "./timeline";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const COMPONENTES: Record<string, FC> = {
  abertura: Abertura,
  banheiro: CenaBanheiro,
  expulsos: CenaExpulsos,
  escola: CenaEscola,
  monstro: CenaMonstro,
  fuga: CenaFuga,
  forte: CenaForte,
  final: CenaFinal,
};

const CORES: Record<Quem, string> = {
  narrador: "#FFFFFF",
  tommy: "#FFD93D",
  nico: "#7BDFF2",
  pai: "#7BE495",
  professora: "#E0AAFF",
  monstro: "#FF7B7B",
};

const contorno = (px: number) => ({
  WebkitTextStroke: `${px}px #1A1020`,
  paintOrder: "stroke fill" as const,
});

const Legendas = () => {
  const frame = useCurrentFrame();
  const cena = CENAS.find((c) => frame < c.inicio + c.duracao);
  const fala = cena?.falas.find(
    (f) => frame >= cena.inicio + f.de && frame < cena.inicio + f.de + f.duracao,
  );
  if (!fala) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 56 }}>
      <div
        style={{
          fontFamily,
          fontSize: 58,
          lineHeight: 1.14,
          maxWidth: 1560,
          textAlign: "center",
          color: CORES[fala.quem],
          ...contorno(11),
        }}
      >
        {fala.texto}
      </div>
    </AbsoluteFill>
  );
};

const Fades = () => {
  const frame = useCurrentFrame();
  const cena = CENAS.find((c) => frame < c.inicio + c.duracao) ?? CENAS[CENAS.length - 1];
  const t = frame - cena.inicio;
  const opacity = Math.max(
    interpolate(t, [0, 12], [1, 0], { extrapolateRight: "clamp" }),
    interpolate(t, [cena.duracao - 10, cena.duracao], [0, 1], { extrapolateLeft: "clamp" }),
  );
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity }} />;
};

const Titulo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", backgroundColor: "rgba(10,5,25,.55)" }}>
      <div style={{ fontFamily, fontSize: 170, color: "#FFD93D", scale: `${pop(0)}`, rotate: "-2deg", ...contorno(26) }}>
        TOMMY &amp; NICO
      </div>
      <div style={{ fontFamily, fontSize: 96, color: "#fff", scale: `${pop(10)}`, ...contorno(18) }}>
        e o Monstro da Privada
      </div>
    </AbsoluteFill>
  );
};

const Inscreva = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 9, stiffness: 120, mass: 0.8 } });
  const pulso = 1 + Math.abs(Math.sin(frame * 0.12)) * 0.05;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
      <div
        style={{
          fontFamily,
          fontSize: 78,
          color: "#fff",
          background: "#E5202E",
          borderBottom: "12px solid #9C1420",
          borderRadius: 40,
          padding: "16px 60px 22px",
          scale: `${entra * pulso}`,
        }}
      >
        SE INSCREVA E ATIVE O SININHO!
      </div>
    </AbsoluteFill>
  );
};

export const Episodio = () => {
  const { width, height } = useVideoConfig();
  const abertura = CENAS[0];
  const final = CENAS[CENAS.length - 1];
  const ultimaFala = final.falas[final.falas.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 38, near: 0.1, far: 220, position: [0, 3, 10] }}>
        {CENAS.map((c) => {
          const Componente = COMPONENTES[c.id];
          return (
            <Sequence key={c.id} name={c.id} from={c.inicio} durationInFrames={c.duracao} layout="none">
              <CenaCtx.Provider value={c}>
                <Componente />
              </CenaCtx.Provider>
            </Sequence>
          );
        })}
      </ThreeCanvas>
      <Track name="Voz">
        {CENAS.flatMap((c) =>
          c.falas.map((f) => (
            <Audio key={f.id} name={f.id} src={staticFile(`voz/${f.id}.mp3`)} from={c.inicio + f.de} durationInFrames={f.duracao} />
          )),
        )}
      </Track>
      <Sequence name="Título" from={abertura.duracao - 96} durationInFrames={96}>
        <Titulo />
      </Sequence>
      <Sequence name="Inscreva-se" from={final.inicio + ultimaFala.de} durationInFrames={DURACAO_TOTAL - final.inicio - ultimaFala.de}>
        <Inscreva />
      </Sequence>
      <Legendas />
      <Fades />
    </AbsoluteFill>
  );
};
