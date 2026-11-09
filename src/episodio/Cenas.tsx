import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { random } from "remotion";
import { BanheiroCasa, BanheiroEscola, Bloco, Corredor, Patio, Quintal, SalaDeAula } from "./Cenarios";
import { Adulto, Bebe, Humor, Monstro, Pato, Privada } from "./Personagens";
import { lerpV, mix, Quem, useCena, V3 } from "./timeline";

type Plano = { pos: V3; alvo: V3 };
type Ator = { p: V3; alt: number; dist: number };
const BEBE = { alt: 1.15, dist: 5.2 };
const ADULTO = { alt: 3.15, dist: 5.6 };
const MONSTRO = { alt: 2.2, dist: 7.2 };

/**
 * Cartoon-style editing: cuts to whoever is speaking, wide shot for the narrator.
 * `planos` overrides the shot of specific lines, by line index.
 */
const Diretor = ({
  geral,
  atores,
  planos = {},
}: {
  geral: Plano;
  atores: Partial<Record<Quem, Ator>>;
  planos?: Record<number, Plano>;
}) => {
  const camera = useThree((s) => s.camera);
  const { frame, atual, cena } = useCena();
  const n = atual ? cena.falas.indexOf(atual) : -1;
  const ator = atual ? atores[atual.quem] : undefined;
  let plano = planos[n] ?? geral;
  if (!planos[n] && ator) {
    const alvo: V3 = [ator.p[0], ator.p[1] + ator.alt, ator.p[2]];
    const dx = geral.pos[0] - alvo[0];
    const dz = geral.pos[2] - alvo[2];
    const len = Math.hypot(dx, dz) || 1;
    // Slight side angle alternating by line, so consecutive close-ups do not look identical.
    const lado = n % 2 ? 0.28 : -0.28;
    plano = {
      alvo,
      pos: [alvo[0] + (dx / len + lado) * ator.dist, alvo[1] + 0.25, alvo[2] + (dz / len) * ator.dist],
    };
  }
  const dt = atual ? frame - atual.de : frame;
  const empurra = Math.min(dt / 240, 1) * 0.07;
  const pos = lerpV(empurra, plano.pos, plano.alvo);
  useLayoutEffect(() => {
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(plano.alvo[0], plano.alvo[1], plano.alvo[2]);
  });
  return null;
};

const salto = (frame: number, v: number, altura: number) => Math.abs(Math.sin(frame * v)) * altura;

export const Abertura = () => {
  const { frame } = useCena();
  const tommy: V3 = [-1.05, 0, 0];
  const nico: V3 = [1.05, 0, 0.2];
  return (
    <>
      <Corredor velocidade={0.38} />
      <Bebe quem="tommy" p={tommy} humor="chorando" anda={0.72} corrida={1} />
      <Bebe quem="nico" p={nico} humor="assustado" anda={0.72} corrida={1} />
      <Monstro p={[0, 0, -7]} pulo={salto(frame, 0.17, 1.5)} abre={0.7} />
      <Diretor
        geral={{ pos: [0, 2.2, 8.5], alvo: [0, 1.9, -3] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE } }}
      />
    </>
  );
};

