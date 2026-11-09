import { geoMercator, geoPath } from "d3-geo";
import type { GeometryObject, Topology } from "topojson-specification";
import { feature } from "topojson-client";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import paises from "world-atlas/countries-50m.json";
import { cena, COR, rampa } from "./timeline";

type P = [number, number];

const projecao = geoMercator().scale(306).translate([960, 540]);
const caminho = geoPath(projecao);
const px = (lonLat: P) => projecao(lonLat) as P;

const mundo = feature(
  paises as unknown as Topology,
  (paises as unknown as Topology).objects.countries as GeometryObject,
) as unknown as GeoJSON.FeatureCollection;
const dTerra = caminho(mundo) ?? "";
const dPanama = caminho(mundo.features.find((f) => f.id === "591") as GeoJSON.Feature) ?? "";

// Catmull-Rom: curva suave passando pelos pontos, já como polilinha para fatiar por progresso.
const suavizar = (lonLats: P[]): P[] => {
  const p = lonLats.map(px);
  const out: P[] = [];
  for (let i = 0; i < p.length - 1; i++) {
    const [a, b, c, d] = [p[Math.max(i - 1, 0)], p[i], p[i + 1], p[Math.min(i + 2, p.length - 1)]];
    for (let s = 0; s < 14; s++) {
      const t = s / 14;
      const eixo = (k: 0 | 1) =>
        0.5 *
        (2 * b[k] +
          (c[k] - a[k]) * t +
          (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t +
          (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t * t * t);
      out.push([eixo(0), eixo(1)]);
    }
  }
  out.push(p[p.length - 1]);
  return out;
};

// shortcut: rotas ilustrativas traçadas à mão, não são derrotas reais de navegação.
const NOVA_YORK: P = [-74, 40.5];
const SAO_FRANCISCO: P = [-122.5, 37.7];
const ROTA_CABO = suavizar([
  NOVA_YORK, [-70, 33], [-62, 20], [-52, 10], [-40, 3], [-32, -5], [-35, -15], [-38, -24], [-47, -33],
  [-56, -42], [-62, -52], [-66, -57.5], [-75, -55], [-78, -44], [-76, -30], [-74, -17], [-83, -5],
  [-92, 6], [-105, 17], [-116, 28], SAO_FRANCISCO,
]);
const ROTA_CANAL = suavizar([
  NOVA_YORK, [-73, 33], [-73.5, 24], [-74.5, 19], [-77, 14], [-79.9, 9.6], [-79.65, 9.1], [-79.5, 8.3],
  [-85, 7.5], [-95, 12.5], [-107, 20], [-116, 29], SAO_FRANCISCO,
]);
const CANAL = suavizar([[-79.92, 9.38], [-79.92, 9.26], [-79.8, 9.15], [-79.67, 9.1], [-79.58, 8.95]]);

const d = (pts: P[]) => "M" + pts.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join("L");
const fatia = (pts: P[], t: number) => pts.slice(0, Math.max(2, Math.round(t * (pts.length - 1)) + 1));

const VISTA = {
  americas: { c: [-82, -16] as P, z: 1.2 },
  panama: { c: [-79.8, 9.15] as P, z: 34 },
};

const gancho = cena("gancho");
const rota = cena("rota");
const custo = cena("custo");
const fim = cena("fim");

// Quadros-chave da câmera no tempo global do vídeo.
const CAMERA: { f: number; v: { c: P; z: number } }[] = [
  { f: 0, v: VISTA.americas },
  { f: gancho.falas[1].de + 20, v: VISTA.panama },
  { f: rota.inicio + rota.falas[1].de - 6, v: VISTA.panama },
  { f: rota.inicio + rota.falas[1].de + 40, v: VISTA.americas },
  { f: custo.inicio, v: VISTA.americas },
  { f: custo.inicio + 50, v: VISTA.panama },
  { f: fim.inicio + fim.falas[3].de, v: VISTA.panama },
  { f: fim.inicio + fim.falas[3].de + 70, v: VISTA.americas },
];

const suave = Easing.bezier(0.65, 0, 0.35, 1);

const camera = (frame: number) => {
  const fs = CAMERA.map((k) => k.f);
  const c = CAMERA.map((k) => px(k.v.c));
  const opts = { easing: suave, extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Zoom em escala logarítmica mantém a velocidade aparente constante.
  const z = Math.exp(interpolate(frame, fs, CAMERA.map((k) => Math.log(k.v.z)), opts));
  const x = interpolate(frame, fs, c.map((q) => q[0]), opts);
  const y = interpolate(frame, fs, c.map((q) => q[1]), opts);
  return { x, y, z };
};

const Linha = ({ pts, cor, largura, opacity = 1 }: { pts: P[]; cor: string; largura: number; opacity?: number }) => (
  <path d={d(pts)} fill="none" stroke={cor} strokeWidth={largura} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} vectorEffect="non-scaling-stroke" />
);

export const Mapa = () => {
  const frame = useCurrentFrame();
  const { x, y, z } = camera(frame);

  const relRota = frame - rota.inicio;
  const cabo = rampa(relRota, rota.falas[1].de + 40, rota.falas[2].de + rota.falas[2].duracao, [0, 1], suave);
  const direto = rampa(relRota, rota.falas[3].de + 25, rota.falas[3].de + rota.falas[3].duracao, [0, 1], suave);
  const saiRotas = rampa(frame, custo.inicio - 4, custo.inicio + 12, [1, 0]);
  const canal = rampa(frame, gancho.falas[1].de + 30, gancho.falas[1].de + 95, [0, 1], suave);

  const fimDe = (pts: P[]) => pts[pts.length - 1];
  const pontoCabo = fimDe(fatia(ROTA_CABO, cabo));
  const pontoDireto = fimDe(fatia(ROTA_CANAL, direto));

  return (
    <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: COR.oceano }}>
      <g transform={`translate(960 540) scale(${z}) translate(${-x} ${-y})`}>
        <path d={dTerra} fill={COR.terra} stroke={COR.borda} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <path d={dPanama} fill="#3A5570" stroke={COR.ouro} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        <Linha pts={fatia(CANAL, canal)} cor={COR.ouro} largura={9} opacity={canal > 0 ? 1 : 0} />
        {cabo > 0 && saiRotas > 0 ? (
          <g opacity={saiRotas}>
            <Linha pts={fatia(ROTA_CABO, cabo)} cor={COR.vermelho} largura={5} opacity={direto > 0 ? 0.45 : 1} />
            <circle cx={pontoCabo[0]} cy={pontoCabo[1]} r={9 / z} fill="#fff" />
            {direto > 0 ? (
              <>
                <Linha pts={fatia(ROTA_CANAL, direto)} cor={COR.ouro} largura={6} />
                <circle cx={pontoDireto[0]} cy={pontoDireto[1]} r={9 / z} fill="#fff" />
              </>
            ) : null}
          </g>
        ) : null}
      </g>
    </svg>
  );
};

/** Posição em tela de um ponto do mapa no quadro atual, para rótulos que acompanham a câmera. */
export const naTela = (frame: number, lonLat: P): P => {
  const { x, y, z } = camera(frame);
  const [qx, qy] = px(lonLat);
  return [960 + (qx - x) * z, 540 + (qy - y) * z];
};
