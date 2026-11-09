import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { naTela } from "./Mapa";
import { Cena, COR, rampa } from "./timeline";

const { fontFamily: titulo } = loadOswald("normal", { weights: ["600"], subsets: ["latin"] });
export const { fontFamily: corpo } = loadInter("normal", { weights: ["500", "700"], subsets: ["latin"] });

export const brl = (n: number) => Math.round(n).toLocaleString("pt-BR");
export const sobe = Easing.out(Easing.cubic);

export const Numero = ({ children, cor = COR.texto, size = 150, style }: { children: ReactNode; cor?: string; size?: number; style?: CSSProperties }) => (
  <div style={{ fontFamily: titulo, fontWeight: 600, fontSize: size, lineHeight: 1, color: cor, fontVariantNumeric: "tabular-nums", textShadow: "0 6px 40px rgba(0,0,0,.65)", ...style }}>
    {children}
  </div>
);

export const Rotulo = ({ children, cor = COR.apagado, size = 36, style }: { children: ReactNode; cor?: string; size?: number; style?: CSSProperties }) => (
  <div style={{ fontFamily: corpo, fontWeight: 500, fontSize: size, color: cor, textShadow: "0 2px 18px rgba(0,0,0,.8)", ...style }}>{children}</div>
);

export const Entra = ({ de, ate = Infinity, children, style }: { de: number; ate?: number; children: ReactNode; style?: CSSProperties }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - de, fps, config: { damping: 18, stiffness: 110 } });
  const sai = ate === Infinity ? 1 : rampa(frame, ate, ate + 12, [1, 0]);
  return <div style={{ opacity: Math.min(t, sai), translate: `0 ${(1 - t) * 34}px`, ...style }}>{children}</div>;
};

const Marcador = ({ c, lonLat, children, de, ate, dx = 0, dy = 0 }: { c: Cena; lonLat: [number, number]; children: ReactNode; de: number; ate: number; dx?: number; dy?: number }) => {
  const frame = useCurrentFrame();
  // O frame é local da cena, mas a câmera do mapa usa o tempo global.
  const [x, y] = naTela(frame + c.inicio, lonLat);
  return (
    <div style={{ position: "absolute", left: x + dx, top: y + dy, translate: "-50% -50%", opacity: Math.min(rampa(frame, de, de + 12), rampa(frame, ate, ate + 10, [1, 0])), whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

const de = (c: Cena) => ({
  at: (n: number) => c.falas[n].de,
  fim: (n: number) => c.falas[n].de + c.falas[n].duracao,
});

const Painel = ({ children, opacity = 1 }: { children: ReactNode; opacity?: number }) => (
  <AbsoluteFill style={{ backgroundColor: COR.oceano, opacity }}>{children}</AbsoluteFill>
);

export const Gancho: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const valor = interpolate(frame, [at(0) + 10, fim(0) - 20], [0, 3975000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: sobe });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <Entra de={at(0)} ate={at(1) + 10}>
          <Numero cor={COR.ouro} size={190}>US$ {brl(valor)}</Numero>
          <Rotulo style={{ textAlign: "center", marginTop: 18 }}>recorde pago por uma única vaga, em 2023</Rotulo>
        </Entra>
      </AbsoluteFill>
      <Marcador c={c} lonLat={[-79.75, 9.15]} de={at(1) + 80} ate={at(2)} dx={200} dy={-70}>
        <Numero cor={COR.ouro} size={110}>80 km</Numero>
      </Marcador>
      <Marcador c={c} lonLat={[-80.6, 10.2]} de={at(1) + 30} ate={at(2) + 200}>
        <Rotulo size={34}>Mar do Caribe</Rotulo>
      </Marcador>
      <Marcador c={c} lonLat={[-79.3, 7.55]} de={at(1) + 30} ate={at(2) + 200}>
        <Rotulo size={34}>Oceano Pacífico</Rotulo>
      </Marcador>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Entra de={at(2) + 40}>
          <Numero size={130} style={{ background: "rgba(10,24,38,.82)", padding: "18px 48px", borderRadius: 14 }}>
            FALTA DE <span style={{ color: COR.agua }}>CHUVA</span>
          </Numero>
        </Entra>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const BarraKm = ({ nome, km, t, cor, max = 22500 }: { nome: string; km: number; t: number; cor: string; max?: number }) => (
  <div style={{ width: 560 }}>
    <Rotulo size={30} cor={COR.texto}>{nome}</Rotulo>
    <Numero size={84} cor={cor} style={{ margin: "4px 0 10px" }}>{brl(km * t)} km</Numero>
    <div style={{ height: 12, borderRadius: 6, background: "rgba(255,255,255,.12)" }}>
      <div style={{ height: 12, borderRadius: 6, width: `${(km / max) * t * 100}%`, background: cor }} />
    </div>
  </div>
);

export const Rota: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const cabo = rampa(frame, at(1) + 40, fim(2), [0, 1], Easing.bezier(0.65, 0, 0.35, 1));
  const direto = rampa(frame, at(3) + 25, fim(3), [0, 1], Easing.bezier(0.65, 0, 0.35, 1));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 130 }}>
        <Entra de={at(0)} ate={at(1) - 6}>
          <Numero size={120} style={{ background: "rgba(10,24,38,.82)", padding: "14px 44px", borderRadius: 14 }}>CANAL DO PANAMÁ</Numero>
        </Entra>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 300, display: "flex", flexDirection: "column", gap: 60 }}>
        <Entra de={at(1) + 40}><BarraKm nome="Contornando a América do Sul" km={22500} t={cabo} cor={COR.vermelho} /></Entra>
        <Entra de={at(3) + 20}><BarraKm nome="Pelo canal, desde 1914" km={9500} t={direto} cor={COR.ouro} /></Entra>
      </div>
      <Marcador c={c} lonLat={[-74, 40.5]} de={at(1) + 40} ate={c.duracao} dx={120} dy={-26}><Rotulo cor={COR.texto} size={32}>Nova York</Rotulo></Marcador>
      <Marcador c={c} lonLat={[-122.5, 37.7]} de={at(1) + 40} ate={c.duracao} dx={-30} dy={-40}><Rotulo cor={COR.texto} size={32}>São Francisco</Rotulo></Marcador>
    </AbsoluteFill>
  );
};

