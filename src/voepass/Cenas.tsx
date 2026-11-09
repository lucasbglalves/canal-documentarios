import { CSSProperties, FC, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { corpo, Entra, Numero, Rotulo, sobe } from "../panama/Cenas";
import { Palco } from "./Palco";
import { Credito, Foto, merc, Operarios, Radio, ROTA, Satelite, VINHEDO } from "./Real";
import { Cena, COR, horaNoFrame, rampa, relogio } from "./timeline";

const io = (c: Cena) => ({
  at: (n: number) => c.falas[n].de,
  fim: (n: number) => c.falas[n].de + c.falas[n].duracao,
});
const lerp = (frame: number, ks: number[], vs: number[], easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, ks, vs, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

// ---------- Montagem ----------

/** Troca de tela conforme a fala: cada quadro entra em fade sobre o anterior. */
const Telas = ({ c, q }: { c: Cena; q: [number, ReactNode][] }) => {
  const frame = useCurrentFrame();
  const inicio = (k: number) => (k === 0 ? 0 : c.falas[q[k][0]].de - 8);
  return (
    <>
      {q.map(([, no], k) => {
        const de = inicio(k);
        const ate = k + 1 < q.length ? inicio(k + 1) + 12 : c.duracao;
        return frame < de || frame > ate ? null : (
          <AbsoluteFill key={k} style={{ opacity: k === 0 ? 1 : rampa(frame, de, de + 12) }}>
            {no}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

const Escuro = ({ children, cor = COR.ceu }: { children?: ReactNode; cor?: string }) => (
  <AbsoluteFill style={{ backgroundColor: cor, justifyContent: "center", alignItems: "center", padding: "0 130px", textAlign: "center" }}>{children}</AbsoluteFill>
);

const Fundo3D = ({ azim = 120, elev = 12, dist = 6.5, gelo = 0 }: { azim?: number; elev?: number; dist?: number; gelo?: number }) => {
  const frame = useCurrentFrame();
  return <Palco avanco={frame * 0.12} pose={{ roll: Math.sin(frame / 55) * 2, pitch: 1, yaw: 0, gelo }} cam={{ azim: azim + frame * 0.06, elev, dist }} />;
};

// ---------- HUD ----------

const Relogio = ({ seg, sub = "HORÁRIO DE BRASÍLIA" }: { seg: number; sub?: string }) => (
  <div style={{ position: "absolute", left: 70, top: 56 }}>
    <Numero size={64} style={{ letterSpacing: 2 }}>{relogio(seg)}</Numero>
    <Rotulo size={20} style={{ letterSpacing: 3, marginTop: 6 }}>{sub}</Rotulo>
  </div>
);

const Leitura = ({ rotulo, valor, cor = COR.texto, top }: { rotulo: string; valor: string; cor?: string; top: number }) => (
  <div style={{ position: "absolute", right: 70, top, textAlign: "right" }}>
    <Rotulo size={20} style={{ letterSpacing: 3 }}>{rotulo}</Rotulo>
    <Numero size={54} cor={cor}>{valor}</Numero>
  </div>
);

const Alerta = ({ de, ate = Infinity, texto, cor = COR.ambar, pisca = false }: { de: number; ate?: number; texto: string; cor?: string; pisca?: boolean }) => {
  const frame = useCurrentFrame();
  if (frame < de || frame > ate + 12) return null;
  const on = !pisca || Math.floor((frame - de) / 8) % 2 === 0;
  return (
    <Entra de={de} ate={ate}>
      <div style={{ fontFamily: corpo, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: on ? "#111" : cor, background: on ? cor : "transparent", border: `4px solid ${cor}`, padding: "10px 26px", borderRadius: 6, display: "inline-block" }}>
        {texto}
      </div>
    </Entra>
  );
};

const Pilha = ({ children }: { children: ReactNode }) => (
  <div style={{ position: "absolute", left: 70, bottom: 80, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>{children}</div>
);

const Capitulo = ({ n, texto }: { n: string; texto: string }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", right: 70, bottom: 70, opacity: rampa(frame, 0, 15) * rampa(frame, 110, 130, [1, 0]) }}>
      <Rotulo size={24} style={{ letterSpacing: 4, color: COR.ciano }}>{n} · {texto}</Rotulo>
    </div>
  );
};

const Escurece = ({ de, ate }: { de: number; ate: number }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: rampa(frame, de, ate) }} />;
};

const Frase = ({ de, sup, grande, sub, cor = COR.texto, size = 96 }: { de: number; sup?: string; grande: string; sub?: string; cor?: string; size?: number }) => (
  <Entra de={de}>
    {sup && <Rotulo size={30} style={{ letterSpacing: 4, marginBottom: 22 }}>{sup}</Rotulo>}
    <Numero size={size} cor={cor}>{grande}</Numero>
    {sub && <Rotulo size={36} cor={COR.texto} style={{ marginTop: 26 }}>{sub}</Rotulo>}
  </Entra>
);

const Cartao = ({ de, titulo, sub, cor = COR.texto }: { de: number; titulo: string; sub?: string; cor?: string }) => (
  <Entra de={de}>
    <div style={{ borderLeft: `8px solid ${cor}`, paddingLeft: 28, textAlign: "left" }}>
      <Numero size={60} cor={cor}>{titulo}</Numero>
      {sub && <Rotulo size={30} style={{ marginTop: 8 }}>{sub}</Rotulo>}
    </div>
  </Entra>
);

/** Página de diário técnico (ilustração). `escrita` entre 0 e 1 datilografa a linha. */
const Diario = ({ selo, escrita = 0 }: { selo?: string; escrita?: number }) => {
  const LINHA = "DE-ICING AIRFRAME FAULT";
  const frame = useCurrentFrame();
  return (
    <Escuro cor="#10151C">
      <div style={{ width: 1240, background: "#E9E4D6", color: "#27303A", fontFamily: corpo, padding: "44px 56px", transform: `rotate(-1.2deg) scale(${1 + frame * 0.00012})`, textAlign: "left", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 36, letterSpacing: 2 }}>
          <span>DIÁRIO TÉCNICO DE BORDO</span>
          <span>PS-VPB</span>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 700, marginTop: 30, borderBottom: "3px solid #27303A", paddingBottom: 8 }}>
          <span style={{ width: 240 }}>DATA</span>
          <span>DISCREPÂNCIA</span>
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", height: 74, alignItems: "flex-end", borderBottom: "2px solid #9AA0A0", paddingBottom: 8, fontFamily: "'Courier New', monospace", fontSize: 42, fontWeight: 700, color: "#1C3C7A" }}>
            <span style={{ width: 240 }}>{i === 0 && escrita > 0 ? "08AGO24" : ""}</span>
            <span>{i === 0 ? LINHA.slice(0, Math.round(LINHA.length * escrita)) : ""}</span>
          </div>
        ))}
      </div>
      {selo && (
        <div style={{ position: "absolute", top: 450, fontFamily: corpo, fontWeight: 700, fontSize: 92, letterSpacing: 6, color: COR.vermelho, border: `10px solid ${COR.vermelho}`, padding: "10px 44px", transform: "rotate(-8deg)", background: "rgba(233,228,214,.82)" }}>
          {selo}
        </div>
      )}
      <Credito>Ilustração</Credito>
    </Escuro>
  );
};

type P = [number, number];
const CASCAVEL: P = [-53.455, -24.956];
const GUARULHOS: P = [-46.473, -23.435];
const MEIO: P = [-49.9, -24.3];
const RIBEIRAO: P = [-47.81, -21.18];

const Cidade = ({ p, nome, de, esc, cor = COR.texto, lado = 1 }: { p: P; nome: string; de: number; esc: number; cor?: string; lado?: number }) => {
  const frame = useCurrentFrame();
  const [x, y] = merc(ROTA, p);
  return (
    <g opacity={rampa(frame, de, de + 12)} transform={`translate(${x} ${y}) scale(${1 / esc})`}>
      <circle r={11} fill={cor} stroke="#000" strokeWidth={2} />
      <text x={lado * 24} y={12} fill={cor} fontFamily={corpo} fontWeight={700} fontSize={34} textAnchor={lado > 0 ? "start" : "end"} style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.7)", strokeWidth: 6 }}>
        {nome}
      </text>
    </g>
  );
};

// shortcut: rota em linha reta ilustrativa, não é a trajetória real do radar.
const Rota = ({ de, ate }: { de: number; ate: number }) => {
  const frame = useCurrentFrame();
  const esc = lerp(frame, [de, ate], [1.75, 2.05], Easing.linear);
  const [x0, y0] = merc(ROTA, CASCAVEL);
  const [x1, y1] = merc(ROTA, GUARULHOS);
  const t = lerp(frame, [de + 20, ate], [0, 0.35], Easing.inOut(Easing.quad));
  const xp = x0 + (x1 - x0) * t;
  const yp = y0 + (y1 - y0) * t;
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return (
    <Satelite m={ROTA} centro={MEIO} escala={esc}>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={COR.texto} strokeWidth={4 / esc} strokeDasharray={`${4 / esc} ${14 / esc}`} strokeLinecap="round" opacity={0.7} />
      <line x1={x0} y1={y0} x2={xp} y2={yp} stroke={COR.ambar} strokeWidth={7 / esc} strokeLinecap="round" />
      <Cidade p={CASCAVEL} nome="Cascavel (PR)" de={de} esc={esc} lado={-1} />
      <Cidade p={GUARULHOS} nome="Guarulhos (SP)" de={de + 10} esc={esc} />
      <g transform={`translate(${xp} ${yp}) scale(${1 / esc}) rotate(${ang})`}>
        <path d="M22 0 L-14 -16 L-8 0 L-14 16 Z" fill={COR.texto} stroke="#000" strokeWidth={2} />
      </g>
    </Satelite>
  );
};

// ---------- 1. Abertura ----------

export const Abertura: FC<{ c: Cena }> = ({ c }) => {
  const { at, fim } = io(c);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Telas
        c={c}
        q={[
          [0, <Escuro cor="#000"><Frase de={at(0) + 10} grande="13:22:30" size={210} sub="9 de agosto de 2024 · Vinhedo (SP)" /></Escuro>],
          [1, <><Foto src="fotos-voepass/coletiva-sp.jpg" credito="Foto: Governo do Estado de SP (CC BY 2.0)" de={at(1)} ate={fim(1) + 30} /><Pilha><Entra de={at(1)}><Numero size={110}>62 A BORDO</Numero></Entra></Pilha></>],
          [2, <Operarios de={at(2) - 8} ate={fim(2)} />],
          [3, <Fundo3D azim={70} elev={18} dist={4.5} gelo={0.5} />],
          [4, <Escuro><Frase de={at(4) + 10} sup="RELATÓRIO FINAL · CENIPA" grande="266 páginas" size={150} sub="19 fatores" /></Escuro>],
          [5, <Diario selo="SEM REGISTRO" />],
          [6, <><Fundo3D /><Escuro cor="rgba(5,8,12,.55)"><Frase de={at(6) + 8} grande="VOO 2283" size={190} sub="Reconstrução com base no relatório final do CENIPA" /></Escuro></>],
        ]}
      />
      <Escurece de={c.duracao - 12} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 2. A empresa e o avião ----------

const Marco = ({ de, ano, txt, cor = COR.texto }: { de: number; ano: string; txt: string; cor?: string }) => (
  <Entra de={de} style={{ width: 300, textAlign: "left" }}>
    <div style={{ width: 22, height: 22, borderRadius: 11, background: cor, marginBottom: 22 }} />
    <Numero size={72} cor={cor}>{ano}</Numero>
    <Rotulo size={28} cor={COR.texto} style={{ marginTop: 10 }}>{txt}</Rotulo>
  </Entra>
);

const LinhaEmpresa = ({ c }: { c: Cena }) => {
  const { at } = io(c);
  return (
    <Escuro>
      <div style={{ position: "absolute", top: 120 }}><Rotulo size={30} style={{ letterSpacing: 4 }}>DE RIBEIRÃO PRETO A VOEPASS</Rotulo></div>
      <div style={{ position: "relative", display: "flex", gap: 34, alignItems: "flex-start" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, height: 3, background: "#33475C" }} />
        <Marco de={at(0) + 15} ano="1995" txt="Empresa de ônibus cria a Passaredo" />
        <Marco de={at(1) + 10} ano="2002" txt="Voos suspensos · volta em 2004" cor={COR.ambar} />
        <Marco de={at(1) + 80} ano="2012" txt="Recuperação judicial · sai em 2017" cor={COR.ambar} />
        <Marco de={at(2) + 10} ano="2019" txt="Compra a MAP e vira Voepass" cor={COR.ciano} />
        <Marco de={at(2) + 150} ano="2023" txt="Parceria com a LATAM" cor={COR.ciano} />
      </div>
    </Escuro>
  );
};

export const Empresa: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = io(c);
  const esc = 1.75;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <LinhaEmpresa c={c} />],
          [3, <Satelite m={ROTA} centro={MEIO} escala={esc + frame * 0.0002}><Cidade p={RIBEIRAO} nome="Ribeirão Preto" de={at(3)} esc={esc} /><Cidade p={CASCAVEL} nome="Cascavel (PR)" de={at(3) + 70} esc={esc} cor={COR.ambar} lado={-1} /><Cidade p={GUARULHOS} nome="Guarulhos" de={at(3) + 20} esc={esc} /></Satelite>],
          [4, <><Foto src="fotos-voepass/vpb-salvador.jpg" credito="O PS-VPB em Salvador · Foto: IndiaEcho (CC BY 2.0)" de={at(4)} ate={fim(4) + 20} /><Pilha><Entra de={at(4) + 10}><Rotulo size={24} style={{ letterSpacing: 3 }}>PS-VPB · ATR 72-500</Rotulo><Numero size={72}>17.359 horas de voo</Numero><Rotulo size={30} cor={COR.texto}>Fabricado em 2010 · Itália · Indonésia · Voepass desde 2022</Rotulo></Entra></Pilha></>],
          [5, <Foto src="fotos-voepass/vpb-congonhas.jpg" credito="O PS-VPB em Congonhas · Foto: Luciano Santos (CC BY 4.0)" de={at(5)} ate={c.duracao} />],
        ]}
      />
      <Capitulo n="1" texto="A EMPRESA E O AVIÃO" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 3. O adversário ----------

