// Material real: fotos, vídeo, satélite e áudio do controle. Créditos em fontes.md.
import { Audio, Video } from "@remotion/media";
import { ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { corpo, Rotulo } from "../panama/Cenas";
import radio from "./radio.json";
import { COR, rampa } from "./timeline";

export const Credito = ({ children }: { children: ReactNode }) => (
  <div style={{ position: "absolute", right: 40, bottom: 28, fontFamily: corpo, fontSize: 18, color: "rgba(255,255,255,.65)", letterSpacing: 1 }}>{children}</div>
);

/** Foto em tela cheia com zoom lento (Ken Burns), entrando e saindo em fade. */
export const Foto = ({ src, credito, de, ate, origem = "50% 50%" }: { src: string; credito: string; de: number; ate: number; origem?: string }) => {
  const frame = useCurrentFrame();
  if (frame < de - 1 || frame > ate + 15) return null;
  const zoom = interpolate(frame, [de, ate + 15], [1.04, 1.14]);
  return (
    <AbsoluteFill style={{ opacity: rampa(frame, de, de + 12) * rampa(frame, ate, ate + 15, [1, 0]), backgroundColor: "#000" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})`, transformOrigin: origem }} />
      <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(0,0,0,.75))" }} />
      <Credito>{credito}</Credito>
    </AbsoluteFill>
  );
};

/**
 * Vídeo dos operários (Metrópoles). Ampliado 1,4x e encostado no canto superior esquerdo
 * para cortar o logo (canto superior direito) e a legenda gravada (rodapé).
 */
export const Operarios = ({ de, ate, inicio = 0, volume = 0.35 }: { de: number; ate: number; inicio?: number; volume?: number }) => {
  const frame = useCurrentFrame();
  if (frame < de - 1 || frame > ate + 12) return null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden", opacity: rampa(frame, ate, ate + 12, [1, 0]) }}>
      <div style={{ position: "absolute", left: 0, top: -168, width: 1920 * 1.4, height: 1080 * 1.4 }}>
        <Sequence from={de} durationInFrames={ate - de + 12} layout="none">
          <Video
            src={staticFile("clipes-voepass/metropoles-parafuso.mp4")}
            trimBefore={Math.round(inicio * 30)}
            volume={(f) => volume * rampa(f, ate - de - 10, ate - de + 12, [1, 0])}
            style={{ width: "100%", height: "100%" }}
          />
        </Sequence>
      </div>
      <Credito>Vídeo: operários em Vinhedo · reprodução Metrópoles</Credito>
    </AbsoluteFill>
  );
};

// Web Mercator: posição em pixels dentro de um mosaico de tiles (canto NW = tile x0/y0).
export type Mosaico = { src: string; z: number; x0: number; y0: number; lado: number };
export const merc = (m: Mosaico, [lon, lat]: [number, number]): [number, number] => {
  const k = 2 ** m.z;
  const x = ((lon + 180) / 360) * k;
  const y = ((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * k;
  return [(x - m.x0) * 256, (y - m.y0) * 256];
};
export const ROTA: Mosaico = { src: "satelite-voepass/rota-z7.jpg", z: 7, x0: 43, y0: 69, lado: 1536 };
export const VINHEDO: Mosaico = { src: "satelite-voepass/vinhedo-z14.jpg", z: 14, x0: 6047, y0: 9264, lado: 3072 };

/**
 * Mapa de satélite: centraliza `centro` (lon/lat) na tela com a escala dada.
 * `children` é um SVG desenhado nas coordenadas do mosaico.
 */
export const Satelite = ({ m, centro, escala, children }: { m: Mosaico; centro: [number, number]; escala: number; children?: ReactNode }) => {
  const [cx, cy] = merc(m, centro);
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B1320", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 960 - cx * escala, top: 540 - cy * escala, width: m.lado, height: m.lado, transform: `scale(${escala})`, transformOrigin: "0 0" }}>
        <Img src={staticFile(m.src)} style={{ width: m.lado, height: m.lado, filter: "saturate(.85) brightness(.8)" }} />
        <svg width={m.lado} height={m.lado} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {children}
        </svg>
      </div>
      <Credito>Imagem: Sentinel-2 cloudless 2016 · EOX (CC BY 4.0)</Credito>
    </AbsoluteFill>
  );
};

// Trechos do áudio (frames de radio.json) e o que é dito, conforme a transcrição do g1.
const TRECHOS: { de: number; ate: number; quem: string; texto: string }[] = [
  { de: 38, ate: 123, quem: "PILOTO", texto: "Ponto ideal de descida, o Passaredo 2283." },
  { de: 140, ate: 229, quem: "CONTROLE", texto: "Passaredo 2283, mantenha nível 170." },
  { de: 243, ate: 308, quem: "PILOTO", texto: "Mantendo nível 170, Passaredo 2283." },
];
export const RADIO_FRAMES = 318;

/** Áudio real do controle com forma de onda e transcrição sincronizada. */
export const Radio = ({ de, hora }: { de: number; hora: string }) => {
  const frame = useCurrentFrame();
  const t = frame - de;
  if (t < -15 || t > RADIO_FRAMES + 15) return null;
  const barras = 90;
  return (
    <AbsoluteFill style={{ backgroundColor: "#05080C", opacity: rampa(t, -15, 0) * rampa(t, RADIO_FRAMES, RADIO_FRAMES + 15, [1, 0]), justifyContent: "center", alignItems: "center" }}>
      <Sequence from={de} durationInFrames={RADIO_FRAMES} layout="none">
        <Audio src={staticFile("sfx-voepass/radio-1319.mp3")} volume={0.9} />
      </Sequence>
      <div style={{ position: "absolute", top: 120, textAlign: "center" }}>
        <Rotulo size={26} style={{ letterSpacing: 5, color: COR.ciano }}>ÁUDIO REAL · CONTROLE DE TRÁFEGO AÉREO</Rotulo>
        <Rotulo size={64} cor={COR.texto} style={{ marginTop: 12 }}>{hora}</Rotulo>
      </div>
      <svg width={1500} height={220}>
        {Array.from({ length: barras }, (_, i) => {
          const k = Math.round(t - barras / 2 + i);
          const v = k >= 0 && k < radio.m.length ? Number(radio.m[k]) / 9 : 0;
          const h = 6 + v * 200;
          const passado = i <= barras / 2;
          return <rect key={i} x={i * (1500 / barras)} y={110 - h / 2} width={1500 / barras - 5} height={h} rx={3} fill={passado ? COR.ciano : "#2A3A4C"} />;
        })}
      </svg>
      <div style={{ position: "absolute", top: 720, width: 1400, textAlign: "center" }}>
        {TRECHOS.map((s) => {
          const o = rampa(t, s.de - 6, s.de + 4) * rampa(t, s.ate + 20, s.ate + 30, [1, 0]);
          return o > 0 ? (
            <div key={s.de} style={{ position: "absolute", width: "100%", opacity: o, transform: `translateY(${interpolate(o, [0, 1], [12, 0], { easing: Easing.out(Easing.cubic) })}px)` }}>
              <Rotulo size={24} style={{ letterSpacing: 4, color: s.quem === "PILOTO" ? COR.ambar : COR.ciano }}>{s.quem}</Rotulo>
              <div style={{ fontFamily: corpo, fontWeight: 600, fontSize: 52, color: COR.texto, marginTop: 10 }}>“{s.texto}”</div>
            </div>
          ) : null;
        })}
      </div>
      <Credito>Áudio: reprodução g1 · “Passaredo” é o indicativo de chamada da Voepass</Credito>
    </AbsoluteFill>
  );
};