export const CenaBanheiro = () => {
  const { frame, at, fim } = useCena();
  const descarga = at(3) + 25;
  const vaiAoVaso = mix(frame, [at(3) - 18, at(3) + 10], [0, 1]) * mix(frame, [descarga + 15, descarga + 40], [1, 0]);
  const tommy = lerpV(vaiAoVaso, [-1.9, 0, -1.3], [-1.2, 0, -3.3]);
  const nico: V3 = [1.9, 0, -1.2];
  const agua = mix(frame, [at(5) + 55, fim(7)], [0, 0.62]);
  const medo = frame > at(5) + 25;
  const paiEntra = mix(frame, [at(7) - 14, at(7) + 18], [0, 1]);
  const pai = lerpV(paiEntra, [4.4, 0, -6.6], [3.5, 0, -3.5]);
  const humorBebe: Humor = medo ? "assustado" : "feliz";

  const caiu = mix(frame, [at(1) + 26, at(1) + 45], [0, 1]);
  const gira = mix(frame, [descarga, descarga + 42], [0, 1]);
  const patoPos: V3 = caiu < 1
    ? lerpV(caiu, [-1.2, 1.35, -1.1], [0, 0.95, -3.9])
    : [Math.cos(gira * 16) * 0.32 * (1 - gira), 0.88 - gira * 0.4, -3.9 + Math.sin(gira * 16) * 0.32 * (1 - gira)];

  return (
    <>
      <BanheiroCasa agua={agua} />
      <Privada p={[0, 0, -3.9]} tampa={1} />
      {gira < 1 ? <Pato p={patoPos} escala={1 - gira * 0.7} rot={[0, gira * 22, 0]} /> : null}
      <Bebe quem="tommy" p={[tommy[0], tommy[1] + agua * 0.35, tommy[2]]} giro={vaiAoVaso > 0.5 ? 1 : 0.35} humor={humorBebe} bracos={frame > at(1) && frame < at(1) + 32 ? 0.5 : medo ? 1 : 0} anda={vaiAoVaso > 0 && vaiAoVaso < 1 ? 0.45 : 0} />
      <Bebe quem="nico" p={[nico[0], agua * 0.35, nico[2]]} giro={-0.35} humor={humorBebe} bracos={frame > at(2) && frame < fim(2) ? 0.85 : medo ? 1 : 0} />
      {paiEntra > 0 ? <Adulto quem="pai" p={pai} giro={-0.35} anda={paiEntra < 1 ? 0.3 : 0} aponta={paiEntra} /> : null}
      <Diretor
        geral={{ pos: [0, 3.4, 8.5], alvo: [0, 1.5, -2.6] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, pai: { p: pai, ...ADULTO } }}
        planos={{ 3: { pos: [0.1, 2.7, 1], alvo: [-0.3, 1, -3.9] } }}
      />
    </>
  );
};

export const CenaExpulsos = () => {
  const { frame, at, fim } = useCena();
  const sai = mix(frame, [at(0) + 8, fim(0) - 6], [0, 1]);
  const tommy = lerpV(sai, [-0.75, 0, -3], [-1.5, 0, 2.2]);
  const nico = lerpV(sai, [0.75, 0, -3], [1.5, 0, 2.2]);
  const volta = mix(frame, [at(2) - 2, at(2) + 18], [0, 1]);
  const pai: V3 = lerpV(volta, [0, 0, -1.4], [0, 0, -4.2]);
  const porta = mix(frame, [at(2) + 18, at(2) + 25], [1, 0]);
  const andando = sai > 0 && sai < 1;
  return (
    <>
      <Quintal porta={porta} />
      {porta > 0 ? (
        <Adulto quem="pai" p={pai} giro={volta > 0 ? Math.PI : 0} aponta={frame > at(0) && volta === 0 ? 1 : 0} anda={volta > 0 && volta < 1 ? 0.3 : 0} />
      ) : null}
      <Bebe quem="tommy" p={tommy} humor={frame > at(2) + 25 ? "chorando" : "triste"} anda={andando ? 0.32 : 0} />
      <Bebe quem="nico" p={nico} humor={frame > at(4) ? "feliz" : "triste"} anda={andando ? 0.32 : 0} bracos={frame > at(4) + 18 ? 1 : 0} giro={frame > at(4) ? -0.3 : 0} />
      <Diretor
        geral={{ pos: [0, 3.2, 13], alvo: [0, 2.5, -3] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, pai: { p: pai, ...ADULTO } }}
        planos={{ 2: { pos: [0, 3, 3.6], alvo: [0, 2.2, -3.5] } }}
      />
    </>
  );
};