const Altitudes = ({ de }: { de: number }) => {
  const frame = useCurrentFrame();
  const y = (pes: number) => 960 - pes * 0.021;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <svg width={1920} height={1080}>
        <rect x={0} y={y(22000)} width={1920} height={y(10000) - y(22000)} fill={COR.gelo} opacity={0.14 * rampa(frame, de + 150, de + 180)} />
        <text x={1840} y={y(21000)} textAnchor="end" fill={COR.gelo} fontFamily={corpo} fontWeight={700} fontSize={36} opacity={rampa(frame, de + 150, de + 180)}>Faixa com água líquida abaixo de zero</text>
        {[10000, 20000, 30000, 40000].map((p) => (
          <g key={p}>
            <line x1={70} y1={y(p)} x2={1850} y2={y(p)} stroke="#2A3A4C" strokeWidth={2} strokeDasharray="6 12" />
            <text x={80} y={y(p) - 10} fill={COR.apagado} fontFamily={corpo} fontSize={26}>{p.toLocaleString("pt-BR")} pés</text>
          </g>
        ))}
        <g opacity={rampa(frame, de + 10, de + 25)} transform={`translate(${500 + frame * 1.1} ${y(36000)})`}>
          <path d="M60 0 L-40 -22 L-28 0 L-40 22 Z" fill={COR.texto} />
          <text x={80} y={12} fill={COR.texto} fontFamily={corpo} fontWeight={700} fontSize={36}>Jato</text>
        </g>
        <g opacity={rampa(frame, de + 90, de + 105)} transform={`translate(${380 + frame * 0.7} ${y(17000)})`}>
          <path d="M50 0 L-34 -18 L-24 0 L-34 18 Z" fill={COR.ambar} />
          <text x={70} y={12} fill={COR.ambar} fontFamily={corpo} fontWeight={700} fontSize={36}>Turboélice</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// Perfil de asa em 2D: gelo no bordo de ataque, sustentação caindo, bota inflando.
const PERFIL = "M300 0 C300 -60 420 -95 620 -95 C900 -95 1180 -40 1340 0 C1180 12 900 22 620 26 C420 28 300 30 300 0 Z";

const AsaGelo = ({ gotas, forma, min, bota }: { gotas: number; forma: number; min: number; bota: number }) => {
  const frame = useCurrentFrame();
  const gelo = lerp(frame, [gotas + 20, forma + 40], [0, 1]);
  const quebra = lerp(frame, [bota + 100, bota + 125], [0, 1], Easing.in(Easing.quad));
  const g = gelo * (1 - quebra);
  const sust = lerp(frame, [forma + 20, forma + 80], [1, 0.62]) + quebra * 0.38;
  const infla = bota + 70 < frame && frame < bota + 130 ? 1 + 0.6 * Math.abs(Math.sin((frame - bota) / 5)) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <svg width={1920} height={1080}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={0} y1={360 + i * 55} x2={1920} y2={360 + i * 55} stroke="#3B5068" strokeWidth={3} strokeDasharray="80 140" strokeDashoffset={-((frame * 14 + i * 90) % 220)} />
        ))}
        <g transform="translate(160 600)">
          <path d={PERFIL} fill="#D9DFE6" />
          <path d={`M330 -50 C${300 - 14 * infla} -30 ${300 - 14 * infla} 25 330 26`} stroke="#1D232B" strokeWidth={12 * infla} fill="none" opacity={rampa(frame, bota, bota + 12)} />
          <path d={`M340 -62 C${290 - 70 * g} -80 ${270 - 90 * g} ${-10 - 20 * g} ${300 - 60 * g} 10 C${290 - 40 * g} 40 320 32 340 26`} fill={COR.gelo} opacity={g > 0.02 ? 0.95 : 0} />
          {quebra > 0 && [0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={190 + i * 15 + quebra * (300 + i * 60)} y={-60 + i * 22 + quebra * (i - 2) * 40} width={26} height={18} fill={COR.gelo} opacity={1 - quebra} transform={`rotate(${quebra * 200 * (i + 1)} 260 0)`} />
          ))}
          <g opacity={rampa(frame, forma, forma + 12)}>
            <line x1={760} y1={-120} x2={760} y2={-120 - 330 * sust} stroke={COR.ciano} strokeWidth={14} />
            <path d={`M730 ${-120 - 330 * sust} L790 ${-120 - 330 * sust} L760 ${-170 - 330 * sust} Z`} fill={COR.ciano} />
            <text x={800} y={-150 - 160 * sust} fill={COR.ciano} fontFamily={corpo} fontWeight={700} fontSize={36}>SUSTENTAÇÃO</text>
          </g>
        </g>
      </svg>
      <Pilha>
        <Entra de={gotas + 20} ate={forma - 5}><Rotulo size={36} cor={COR.gelo}>As gotas congelam ao tocar a asa</Rotulo></Entra>
        <Entra de={forma + 40} ate={min - 5}><Rotulo size={36} cor={COR.ambar}>Menos sustentação, mais arrasto</Rotulo></Entra>
        <Entra de={min + 10} ate={bota - 5}><Rotulo size={36} cor={COR.ambar}>Com gelo, a velocidade mínima é mais alta</Rotulo></Entra>
        <Entra de={bota + 20}><Rotulo size={36} cor={COR.texto}>Botas de degelo: inflam e rompem o gelo</Rotulo></Entra>
      </Pilha>
    </AbsoluteFill>
  );
};