export const Custo: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const pontos = 250; // cada ponto representa 100 trabalhadores
  const acesos = rampa(frame, at(1) + 20, fim(1) - 30, [0, pontos], Easing.inOut(Easing.quad));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(4,10,16,.78)", opacity: rampa(frame, at(0), at(0) + 30) }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
        <Entra de={at(1)}>
          <Numero size={200} cor={COR.texto} style={{ textAlign: "center" }}>≈ {brl((acesos / pontos) * 25000)}</Numero>
          <Rotulo size={38} style={{ textAlign: "center", marginTop: 8 }}>trabalhadores mortos · estimativa, obras francesa e americana</Rotulo>
        </Entra>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(50, 22px)", gap: 8 }}>
          {Array.from({ length: pontos }, (_, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: i < acesos ? COR.vermelho : "rgba(255,255,255,.08)" }} />
          ))}
        </div>
        <Rotulo size={26}>cada ponto = 100 pessoas</Rotulo>
        <Entra de={at(2)}>
          <Rotulo size={42} cor={COR.texto}>Malária · Febre amarela</Rotulo>
        </Entra>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Perfil lateral do canal: degraus em escala ilustrativa.
const MAR = 760;
const METRO = 13;
const PROFUNDIDADE = 44;
const nivel = (m: number) => MAR - m * METRO;
const DEGRAUS = [
  { x: 0, w: 470, m: 0 },
  { x: 470, w: 90, m: 8.67 },
  { x: 560, w: 90, m: 17.33 },
  { x: 650, w: 620, m: 26 },
  { x: 1270, w: 90, m: 17.33 },
  { x: 1360, w: 90, m: 8.67 },
  { x: 1450, w: 470, m: 0 },
];

const alturaEm = (x: number) => {
  const i = DEGRAUS.findIndex((g) => x < g.x + g.w);
  const g = DEGRAUS[i === -1 ? DEGRAUS.length - 1 : i];
  return g.m;
};