export const CenaEscola = () => {
  const { frame, at, fim } = useCena();
  const entra = mix(frame, [at(0), fim(0) + 10], [0, 1]);
  const vaiParede = mix(frame, [at(5) - 10, at(5) + 35], [0, 1]);
  const tommy = lerpV(vaiParede, lerpV(entra, [-8, 0, 5.8], [-2.1, 0, 4.3]), [4.6, 0, 1.3]);
  const nico = lerpV(vaiParede, lerpV(entra, [-9.4, 0, 4.8], [-3.4, 0, 3.2]), [6.1, 0, 0.3]);
  // Step back from the falling bricks.
  const recua = mix(frame, [fim(6) - 60, fim(6) - 30], [0, 1]);
  tommy[0] -= recua * 1.7;
  tommy[2] += recua * 0.8;
  nico[0] -= recua * 1.9;
  nico[2] += recua * 1.6;
  const bate = frame >= at(2) + 34 && frame < at(2) + 46;
  const socos = frame > at(6) && frame < fim(6) - 18 ? Math.abs(Math.sin((frame - at(6)) * 0.28)) : 0;
  const queda = mix(frame, [fim(6) - 46, fim(6) + 12], [0, 1]);
  const profEntra = mix(frame, [at(3) - 26, at(3) + 8], [0, 1]);
  const profSai = mix(frame, [at(4) + 6, fim(4) - 8], [0, 1]);
  const prof = lerpV(profSai, lerpV(profEntra, [-11, 0, -4], [-1.2, 0, -3.1]), [-11, 0, -4]);
  const flagra = frame > at(3) && vaiParede === 0;
  const engatinhando = entra < 1;
  const virado = vaiParede > 0 ? Math.PI / 2 : engatinhando ? Math.PI / 2 : 0;

  return (
    <>
      <SalaDeAula queda={queda} tremor={socos} />
      {profEntra > 0 && profSai < 1 ? (
        <Adulto quem="professora" p={prof} giro={profSai > 0 ? -Math.PI / 2 : profEntra < 1 ? Math.PI / 2 : 0.2} anda={(profEntra > 0 && profEntra < 1) || (profSai > 0 && profSai < 1) ? 0.3 : 0} aponta={frame > at(3) + 8 && frame < at(4) ? 1 : 0} />
      ) : null}
      <Bebe
        quem="tommy"
        p={tommy}
        giro={frame > at(7) ? 0.3 : vaiParede === 1 && frame < at(6) ? 0.7 : virado}
        engatinha={engatinhando}
        anda={engatinhando ? 0.32 : vaiParede > 0 && vaiParede < 1 ? 0.6 : 0}
        segredo={frame > at(1) && frame < fim(1) + 6}
        humor={queda > 0.5 ? "feliz" : flagra ? "assustado" : frame > at(1) ? "neutro" : "feliz"}
        bracos={queda > 0.7 ? 1 : 0}
      />
      <Bebe
        quem="nico"
        p={[nico[0] + socos * 0.5, nico[1] + (bate ? 0.28 : 0) + socos * 0.2, nico[2]]}
        giro={vaiParede === 1 && frame < at(6) ? -0.5 : frame > at(7) ? -0.3 : virado}
        engatinha={engatinhando}
        anda={engatinhando ? 0.32 : vaiParede > 0 && vaiParede < 1 ? 0.6 : 0}
        humor={queda > 0.5 ? "feliz" : flagra || bate ? "assustado" : "neutro"}
        inclina={socos * 0.5}
      />
      <Diretor
        geral={{ pos: [-1.5, 4.4, 14], alvo: [-0.6, 2, -1.5] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, professora: { p: prof, ...ADULTO } }}
        planos={{
          5: { pos: [3.2, 2.3, 7.6], alvo: [5.4, 1.2, 0.7] },
          6: { pos: [0.6, 3.2, 8.2], alvo: [6.2, 2.2, 0.3] },
          7: { pos: [-1.5, 2.3, 7.5], alvo: [4.4, 1.7, 1] },
        }}
      />
    </>
  );
};