const Barra = ({ de, rotulo, pct, cor }: { de: number; rotulo: string; pct: number; cor: string }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ textAlign: "left", marginBottom: 56 }}>
      <Rotulo size={36} cor={COR.texto}>{rotulo}</Rotulo>
      <div style={{ height: 66, marginTop: 14, width: 1300 * pct * lerp(frame, [de, de + 40], [0, 1], sobe), background: cor, borderRadius: 4 }} />
    </div>
  );
};

export const Adversario: FC<{ c: Cena }> = ({ c }) => {
  const { at } = io(c);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <Altitudes de={at(0)} />],
          [1, <AsaGelo gotas={at(1)} forma={at(2)} min={at(3)} bota={at(4)} />],
          [5, <Escuro><Frase de={at(5) + 20} sup="31 DE OUTUBRO DE 1994 · INDIANA, EUA" grande="American Eagle 4184" size={110} sub="ATR 72 · gelo além da área protegida pelas botas · 68 mortos" /></Escuro>],
          [6, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 34 }}><Rotulo size={30} style={{ letterSpacing: 4 }}>ACIDENTES DE ATR COM GELO CITADOS PELO CENIPA</Rotulo><Cartao de={at(6) + 10} titulo="1987 · Aero Trasporti Italiani 460" /><Cartao de={at(6) + 30} titulo="1994 · American Eagle 4184" /><Cartao de={at(6) + 50} titulo="2002 · TransAsia 791" /><Cartao de={at(6) + 70} titulo="2009 · Empire Airlines 8284" /></div></Escuro>],
          [7, <Escuro><div><Rotulo size={30} style={{ letterSpacing: 4, marginBottom: 60, textAlign: "left" }}>APM · MONITORAMENTO DE DESEMPENHO</Rotulo><Barra de={at(7) + 40} rotulo="Arrasto esperado" pct={0.6} cor={COR.ciano} /><Barra de={at(7) + 70} rotulo="Arrasto real, com gelo" pct={0.86} cor={COR.ambar} /></div></Escuro>],
          [8, <Fundo3D azim={160} />],
        ]}
      />
      <Capitulo n="2" texto="O ADVERSÁRIO" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 4. O que não foi escrito ----------