const Navio = ({ x, y, escala = 1, opacity = 1 }: { x: number; y: number; escala?: number; opacity?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`} opacity={opacity}>
    <path d="M-62,-4 L62,-4 L48,22 L-50,22 Z" fill="#E8EDF1" />
    <rect x={-40} y={-24} width={58} height={20} fill={COR.vermelho} />
    <rect x={-40} y={-40} width={58} height={16} fill={COR.ouro} />
    <rect x={24} y={-22} width={22} height={18} fill="#B7C3CC" />
  </g>
);

const Chuva = ({ forca, x0 = 650, largura = 620, topo = 90, base = 400 }: { forca: number; x0?: number; largura?: number; topo?: number; base?: number }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 90 }, (_, i) => {
        const x = x0 + random(`x${i}`) * largura;
        const vel = 16 + random(`v${i}`) * 10;
        const y = topo + ((random(`y${i}`) * (base - topo) + frame * vel) % (base - topo));
        return <line key={i} x1={x} y1={y} x2={x - 3} y2={y + 22} stroke={COR.agua} strokeWidth={2.5} opacity={forca * 0.75} />;
      })}
    </>
  );
};

export const Eclusas: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const entra = rampa(frame, 0, 14);
  const xNavio = rampa(frame, at(0) + 30, fim(1) + 20, [150, 1760], Easing.bezier(0.45, 0, 0.55, 1));
  // Suaviza a subida do navio entre os degraus, simulando a câmara enchendo.
  const amostras = [-30, -15, 0, 15, 30].map((d) => alturaEm(xNavio + d));
  const m = amostras.reduce((a, b) => a + b, 0) / amostras.length;
  const fluxo = rampa(frame, at(2), at(2) + 20) * rampa(frame, fim(2), fim(2) + 15, [1, 0]);
  const litros = rampa(frame, at(2) + 10, fim(2) - 15, [0, 200], sobe);
  return (
    <Painel opacity={entra}>
      <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0E2438" />
            <stop offset="1" stopColor="#14344C" />
          </linearGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ceu)" />
        {DEGRAUS.map((g) => (
          <g key={g.x}>
            <rect x={g.x} y={nivel(g.m)} width={g.w} height={PROFUNDIDADE} fill={COR.agua} />
            <rect x={g.x} y={nivel(g.m) + PROFUNDIDADE} width={g.w} height={1080 - nivel(g.m) - PROFUNDIDADE} fill={COR.solo} />
          </g>
        ))}
        {/* Muros das eclusas */}
        {DEGRAUS.slice(0, -1).map((g, i) => {
          const prox = DEGRAUS[i + 1];
          return <rect key={i} x={prox.x - 5} y={Math.min(nivel(g.m), nivel(prox.m)) - 8} width={10} height={Math.abs(nivel(g.m) - nivel(prox.m)) + PROFUNDIDADE + 8} fill="#C9D2D9" />;
        })}
        {fluxo > 0
          ? [0, 1].map((lado) =>
              Array.from({ length: 12 }, (_, i) => {
                const t = ((frame * 0.02 + i / 12) % 1);
                const x = lado === 0 ? 650 - t * 500 : 1270 + t * 500;
                const y = nivel(alturaEm(x)) - 8;
                return <circle key={`${lado}-${i}`} cx={x} cy={y} r={7} fill="#fff" opacity={fluxo * 0.9} />;
              }),
            )
          : null}
        <Chuva forca={rampa(frame, at(3), at(3) + 15)} />
        <Navio x={xNavio} y={nivel(m) - 16} />
      </svg>
      <div style={{ position: "absolute", left: 150, top: nivel(0) + 62 }}><Rotulo cor={COR.texto} size={34}>Atlântico · nível do mar</Rotulo></div>
      <div style={{ position: "absolute", right: 150, top: nivel(0) + 62 }}><Rotulo cor={COR.texto} size={34}>Pacífico · nível do mar</Rotulo></div>
      <div style={{ position: "absolute", left: 650, width: 620, top: nivel(26) + 62, textAlign: "center" }}><Rotulo cor={COR.texto} size={40} style={{ fontWeight: 700 }}>Lago Gatún</Rotulo></div>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
        <Entra de={at(0)} ate={at(1) + 30}><Numero size={110}>O CANAL NÃO É PLANO</Numero></Entra>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 200 }}>
        <Entra de={at(1) + 45}><Numero size={120} cor={COR.ouro}>+26 m</Numero></Entra>
      </div>
      <div style={{ position: "absolute", right: 80, top: 130, textAlign: "right" }}>
        <Entra de={at(2)}>
          <Numero size={120} cor={COR.agua}>{Math.round(litros)} milhões</Numero>
          <Rotulo cor={COR.texto} size={34}>de litros de água doce por travessia</Rotulo>
        </Entra>
      </div>
      <div style={{ position: "absolute", left: 40, bottom: 190 }}><Rotulo size={22}>Escala ilustrativa</Rotulo></div>
    </Painel>
  );
};

export const Seca: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const entra = rampa(frame, 0, 14);
  const lago = rampa(frame, at(0) + 10, at(1) + 50, [1, 0.55], Easing.inOut(Easing.quad));
  const cortados = Math.round(rampa(frame, at(1) + 60, fim(1) - 10, [0, 12]));
  const preco = rampa(frame, at(2) + 40, fim(2) - 5, [0, 3975000], sobe);
  return (
    <Painel opacity={entra}>
      <div style={{ position: "absolute", left: 110, top: 140, width: 320 }}>
        <Entra de={at(0)}>
          <Rotulo cor={COR.texto} size={34} style={{ marginBottom: 16 }}>Nível do lago</Rotulo>
          <div style={{ position: "relative", height: 620, borderRadius: 12, border: `3px solid ${COR.borda}`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${lago * 92}%`, background: `linear-gradient(${COR.agua}, ${COR.aguaEscura})` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: "8%", borderTop: `3px dashed ${COR.apagado}` }} />
          </div>
          <Rotulo size={24} style={{ marginTop: 12 }}>Ilustrativo</Rotulo>
        </Entra>
      </div>
      <div style={{ position: "absolute", left: 540, right: 110, top: 140 }}>
        <Entra de={at(1)}>
          <Rotulo cor={COR.texto} size={34}>Navios por dia</Rotulo>
          <div style={{ display: "flex", alignItems: "baseline", gap: 26, margin: "4px 0 20px" }}>
            <Numero size={130}>{cortados === 0 ? "≈ 36" : `${36 - cortados < 25 ? "< 25" : 36 - cortados}`}</Numero>
          </div>
          <svg viewBox="0 0 1270 300" style={{ width: "100%" }}>
            {Array.from({ length: 36 }, (_, i) => {
              const fora = i >= 36 - cortados;
              return <Navio key={i} x={50 + (i % 12) * 106} y={50 + Math.floor(i / 12) * 100} escala={0.62} opacity={fora ? 0.14 : 1} />;
            })}
          </svg>
        </Entra>
        <div style={{ marginTop: 40 }}>
          <Entra de={at(2) + 30}>
            <Rotulo cor={COR.texto} size={34}>Recorde pago por uma vaga em leilão</Rotulo>
            <Numero size={150} cor={COR.ouro}>US$ {brl(preco)}</Numero>
          </Entra>
        </div>
      </div>
    </Painel>
  );
};