export const CenaMonstro = () => {
  const { frame, at, fim } = useCena();
  const entra = mix(frame, [at(0), at(0) + 70], [0, 1]);
  const foge = mix(frame, [at(5) + 18, fim(5) + 15], [0, 1]);
  const tommy = lerpV(foge, lerpV(entra, [-10, 0, 2.2], [-1.2, 0, 1.2]), [-12, 0, 2.6]);
  const nico = lerpV(foge, lerpV(entra, [-11.3, 0, 1.2], [0.5, 0, 1]), [-13, 0, 1.4]);
  const tremor = frame > at(3) + 30 && frame < at(4) ? mix(frame, [at(3) + 30, at(4)], [0.012, 0.07]) : 0;
  const acorda = mix(frame, [fim(3) - 25, at(4) + 8], [0, 1]);
  const monstro: V3 = [3.9, 0, -3.8];
  const medo = frame > at(3) + 30;
  const correndo = (entra > 0 && entra < 1) || foge > 0;
  const giro = foge > 0 ? -Math.PI / 2 : entra < 1 ? Math.PI / 2 : medo ? 0.75 : 0;
  return (
    <>
      <BanheiroEscola brilho={mix(frame, [at(3), at(4)], [0, 1])} />
      <Privada p={[-3.95, 0, -4.2]} />
      <Privada p={[-0.45, 0, -4.2]} />
      <Monstro p={monstro} escala={1 + acorda * 0.45} acorda={acorda} tremor={tremor} pulo={frame > at(4) ? salto(frame, 0.2, 0.3) : 0} />
      <Bebe quem="tommy" p={tommy} giro={giro} humor={medo ? "assustado" : "neutro"} anda={correndo ? 0.7 : 0} corrida={foge > 0 ? 1 : 0} olhar={frame > at(1) && !medo ? 0.04 : 0} bracos={frame > at(4) + 10 ? 1 : 0} />
      <Bebe quem="nico" p={nico} giro={giro} humor={medo ? "assustado" : "neutro"} anda={correndo ? 0.7 : 0} corrida={foge > 0 ? 1 : 0} bracos={frame > at(4) + 10 ? 1 : 0} />
      <Diretor
        geral={{ pos: [0, 3.2, 11.5], alvo: [0, 2, -2] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, monstro: { p: monstro, ...MONSTRO } }}
        planos={{
          3: { pos: [2.8, 2.6, 1.8], alvo: [3.9, 1.1, -3.8] },
          4: { pos: [4.7, 2.8, 3.4], alvo: [3.9, 2.3, -3.8] },
          5: { pos: [-3, 3, 11.5], alvo: [-3, 1.6, 0] },
        }}
      />
    </>
  );
};

const GOTAS = new Array(14).fill(true).map((_, i) => ({
  x: (random(`gota-x-${i}`) - 0.5) * 2,
  z: random(`gota-z-${i}`) - 0.5,
  fase: random(`gota-f-${i}`),
  alt: 2 + random(`gota-a-${i}`) * 2,
}));

export const CenaFuga = () => {
  const { frame, at } = useCena();
  const desvio = frame > at(2) && frame < at(3) ? Math.sin((frame - at(2)) * 0.09) * 2 : 0;
  const tommy: V3 = [-1.2 + desvio, 0, 0.3];
  const nico: V3 = [1.2 + desvio * 0.7, 0, 0];
  const perto = mix(frame, [at(0), at(4)], [-9, -4.8]);
  const monstro: V3 = [0, 0, perto];
  const pulo = salto(frame, 0.2, 1.7);
  return (
    <>
      <Corredor velocidade={0.46} />
      <Bebe quem="tommy" p={tommy} humor="assustado" anda={0.8} corrida={1} />
      <Bebe quem="nico" p={nico} humor={frame > at(4) ? "feliz" : "chorando"} anda={0.8} corrida={1} />
      <Monstro p={monstro} pulo={pulo} abre={0.8} escala={1.6} />
      {GOTAS.map((g, i) => {
        const t = (frame / 34 + g.fase) % 1;
        return (
          <mesh key={i} position={[g.x * (1 + t * 3), pulo * 1.2 + 1 + g.alt * 4 * t * (1 - t), perto + 0.8 + t * 3 + g.z]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <meshStandardMaterial color="#69D2F5" roughness={0.1} transparent opacity={0.85} />
          </mesh>
        );
      })}
      <Diretor
        geral={{ pos: [0, 2.3, 8], alvo: [0, 1.9, -3] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE } }}
        planos={{ 3: { pos: [3.6, 1, 0.5], alvo: [0, 2.7, -6] } }}
      />
    </>
  );
};