const VOOS = [
  { quando: "8 AGO · NOITE", rota: "Guarulhos → Ribeirão Preto", nota: "Falha nas botas · 3 resets" },
  { quando: "9 AGO · MADRUGADA", rota: "Ribeirão Preto → Guarulhos", nota: "Degelo falha de novo" },
  { quando: "9 AGO · 9h06", rota: "Guarulhos → Cascavel", nota: "Falha · 161 nós, abaixo do mínimo" },
];

const TresVoos = ({ ini, nada }: { ini: number[]; nada: number[] }) => (
  <Escuro>
    <div style={{ width: 1560, display: "flex", flexDirection: "column", gap: 40 }}>
      <Rotulo size={30} style={{ letterSpacing: 4, textAlign: "left" }}>OS TRÊS VOOS ANTERIORES</Rotulo>
      {VOOS.map((v, i) => (
        <Entra key={i} de={ini[i]}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#141F2D", padding: "26px 36px", textAlign: "left" }}>
            <div>
              <Rotulo size={24} style={{ letterSpacing: 3 }}>{v.quando}</Rotulo>
              <Numero size={54}>{v.rota}</Numero>
              <Rotulo size={30} cor={COR.ambar} style={{ marginTop: 8 }}>{v.nota}</Rotulo>
            </div>
            <Entra de={nada[i]}>
              <div style={{ fontFamily: corpo, fontWeight: 700, fontSize: 34, color: COR.vermelho, border: `4px solid ${COR.vermelho}`, padding: "10px 20px", transform: "rotate(-4deg)" }}>DIÁRIO: NADA</div>
            </Entra>
          </div>
        </Entra>
      ))}
    </div>
  </Escuro>
);

export const DiarioCena: FC<{ c: Cena }> = ({ c }) => {
  const { at, fim } = io(c);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <Diario />],
          [1, <Escuro><Frase de={at(1) + 15} sup="LISTA DE EQUIPAMENTOS MÍNIMOS · BOTAS DE DEGELO" grande="“Pode estar inoperante desde que a aeronave não seja operada em condições de gelo conhecidas ou previstas”" size={66} /><Credito>Tradução do CENIPA</Credito></Escuro>],
          [2, <Diario selo="SEM REGISTRO" />],
          [3, <TresVoos ini={[at(3) + 10, at(5) + 10, at(6) + 10]} nada={[fim(3) - 40, fim(5) - 30, at(8)]} />],
          [9, <Escuro><Frase de={at(9) + 60} sup="RELATÓRIO FINAL · CENIPA" grande="“Esses padrões de desvio eram incentivados pela empresa”" size={82} /></Escuro>],
          [10, <Escuro><Frase de={at(10) + 15} grande="Cultura de informalidade" size={120} cor={COR.ambar} sub="Defeitos relatados no corredor · regras fora do papel" /></Escuro>],
        ]}
      />
      <Capitulo n="3" texto="O QUE NÃO FOI ESCRITO" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 5. A decolagem ----------

const ITENS = ["Ar-condicionado esquerdo", "Assento de observador", "Assentos de passageiros", "Limpador direito", "Freio da roda 4", "Luzes da cabine", "Luzes da cauda", "Display do ADF", "Instrumento EADI 1", "Sistema de ignição"];

const Piloto = ({ de, nome, papel, dados }: { de: number; nome: string; papel: string; dados: string }) => (
  <Entra de={de} style={{ textAlign: "left", borderLeft: `6px solid ${COR.texto}`, paddingLeft: 34 }}>
    <Rotulo size={26} style={{ letterSpacing: 4 }}>{papel}</Rotulo>
    <Numero size={70} style={{ marginTop: 8 }}>{nome}</Numero>
    <Rotulo size={32} cor={COR.texto} style={{ marginTop: 10 }}>{dados}</Rotulo>
  </Entra>
);