export const Fim: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const entra = Math.min(rampa(frame, 0, 14), rampa(frame, at(3) - 10, at(3) + 10, [1, 0]));
  const receita = rampa(frame, at(0) + 40, fim(0) - 10, [0, 5.7], sobe);
  const tesouro = rampa(frame, at(1) + 5, fim(1) - 10, [0, 2.965], sobe);
  return (
    <AbsoluteFill>
      <Painel opacity={entra}>
        <svg viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
          <Chuva forca={rampa(frame, at(2), at(2) + 15) * 0.8} x0={0} largura={1920} topo={0} base={1080} />
        </svg>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 180, paddingRight: 180, paddingBottom: 90, gap: 56 }}>
          <Entra de={at(0)}>
            <Rotulo cor={COR.texto} size={36}>Receita do canal · ano fiscal de 2025</Rotulo>
            <Numero size={140} cor={COR.ouro}>US$ {receita.toFixed(1).replace(".", ",")} bilhões</Numero>
            <div style={{ height: 22, borderRadius: 11, marginTop: 14, background: COR.ouro, width: `${(receita / 5.7) * 100}%` }} />
          </Entra>
          <Entra de={at(1)}>
            <Rotulo cor={COR.texto} size={36}>Repassados ao governo do Panamá</Rotulo>
            <Numero size={140} cor={COR.agua}>US$ {tesouro.toFixed(1).replace(".", ",")} bilhões</Numero>
            <div style={{ height: 22, borderRadius: 11, marginTop: 14, background: COR.agua, width: `${(tesouro / 5.7) * 100}%` }} />
          </Entra>
        </AbsoluteFill>
      </Painel>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Entra de={at(3) + 30}>
          <Numero size={104} style={{ textAlign: "center", background: "rgba(10,24,38,.8)", padding: "20px 50px", borderRadius: 14, lineHeight: 1.15 }}>
            POR TRÁS DE CADA LUGAR,<br />UM MAPA E UM <span style={{ color: COR.ouro }}>DINHEIRO</span>
          </Numero>
        </Entra>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