const COLUNAS = 13;
const LINHAS = 5;
const TIJOLOS = new Array(COLUNAS * LINHAS).fill(true).map((_, i) => {
  const col = i % COLUNAS;
  const lin = Math.floor(i / COLUNAS);
  return {
    i,
    p: [(col - 6) * 0.82 + (lin % 2 ? 0.2 : -0.2), 0.26 + lin * 0.5, -0.2 + (random(`m-z-${i}`) - 0.5) * 0.12] as V3,
    torto: (random(`m-r-${i}`) - 0.5) * 0.16,
    cor: random(`m-c-${i}`) > 0.5 ? "#C85A3A" : "#B44B30",
    dx: (col - 6) * 0.65 + (random(`m-dx-${i}`) - 0.5) * 3,
    dz: 1 + random(`m-dz-${i}`) * 4,
    altura: 3 + random(`m-h-${i}`) * 4,
    giro: random(`m-g-${i}`) * 8,
  };
});

const Muralha = ({ progresso, explode }: { progresso: number; explode: number }) => (
  <>
    {TIJOLOS.map((b) => {
      const cai = mix(progresso * TIJOLOS.length, [b.i, b.i + 3.5], [0, 1]);
      if (cai === 0) return null;
      const t = mix(explode, [0, 1], [0, 1]);
      const y = b.p[1] + (1 - cai) * 5;
      const voando = Math.max(0.26, y + b.altura * 4 * t * (1 - t) - (y - 0.26) * t);
      return (
        <Bloco
          key={b.i}
          p={[b.p[0] + b.dx * t, voando, b.p[2] + b.dz * t]}
          s={[0.78, 0.46, 0.58]}
          c={b.cor}
          rot={[b.giro * t, b.giro * t * 0.6, b.torto + b.giro * t * 0.4]}
        />
      );
    })}
  </>
);

export const CenaForte = () => {
  const { frame, at, fim } = useCena();
  const progresso = mix(frame, [at(0) + 15, fim(1) + 5], [0, 1]);
  const construindo = progresso > 0 && progresso < 1;
  const chega = mix(frame, [at(3), at(3) + 65], [0, 1]);
  const pouso = at(3) + 85;
  const explode = mix(frame, [pouso, pouso + 30], [0, 1]);
  const avanca = mix(frame, [pouso, pouso + 20], [0, 1]);
  const monstro = lerpV(avanca, lerpV(chega, [0, 0, -18], [0, 0, -3.3]), [0, 0, 0.1]);
  const pulao = frame >= at(3) + 60 && frame <= pouso ? Math.sin(((frame - (at(3) + 60)) / (pouso - at(3) - 60)) * Math.PI) * 4.4 : 0;
  const ploc = fim(7) - 42;
  const panelada = frame > ploc - 15 && frame < ploc + 3;
  const alivio = frame > ploc;
  const puloMonstro = pulao || (chega > 0 && chega < 1 ? salto(frame, 0.24, 1.3) : alivio ? salto(frame, 0.18, 0.5) : 0);
  const tommyAfasta = mix(frame, [pouso, pouso + 18], [0, 1]);
  const vaiBater = mix(frame, [at(7) - 6, at(7) + 30], [0, 1]) * mix(frame, [ploc + 20, ploc + 50], [1, 0]);
  const trabalho = construindo ? Math.sin(frame * 0.09) * 1.3 : 0;
  const tommy = lerpV(tommyAfasta, [-1.9 + trabalho, 0, 2.2], [-3.2, 0, 4]);
  const nico = lerpV(vaiBater, lerpV(tommyAfasta, [1.9 - trabalho, 0, 2.2], [3.2, 0, 4]), [1.7, 0, -1.2]);
  const voo = mix(frame, [ploc, ploc + 38], [0, 1]);
  const pato = lerpV(voo, [0, 2.5, 0.4], [-2.2, 0, 3.6]);
  pato[1] += voo < 1 ? 5 * 4 * voo * (1 - voo) * 0.5 : 0;
  const humorT: Humor = frame > at(5) ? "feliz" : frame > at(3) ? "assustado" : "neutro";
  const humorN: Humor = frame > at(5) ? "feliz" : frame > at(3) ? "assustado" : "feliz";
  return (
    <>
      <Patio />
      <Muralha progresso={progresso} explode={explode} />
      <Monstro p={monstro} pulo={puloMonstro} feliz={alivio} tremor={panelada ? 0.05 : 0} />
      {voo > 0 ? <Pato p={pato} escala={1.5} rot={[voo * 9, voo * 7, 0]} /> : null}
      <Bebe quem="tommy" p={tommy} humor={humorT} anda={construindo ? 0.45 : 0} bracos={frame > ploc ? 1 : frame > at(3) ? 0.8 : 0} giro={construindo ? 0 : 0.2} />
      <Bebe quem="nico" p={[nico[0], panelada ? 0.5 : 0, nico[2]]} humor={humorN} anda={construindo || (vaiBater > 0 && vaiBater < 1) ? 0.45 : 0} bracos={panelada || frame > ploc ? 1 : 0} giro={vaiBater > 0 && vaiBater < 1 ? Math.PI : vaiBater === 1 ? -1.3 : -0.2} />
      <Diretor
        geral={{ pos: [0, 3.6, 13], alvo: [0, 2, -1] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, monstro: { p: monstro, alt: 3, dist: 6.4 } }}
        planos={{ 7: { pos: [3.5, 2.8, 8.6], alvo: [0.5, 1.9, 0] } }}
      />
    </>
  );
};