export const Despacho: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = io(c);
  const seg = horaNoFrame(frame, [[at(4), "11:58:05"], [fim(4), "11:58:30"]]);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <Escuro><div style={{ width: 1500, textAlign: "left" }}><Rotulo size={30} style={{ letterSpacing: 4, marginBottom: 34 }}>ITENS INOPERANTES NO DESPACHO</Rotulo><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 60px" }}>{ITENS.map((t, i) => <Entra key={t} de={at(0) + 15 + i * 7}><Rotulo size={40} cor={COR.texto}>{t}</Rotulo></Entra>)}</div><Entra de={fim(0) - 75} style={{ marginTop: 44 }}><Numero size={62} cor={COR.vermelho}>Degelo: fora da lista</Numero></Entra></div></Escuro>],
          [1, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 70 }}><Cartao de={at(1) + 10} titulo="Sem ar-condicionado esquerdo" sub="Teto máximo: 17.000 pés" cor={COR.ambar} /><Cartao de={at(1) + 130} titulo="Limpador direito inoperante" sub="Com chuva prevista, a regra impedia o despacho" cor={COR.vermelho} /></div></Escuro>],
          [2, <><Rota de={at(2)} ate={fim(2)} /><Pilha><Alerta de={at(2) + 100} texto="GELO SEVERO PREVISTO NA REGIÃO" cor={COR.gelo} /><Entra de={fim(2) - 60}><Numero size={70}>Plano: 17.000 pés</Numero></Entra></Pilha></>],
          [3, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 80 }}><Piloto de={at(3) + 10} papel="COMANDANTE" nome="Danilo Santos Romano" dados="35 anos · 5.248 horas de voo" /><Piloto de={at(3) + 170} papel="COPILOTO" nome="Humberto de Campos Alencar e Silva" dados="61 anos · 5.143 horas de voo · 3.543 no ATR" /></div></Escuro>],
          [4, <><Rota de={at(4)} ate={c.duracao} /><Relogio seg={seg} /><Pilha><Entra de={at(4) + 10}><Numero size={72}>58 passageiros · 4 tripulantes</Numero></Entra></Pilha></>],
        ]}
      />
      <Capitulo n="4" texto="A DECOLAGEM" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 6. Uma hora de avisos ----------

export const Avisos: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = io(c);
  const seg = horaNoFrame(frame, [[at(0), "12:14:56"], [at(0) + 90, "12:15:03"], [at(1), "12:15:42"], [fim(1), "12:15:49"], [at(2), "12:16:09"], [at(4), "12:20:00"], [fim(4), "12:22:00"], [at(5), "12:30:00"], [fim(5), "13:03:44"]]);
  const palco = (gelo: number, azim: number) => <Palco avanco={frame * 0.12} pose={{ roll: Math.sin(frame / 60) * 1.5, pitch: 1, yaw: 0, gelo }} cam={{ azim: azim + frame * 0.03, elev: 22, dist: 5 }} />;
  const avisos = Math.min(7, Math.max(0, Math.floor(lerp(frame, [at(5) + 30, at(5) + 200], [0, 7.99], Easing.linear))));
  const inclina = lerp(frame, [at(8) + 40, fim(8)], [1, 6]);
  const velIlustra = lerp(frame, [at(8) + 40, fim(8)], [100, 40]);
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <>{palco(0.1, 60)}<Relogio seg={seg} /><Leitura top={60} rotulo="ALTITUDE" valor="13.000 pés" /><Pilha><Alerta de={at(0) + 40} ate={at(1) - 5} texto="GELO DETECTADO" cor={COR.gelo} /><Alerta de={at(1)} texto="DEICING AIRFRAME · FAULT" pisca /></Pilha></>],
          [2, <Escuro cor="#05080C"><Numero size={70} cor={COR.ciano}>12:16:09</Numero><Rotulo size={30} style={{ letterSpacing: 4, margin: "18px 0 50px" }}>COPILOTO · SEGUNDO O GRAVADOR DE VOZ</Rotulo><Entra de={at(2) + 150}><Numero size={72}>A falha não está reportada no diário. Para não pegar gelo, teriam que voar a 11 mil pés.</Numero></Entra><Credito>Paráfrase do relatório final do CENIPA</Credito></Escuro>],
          [3, <Escuro cor="#05080C"><Frase de={at(3) + 40} grande="Não há resposta registrada." size={100} /></Escuro>],
          [4, <>{palco(0.2, 90)}<Relogio seg={seg} /><Leitura top={60} rotulo="ALTITUDE" valor="17.000 pés" /><Pilha><Entra de={at(4) + 20}><Rotulo size={40} cor={COR.texto}>Degelo desligado</Rotulo></Entra></Pilha></>],
          [5, <>{palco(0.4, 110)}<Relogio seg={seg} /><Leitura top={60} rotulo="AVISOS DE VELOCIDADE BAIXA" valor={`${avisos}`} cor={COR.ambar} /><Pilha>{avisos > 0 && <Alerta de={at(5) + 30} texto="CRUISE SPEED LOW" />}<Entra de={at(5) + 260}><Rotulo size={40} cor={COR.texto}>Nenhum comentário sobre os avisos no gravador</Rotulo></Entra></Pilha></>],
          [6, <Escuro><Frase de={at(6) + 40} grande="Cegueira e surdez por desatenção" size={110} cor={COR.ciano} sub="Fator contribuinte: atenção" /></Escuro>],
          [7, <Escuro><Frase de={at(7) + 30} sup="NA EMPRESA" grande="Aviso demais vira ruído" size={110} cor={COR.ambar} /></Escuro>],
          [8, <AbsoluteFill><Palco avanco={frame * 0.1} pose={{ roll: 0, pitch: inclina, yaw: 0, gelo: 0.5 }} cam={{ azim: 90, elev: 6, dist: 5 }} /><Pilha><Entra de={at(8) + 15}><Rotulo size={24} style={{ letterSpacing: 3 }}>PILOTO AUTOMÁTICO · MANTER ALTITUDE</Rotulo><Numero size={64}>Nariz sobe, velocidade cai</Numero></Entra></Pilha><div style={{ position: "absolute", right: 70, top: 80, width: 420, height: 18, background: "#223" }}><div style={{ width: `${velIlustra}%`, height: "100%", background: COR.ambar }} /></div><div style={{ position: "absolute", right: 70, top: 110 }}><Rotulo size={22}>VELOCIDADE · ilustrativo</Rotulo></div></AbsoluteFill>],
        ]}
      />
      <Capitulo n="5" texto="UMA HORA DE AVISOS" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 7. Cinco minutos ----------

export const Minutos: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = io(c);
  const fimF = fim(17);
  const seg = horaNoFrame(frame, [[at(0), "13:17:26"], [at(1), "13:18:09"], [fim(1), "13:18:24"], [at(2), "13:18:30"], [at(3), "13:18:42"], [at(4), "13:19:28"], [at(5), "13:20:04"], [at(6), "13:20:33"], [at(7), "13:20:49"], [at(8), "13:20:57"], [at(9), "13:21:09"], [at(11), "13:21:12"], [at(12), "13:21:14"], [at(13), "13:21:22"], [at(15), "13:21:36"], [at(17), "13:21:40"], [fimF, "13:22:30"]]);
  const roll = lerp(frame, [at(7), at(7) + 80, at(9), at(10) + 30, at(12), at(14) + 20, at(15)], [0, 32, 32, -52, -38, 94, -40]) + (frame > at(15) ? Math.sin(frame / 9) * 12 : 0);
  const pitch = lerp(frame, [at(5), at(8), at(9), at(11), at(12), at(14) + 20, at(15)], [3, 5, 9, -5, 2, -43, -22]);
  const giro = Math.max(0, frame - at(15)) * 4.2;
  const yaw = lerp(frame, [at(13), at(14) + 20], [0, 110]) - giro;
  const queda = lerp(frame, [at(10), at(15)], [0, 8], Easing.in(Easing.quad)) + Math.max(0, frame - at(15)) * 0.09;
  const gelo = lerp(frame, [0, at(5)], [0.5, 1]);
  const vel = lerp(frame, [at(3), at(4), at(7), at(9)], [191, 185, 171, 160], Easing.linear);
  const arrasto = Math.round(lerp(frame, [at(3), at(4), at(8)], [16, 27, 44], Easing.linear));
  const voltas = Math.min(5, 1 + Math.floor(lerp(frame, [at(17), fimF], [0, 4.99], Easing.linear)));
  const chamadas = Math.min(5, Math.max(0, Math.floor((frame - at(17) - 200) / 20) + 1));
  const orbita = frame > at(15) ? { azim: 200 + frame * 0.2, elev: 32, dist: 8 } : { azim: lerp(frame, [0, at(9)], [40, 170], Easing.linear), elev: lerp(frame, [at(7), at(10)], [14, 24]), dist: lerp(frame, [0, at(7), at(10)], [4, 5, 7.5]) };
  return (
    <AbsoluteFill>
      <Palco avanco={frame > at(15) ? 0 : frame * 0.1} queda={queda} pose={{ roll, pitch, yaw, gelo }} cam={orbita} />
      <Relogio seg={seg} />
      {frame >= at(3) && frame < at(9) + 90 && <Leitura top={60} rotulo="VELOCIDADE" valor={`${Math.round(vel)} nós`} cor={frame > at(4) ? COR.ambar : COR.texto} />}
      {frame >= at(3) && frame < at(9) && <Leitura top={190} rotulo="ARRASTO ACIMA DO ESPERADO" valor={`+${arrasto}%`} cor={COR.ambar} />}
      {frame >= at(9) && frame < at(17) && <Leitura top={190} rotulo="INCLINAÇÃO" valor={`${Math.abs(Math.round(roll))}° ${roll >= 0 ? "DIR" : "ESQ"}`} />}
      {frame >= at(17) && <Leitura top={60} rotulo="VOLTAS NO PARAFUSO" valor={`${voltas} de 5`} cor={COR.vermelho} />}
      <Pilha>
        <Alerta de={at(0) + 100} ate={at(1) - 5} texto="GELO DETECTADO" cor={COR.gelo} />
        <Alerta de={at(3)} ate={at(4) - 5} texto="CRUISE SPEED LOW · 8º AVISO" />
        <Alerta de={at(4)} ate={at(5) - 5} texto="DEGRADED PERFORMANCE" />
        <Alerta de={at(6)} ate={at(7) - 5} texto="DESCIDA EM 2 MINUTOS" cor={COR.ciano} />
        <Alerta de={at(7)} ate={at(8) - 5} texto="CURVA À DIREITA · 171 NÓS" cor={COR.ciano} />
        <Alerta de={at(8)} ate={at(9) - 5} texto="INCREASE SPEED" pisca />
        <Alerta de={at(9)} ate={at(11) - 5} texto="STALL" cor={COR.vermelho} pisca />
        <Alerta de={at(12)} ate={at(13) - 5} texto="COMANDOS DESACOPLADOS" cor={COR.vermelho} />
        <Alerta de={at(13)} ate={at(15) - 5} texto="PONTO SEM VOLTA" cor={COR.vermelho} />
        <Alerta de={at(15)} ate={at(17) - 5} texto="DESCIDA AUTORIZADA" cor={COR.ciano} />
        {frame >= at(17) && <Alerta de={at(17)} texto="PARAFUSO CHATO" cor={COR.vermelho} />}
        {chamadas > 0 && (
          <Rotulo size={30} cor={COR.texto}>
            CONTROLE CHAMA: {"●".repeat(chamadas)}<span style={{ opacity: 0.3 }}>{"●".repeat(5 - chamadas)}</span> sem resposta
          </Rotulo>
        )}
      </Pilha>
      {frame >= at(5) && frame < at(6) - 8 && (
        <div style={{ position: "absolute", right: 120, top: 340 }}>
          <Entra de={at(5) + 30} ate={at(6) - 20}>
            <div style={{ fontFamily: corpo, fontWeight: 700, fontSize: 46, color: "#111", background: COR.texto, padding: "18px 34px", borderRadius: 18 }}>“bastante gelo”</div>
            <Rotulo size={22} style={{ marginTop: 10, textAlign: "right" }}>COPILOTO · GRAVADOR DE VOZ</Rotulo>
          </Entra>
        </div>
      )}
      <Capitulo n="6" texto="CINCO MINUTOS" />
      <Radio de={fim(1) + 30} hora="13:18" />
      <Escurece de={c.duracao - 12} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 8. Vinhedo ----------

const LOCAL: P = [-47.0197, -23.0497];
const LocalQueda = ({ de }: { de: number }) => {
  const frame = useCurrentFrame();
  const esc = lerp(frame - de, [0, 200], [0.55, 1.3]);
  const [x, y] = merc(VINHEDO, LOCAL);
  const pulso = 1 + 0.25 * Math.sin((frame - de) / 6);
  return (
    <Satelite m={VINHEDO} centro={LOCAL} escala={esc}>
      <g transform={`translate(${x} ${y}) scale(${1 / esc})`} opacity={rampa(frame, de + 40, de + 55)}>
        <circle r={34 * pulso} fill="none" stroke={COR.vermelho} strokeWidth={5} />
        <circle r={9} fill={COR.vermelho} />
        <text x={50} y={12} fill={COR.texto} fontFamily={corpo} fontWeight={700} fontSize={38} style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.8)", strokeWidth: 7 }}>Recanto Florido · Vinhedo (SP)</text>
      </g>
    </Satelite>
  );
};