export const CenaFinal = () => {
  const { frame, at, fim } = useCena();
  const chega = mix(frame, [at(0), fim(0) - 15], [0, 1]);
  const monstroBase = lerpV(chega, [12, 0, 1], [4.4, 0, 0.4]);
  const pulo = chega > 0 && chega < 1 ? salto(frame, 0.2, 1.1) : salto(frame, 0.08, 0.14);
  const desce = mix(frame, [fim(0) - 12, fim(0) + 6], [0, 1]);
  const alto = 1.75 + pulo;
  const tommy = lerpV(desce, [monstroBase[0] - 0.5, alto, monstroBase[2] + 0.4], [-2.3, 0, 2.2]);
  const nico = lerpV(desce, [monstroBase[0] + 0.5, alto, monstroBase[2] + 0.4], [2.1, 0, 2.2]);
  const arco = Math.sin(desce * Math.PI) * 1.1;
  const pai: V3 = [0, 0, -1.7];
  const tchau = frame > at(4) + 20;
  const paiSai = frame > at(1) - 12;
  return (
    <>
      <Quintal porta={1} ceu="#FFB27A" grama="#70A84C" sol={2.6} corSol="#FFD9AE" />
      {paiSai ? <Adulto quem="pai" p={pai} humor="feliz" /> : null}
      <Monstro p={monstroBase} feliz pulo={pulo} giro={-0.25} />
      <Pato p={[-3.6, 0, 1.6]} escala={1.5} />
      <Bebe quem="tommy" p={[tommy[0], tommy[1] + arco, tommy[2]]} humor="feliz" bracos={desce < 1 ? 1 : tchau ? 1 : 0} />
      <Bebe quem="nico" p={[nico[0], nico[1] + arco, nico[2]]} humor="feliz" bracos={desce < 1 ? 1 : tchau ? 1 : 0} giro={desce === 1 ? -0.2 : 0} />
      <Diretor
        geral={{ pos: [1, 3.3, 13], alvo: [1, 2.4, -2] }}
        atores={{ tommy: { p: tommy, ...BEBE }, nico: { p: nico, ...BEBE }, pai: { p: pai, ...ADULTO } }}
      />
    </>
  );
};