export const Vinhedo: FC<{ c: Cena }> = ({ c }) => {
  const { at, fim } = io(c);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Telas
        c={c}
        q={[
          [0, <LocalQueda de={0} />],
          [1, <Foto src="fotos-voepass/coletiva-sp.jpg" credito="Coletiva em Vinhedo · Foto: Governo do Estado de SP (CC BY 2.0)" de={at(1)} ate={fim(1) + 20} />],
          [2, <Escuro cor="#000"><Frase de={at(2) + 10} grande="3 dias de luto nacional" size={120} /></Escuro>],
          [3, <Escuro><Frase de={at(3) + 10} grande="As caixas-pretas" size={120} sub="Gravador de voz e gravador de dados · Brasília" /></Escuro>],
        ]}
      />
      <Capitulo n="7" texto="VINHEDO" />
      <Escurece de={c.duracao - 12} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 9. Dezenove fatores ----------

const BARREIRAS = ["Meteorologia", "Registro", "Planejamento", "Tripulação", "Empresa", "Projeto", "Fiscalização"];

const Barreiras = ({ c }: { c: Cena }) => {
  const frame = useCurrentFrame();
  const { at } = io(c);
  return (
    <Escuro>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 1080, textAlign: "left" }}>
        {BARREIRAS.map((b, i) => {
          const f = at(i + 2);
          const cedeu = frame >= f;
          return (
            <Entra key={b} de={at(1) + 10 + i * 6}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 34px", borderLeft: `10px solid ${cedeu ? COR.vermelho : COR.ciano}`, background: cedeu ? "rgba(229,72,77,.14)" : "#141F2D", transform: `translateX(${cedeu ? 26 * rampa(frame, f, f + 12) : 0}px)` }}>
                <Numero size={60} cor={cedeu ? COR.texto : COR.apagado}>{b}</Numero>
                {cedeu && <Rotulo size={32} cor={COR.vermelho} style={{ alignSelf: "center" }}>cedeu</Rotulo>}
              </div>
            </Entra>
          );
        })}
      </div>
    </Escuro>
  );
};

export const Fatores: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at } = io(c);
  const n = Math.round(lerp(frame, [at(0) + 60, at(0) + 110], [0, 19], sobe));
  return (
    <AbsoluteFill style={{ backgroundColor: COR.ceu }}>
      <Telas
        c={c}
        q={[
          [0, <Escuro><Rotulo size={28} style={{ letterSpacing: 4 }}>RELATÓRIO FINAL · CENIPA · 23 DE JULHO DE 2026</Rotulo><Numero size={300} cor={COR.ambar} style={{ marginTop: 30 }}>{n}</Numero><Rotulo size={42} cor={COR.texto}>fatores · 15 contribuíram · 4 indeterminados</Rotulo></Escuro>],
          [1, <Barreiras c={c} />],
          [9, <Escuro><Frase de={at(9) + 10} sup="NOTA DA VOEPASS" grande="“O episódio mais difícil da história da VOEPASS”" size={82} sub="Tripulação experiente e certificada, segundo a empresa" /></Escuro>],
          [10, <Escuro><Frase de={at(10) + 10} sup="AGOSTO DE 2026 · POLÍCIA FEDERAL" grande="16 indiciados" size={130} sub="Indiciamento não é condenação" /></Escuro>],
        ]}
      />
      <Capitulo n="8" texto="DEZENOVE FATORES" />
      <Escurece de={c.duracao - 10} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- 10. Depois ----------

export const Depois: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = io(c);
  const fimTexto = fim(10);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Telas
        c={c}
        q={[
          [0, <Foto src="fotos-voepass/vpb-portoalegre.jpg" credito="O PS-VPB em Porto Alegre · Foto: Rafael Luiz Canossa (CC BY-SA 2.0)" de={0} ate={at(2) - 10} />],
          [2, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 70 }}><Cartao de={at(2) + 10} titulo="11 de março de 2025" sub="ANAC suspende o certificado" cor={COR.ambar} /><Cartao de={at(2) + 110} titulo="24 de junho de 2025" sub="Certificado cassado · fim das operações" cor={COR.vermelho} /></div></Escuro>],
          [3, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 44 }}><Rotulo size={30} style={{ letterSpacing: 4, textAlign: "left" }}>APM VERSÃO 2.0</Rotulo><Cartao de={at(3) + 40} titulo="Vigia o voo inteiro" /><Cartao de={at(3) + 100} titulo="Alerta pela margem real de velocidade" /><Cartao de={at(3) + 170} titulo="Mensagem fica 60 segundos" /><Cartao de={fim(3) - 90} titulo="Simulação do voo: alerta 27 minutos antes" cor={COR.ciano} /></div></Escuro>],
          [4, <Escuro><Frase de={at(4) + 10} sup="SÓ PARA O ATR 72-600" grande="O 72-500 não é compatível" size={110} cor={COR.ambar} /></Escuro>],
          [5, <Escuro><div style={{ display: "flex", flexDirection: "column", gap: 56 }}><Rotulo size={30} style={{ letterSpacing: 4, textAlign: "left" }}>9 RECOMENDAÇÕES DE SEGURANÇA</Rotulo><Cartao de={at(5) + 30} titulo="EASA e fabricante" sub="Alerta no nível mais alto · ação imediata em desempenho degradado" cor={COR.ciano} /><Cartao de={at(5) + 130} titulo="ANAC" sub="Transformar sinais de risco em decisão" cor={COR.ambar} /></div></Escuro>],
          [6, <Fundo3D azim={200} />],
          [7, <Diario escrita={lerp(frame, [at(7) + 60, fim(7)], [0, 1], Easing.linear)} />],
          [9, <Escuro cor="#05080C"><Frase de={at(9) + 10} grande="12:16:09" size={200} cor={COR.ciano} /></Escuro>],
          [10, <Diario selo="SEM REGISTRO" />],
        ]}
      />
      <Capitulo n="9" texto="DEPOIS" />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: rampa(frame, fimTexto + 10, fimTexto + 30), justifyContent: "center", alignItems: "center" }}>
        <Entra de={fimTexto + 30}>
          <div style={{ textAlign: "center" }}>
            <Numero size={110}>62 vidas</Numero>
            <Rotulo size={32} cor={COR.texto} style={{ marginTop: 20 }}>Em memória das vítimas do voo 2283</Rotulo>
          </div>
        </Entra>
      </AbsoluteFill>
      <Escurece de={c.duracao - 20} ate={c.duracao} />
    </AbsoluteFill>
  );
};

// ---------- Encerramento ----------

// Ícones Material (24×24), os mesmos da interface do YouTube.
const ICONE = {
  gostei: "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z",
  naoGostei: "M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z",
  sino: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  comentario: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z",
};
const Icone = ({ d, cor = "#fff", size = 46, style }: { d: string; cor?: string; size?: number; style?: CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={style}><path d={d} fill={cor} /></svg>
);

const Y_BOTAO = 470;
const ALTURA = 104;
const pilula = (left: number, width: number, fundo: string): CSSProperties => ({
  position: "absolute", left, top: Y_BOTAO, width, height: ALTURA, borderRadius: ALTURA / 2, background: fundo,
  display: "flex", alignItems: "center", justifyContent: "center", gap: 16, color: "#fff", fontFamily: corpo, fontWeight: 600, fontSize: 38,
});

/** Etiqueta didática acima do botão: acende quando chega a vez dele. */
const Passo = ({ n, txt, x, de }: { n: number; txt: string; x: number; de: number }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - 200, width: 400, top: Y_BOTAO - 104, textAlign: "center", opacity: rampa(frame, de - 22, de - 8) }}>
      <span style={{ fontFamily: corpo, fontWeight: 700, fontSize: 32, color: "#fff" }}>
        <span style={{ display: "inline-block", width: 48, lineHeight: "48px", borderRadius: 24, background: "#FF0000", marginRight: 12 }}>{n}</span>
        {txt}
      </span>
    </div>
  );
};

/** Onda do clique, centrada no botão. */
const Clique = ({ x, de }: { x: number; de: number }) => {
  const frame = useCurrentFrame();
  const t = frame - de;
  if (t < 0 || t > 20) return null;
  const r = 40 + t * 7;
  return <div style={{ position: "absolute", left: x - r, top: Y_BOTAO + ALTURA / 2 - r, width: r * 2, height: r * 2, borderRadius: r, border: "5px solid rgba(255,255,255,.75)", opacity: 1 - t / 20 }} />;
};

const FRASE_COMENTARIO = "Qual caso você quer ver aqui?";

export const Canal: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at } = io(c);
  const D = c.falas[1].duracao;
  // Instantes proporcionais à posição das palavras "inscreva-se", "like" e "comentários" na fala.
  const inscr = Math.round(at(1) + D * 0.32);
  const sino = inscr + 48;
  const like = Math.round(at(1) + D * 0.56);
  const coment = Math.round(at(1) + D * 0.74);
  const X = { inscr: 495, sino: 780, like: 1010, coment: 1450 };
  const entra = at(1) - 10;
  const cx = lerp(frame, [entra, inscr - 4, sino - 22, sino - 4, like - 22, like - 4, coment - 22, coment - 4], [1500, X.inscr, X.inscr, X.sino, X.sino, X.like, X.like, X.coment]);
  const cy = lerp(frame, [entra, inscr - 4], [900, Y_BOTAO + 62]);
  const inscrito = frame >= inscr;
  const sinoOn = frame >= sino;
  const curtiu = frame >= like;
  const pulso = (de: number) => 1 + 0.12 * Math.sin(Math.min(1, Math.max(0, (frame - de) / 12)) * Math.PI);
  const balanco = frame >= sino && frame < sino + 40 ? Math.sin((frame - sino) * 0.9) * 22 * (1 - (frame - sino) / 40) : 0;
  const letras = Math.round(lerp(frame, [coment + 12, coment + 70], [0, FRASE_COMENTARIO.length], Easing.linear));
  return (
    <AbsoluteFill style={{ backgroundColor: "#0F0F0F" }}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 130px", textAlign: "center", opacity: rampa(frame, entra - 12, entra, [1, 0]) }}>
        <Frase de={at(0)} grande="Reconstruções a partir dos relatórios oficiais" size={84} />
      </AbsoluteFill>
      {frame >= entra && (
        <AbsoluteFill style={{ opacity: rampa(frame, entra, entra + 14) }}>
          <Passo n={1} txt="Inscreva-se" x={X.inscr} de={inscr} />
          <Passo n={2} txt="Ative o sino" x={X.sino} de={sino} />
          <Passo n={3} txt="Deixe o like" x={X.like + 90} de={like} />
          <Passo n={4} txt="Comente" x={X.coment} de={coment} />
          <div style={{ ...pilula(300, 390, inscrito ? "#303030" : "#FF0000"), transform: `scale(${pulso(inscr)})` }}>{inscrito ? "Inscrito" : "Inscrever-se"}</div>
          <div style={{ ...pilula(726, 108, sinoOn ? "#3F3F3F" : "#272727"), transform: `scale(${pulso(sino)})` }}>
            <Icone d={ICONE.sino} cor={sinoOn ? "#FFD400" : "#fff"} style={{ rotate: `${balanco}deg`, transformOrigin: "50% 10%" }} />
          </div>
          <div style={{ ...pilula(880, 370, "#272727"), justifyContent: "flex-start", paddingLeft: 34, boxSizing: "border-box", transform: `scale(${pulso(like)})` }}>
            <Icone d={ICONE.gostei} cor={curtiu ? "#3EA6FF" : "#fff"} />
            <span>Gostei</span>
            <div style={{ width: 2, height: 60, background: "#555", marginLeft: 16 }} />
            <Icone d={ICONE.naoGostei} style={{ marginLeft: 6 }} />
          </div>
          <div style={{ ...pilula(1290, 320, frame >= coment ? "#3F3F3F" : "#272727"), transform: `scale(${pulso(coment)})` }}>
            <Icone d={ICONE.comentario} />Comentar
          </div>
          {[[X.inscr, inscr], [X.sino, sino], [X.like, like], [X.coment, coment]].map(([x, de]) => <Clique key={de} x={x} de={de} />)}
          <div style={{ position: "absolute", left: 300, right: 310, top: Y_BOTAO + 170, opacity: rampa(frame, coment + 2, coment + 12), borderBottom: "3px solid #AAA", padding: "0 0 14px", fontFamily: corpo, fontSize: 42, color: "#F1F1F1", textAlign: "left" }}>
            {FRASE_COMENTARIO.slice(0, letras)}
            {letras < FRASE_COMENTARIO.length && <span style={{ opacity: Math.floor(frame / 8) % 2 }}>|</span>}
          </div>
          <svg width={40} height={50} viewBox="0 0 28 42" style={{ position: "absolute", left: cx, top: cy, overflow: "visible", filter: "drop-shadow(0 3px 6px rgba(0,0,0,.7))" }}>
            <path d="M0 0 L0 34 L9 26 L15 40 L21 37 L15 24 L27 24 Z" fill="#fff" stroke="#111" strokeWidth={1.6} />
          </svg>
        </AbsoluteFill>
      )}
      <Escurece de={c.duracao - 20} ate={c.duracao} />
    </AbsoluteFill>
  );
};
