import { Audio } from "@remotion/media";
import { geoMercator, geoPath } from "d3-geo";
import { FC, ReactNode } from "react";
import { feature } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, Track, useCurrentFrame } from "remotion";
import paises from "world-atlas/countries-50m.json";
import { brl, corpo, Entra, Numero, Rotulo, sobe } from "../panama/Cenas";
import { COR, montar, rampa } from "../panama/timeline";
import roteiro from "./roteiro.json";
import voz from "./voz.json";

export const { CENAS, DURACAO_TOTAL } = montar(roteiro, voz, 5, 6); // ritmo mais rápido para reels
type Cena = (typeof CENAS)[number];

const VERDE = "#2BD18B"; // cor da marca Ueno, só como referência visual
const de = (c: Cena) => ({
  at: (n: number) => c.falas[n].de,
  fim: (n: number) => c.falas[n].de + c.falas[n].duracao,
});

// Área útil do reels: o topo e a base ficam com a interface do app.
const Palco = ({ children }: { children: ReactNode }) => (
  <AbsoluteFill style={{ padding: "250px 90px 560px", alignItems: "center", justifyContent: "center", gap: 46 }}>{children}</AbsoluteFill>
);

const Selo = ({ children, cor = COR.vermelho }: { children: ReactNode; cor?: string }) => (
  <div style={{ fontFamily: corpo, fontWeight: 700, fontSize: 34, color: "#fff", background: cor, padding: "6px 18px", borderRadius: 8, alignSelf: "center" }}>{children}</div>
);

const Gancho: FC<{ c: Cena }> = ({ c }) => {
  const { at } = de(c);
  const itens = [
    { data: "3/11", txt: "BANCO FECHADO" },
    { data: "6/11", txt: "PRESIDENTE DESTITUÍDO" },
    { data: "6/11", txt: "DETIDO EM CASA" },
  ];
  return (
    <Palco>
      {itens.map((it, i) => (
        <Entra key={it.txt} de={i * 34} ate={at(1) - 4} style={{ display: "flex", alignItems: "center", gap: 28, width: "100%" }}>
          <Selo>{it.data}</Selo>
          <Numero size={82} style={{ whiteSpace: "nowrap" }}>{it.txt}</Numero>
        </Entra>
      ))}
      <Entra de={at(1)}>
        <Rotulo cor={COR.texto} size={44} style={{ textAlign: "center" }}>A história do</Rotulo>
        <Numero size={190} cor={VERDE} style={{ textAlign: "center" }}>UENO BANK</Numero>
      </Entra>
    </Palco>
  );
};

const topo = paises as unknown as Topology;
const mundo = feature(topo, topo.objects.countries as GeometryObject) as unknown as GeoJSON.FeatureCollection;
const paraguai = mundo.features.find((f) => f.id === "600") as GeoJSON.Feature;
const proj = geoMercator().fitExtent([[40, 40], [580, 580]], paraguai);
const ASSUNCAO = proj([-57.58, -25.28]) as [number, number];

const Banco: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const clientes = rampa(frame, at(1) + 10, fim(1) - 20, [0, 2.9], sobe);
  return (
    <Palco>
      <Entra de={at(0)} style={{ display: "flex", alignItems: "center", gap: 22, whiteSpace: "nowrap" }}>
        <Rotulo cor={COR.apagado} size={40}>Financeira</Rotulo>
        <Numero size={60} cor={COR.apagado}>→</Numero>
        <Numero size={80} cor={VERDE}>BANCO DIGITAL</Numero>
      </Entra>
      <Entra de={at(0) + 20}><Selo cor="#33475B">licença em 2023</Selo></Entra>
      <svg viewBox="0 0 620 620" style={{ width: 520, opacity: rampa(frame, at(0) + 10, at(0) + 25) }}>
        <path d={geoPath(proj)(paraguai) ?? ""} fill="#1F3A2F" stroke={VERDE} strokeWidth={3} />
        <circle cx={ASSUNCAO[0]} cy={ASSUNCAO[1]} r={11} fill={COR.ouro} />
        <text x={ASSUNCAO[0] - 20} y={ASSUNCAO[1] - 22} textAnchor="end" fill={COR.texto} fontFamily={corpo} fontSize={32}>Assunção</text>
      </svg>
      <Entra de={at(1)} style={{ textAlign: "center" }}>
        <Numero size={150} cor={VERDE}>{clientes.toFixed(1).replace(".", ",")} mi</Numero>
        <Rotulo cor={COR.texto} size={40}>de clientes · país de 6,4 mi de habitantes</Rotulo>
        <div style={{ marginTop: 22, height: 26, borderRadius: 13, background: "rgba(255,255,255,.12)", width: 800 }}>
          <div style={{ height: 26, borderRadius: 13, background: VERDE, width: `${(clientes / 6.4) * 100}%` }} />
        </div>
      </Entra>
    </Palco>
  );
};

const Caixa = ({ children, cor = "#1C3044", borda = COR.borda }: { children: ReactNode; cor?: string; borda?: string }) => (
  <div style={{ background: cor, border: `3px solid ${borda}`, borderRadius: 18, padding: "20px 30px", textAlign: "center" }}>{children}</div>
);

const Quebra: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const fluxo = (frame * 0.035) % 1;
  const reserva = rampa(frame, at(1) + 30, fim(1) - 30, [1, 0.25], Easing.inOut(Easing.quad));
  const bloqueio = rampa(frame, at(2) + 45, at(2) + 60);
  return (
    <Palco>
      {frame < at(1) ? (
        <Entra de={at(0)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Caixa borda={VERDE}><Numero size={74} cor={VERDE}>UENO BANK</Numero></Caixa>
          <svg width={80} height={190} viewBox="0 0 80 190">
            <line x1={40} y1={0} x2={40} y2={170} stroke={COR.ouro} strokeWidth={8} strokeDasharray="18 14" strokeDashoffset={-fluxo * 64} />
            <path d="M14,160 L40,190 L66,160 Z" fill={COR.ouro} />
          </svg>
          <Caixa><Rotulo cor={COR.texto} size={46}>Empresas ligadas<br />aos donos do banco</Rotulo></Caixa>
          <Entra de={fim(0) - 75}><Numero size={64} cor={COR.vermelho} style={{ textAlign: "center", marginTop: 10 }}>SE NÃO PAGAM,<br />O DINHEIRO SOME</Numero></Entra>
          <Rotulo size={32}>alerta do Banco Central em junho de 2026</Rotulo>
        </Entra>
      ) : frame < at(2) ? (
        <Entra de={at(1)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Rotulo cor={COR.texto} size={44}>Reserva obrigatória</Rotulo>
          <Rotulo size={32} style={{ marginTop: -12 }}>dinheiro que todo banco deixa guardado</Rotulo>
          <div style={{ width: 320, height: 520, border: `4px solid ${COR.borda}`, borderRadius: 22, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${reserva * 100}%`, background: `linear-gradient(${COR.ouro}, #B07E12)` }} />
          </div>
          <Numero size={130} cor={COR.vermelho}>− US$ 70 mi</Numero>
          <Rotulo size={34}>não devolvidos · segundo a imprensa local</Rotulo>
        </Entra>
      ) : (
        <Entra de={at(2)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
          <Selo>3 DE NOVEMBRO</Selo>
          <Numero size={100} style={{ textAlign: "center" }}>BANCO CENTRAL<br />ASSUME O BANCO</Numero>
          <div style={{ display: "flex", gap: 30 }}>
            {["APP", "CARTÕES", "CONTAS"].map((t) => (
              <Caixa key={t} borda={bloqueio > 0.5 ? COR.vermelho : COR.borda}>
                <Numero size={52} cor={bloqueio > 0.5 ? COR.vermelho : COR.texto}>{t}</Numero>
              </Caixa>
            ))}
          </div>
          <Numero size={88} cor={COR.vermelho} style={{ opacity: bloqueio, scale: `${1.4 - bloqueio * 0.4}` }}>BLOQUEADOS</Numero>
        </Entra>
      )}
    </Palco>
  );
};

const Pessoa = ({ nome, papel, cor = COR.texto }: { nome: string; papel: string; cor?: string }) => (
  <Caixa>
    <Numero size={64} cor={cor}>{nome}</Numero>
    <Rotulo size={32}>{papel}</Rotulo>
  </Caixa>
);

const Seta = ({ txt }: { txt: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <Numero size={56} cor={COR.ouro}>↓</Numero>
    <Rotulo cor={COR.ouro} size={34}>{txt}</Rotulo>
  </div>
);

const Pena: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const publico = rampa(frame, at(2) + 10, fim(2) - 10, [0, 800], sobe);
  if (frame >= at(2)) {
    return (
      <Palco>
        <Entra de={at(2)} style={{ textAlign: "center" }}>
          <Rotulo cor={COR.texto} size={44}>Dinheiro público no banco</Rotulo>
          <Numero size={170} cor={COR.ouro}>US$ {brl(publico)} mi+</Numero>
          <Rotulo size={36}>inclui recursos da previdência (IPS)</Rotulo>
        </Entra>
      </Palco>
    );
  }
  return (
    <Palco>
      <Entra de={at(0)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Pessoa nome="SANTIAGO PEÑA" papel="presidente do Paraguai (2023–2026)" />
        <Seta txt="sócio até 2025" />
        <Caixa borda={VERDE}><Numero size={56} cor={VERDE}>GRUPO DONO DO UENO</Numero></Caixa>
      </Entra>
      <Entra de={at(1)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Seta txt="nomeou para o Banco Central" />
        <Pessoa nome="CARLOS CARVALLO" papel="ex-chefe do Ueno, foi fiscalizar os bancos" cor={COR.ouro} />
      </Entra>
    </Palco>
  );
};

const Passo = ({ data, titulo, sub, cor = COR.texto }: { data: string; titulo: string; sub: string; cor?: string }) => (
  <div style={{ display: "flex", gap: 26, alignItems: "flex-start", width: "100%" }}>
    <Selo cor="#33475B">{data}</Selo>
    <div>
      <Numero size={70} cor={cor}>{titulo}</Numero>
      <Rotulo size={32}>{sub}</Rotulo>
    </div>
  </div>
);

const Queda: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const votos = Math.round(rampa(frame, at(1) + 20, fim(1) - 20, [0, 44]));
  return (
    <Palco>
      <Entra de={at(0)}><Passo data="5/11" titulo="RENUNCIOU" sub="mas o Congresso decidiu julgá-lo mesmo assim" /></Entra>
      <Entra de={at(1)} style={{ width: "100%" }}>
        <Passo data="6/11" titulo={`DESTITUÍDO · ${votos} VOTOS`} sub="no Senado, por mau desempenho das funções" cor={COR.vermelho} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(15, 36px)", gap: 10, marginTop: 20, marginLeft: 150 }}>
          {Array.from({ length: 45 }, (_, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 18, background: i < votos ? COR.vermelho : "rgba(255,255,255,.12)" }} />
          ))}
        </div>
      </Entra>
      <Entra de={fim(1) - 55}><Passo data="6/11" titulo="PEDRO ALLIANA ASSUME" sub="vice-presidente, mandato até 2028" /></Entra>
      <Entra de={at(2)}><Passo data="6/11" titulo="DETENÇÃO ORDENADA" sub="Peña e Carvallo · investigados, não condenados" cor={COR.ouro} /></Entra>
    </Palco>
  );
};

const Fim: FC<{ c: Cena }> = ({ c }) => {
  const frame = useCurrentFrame();
  const { at, fim } = de(c);
  const garantia = rampa(frame, at(0) + 40, fim(0) - 20, [0, 38], sobe);
  return (
    <Palco>
      <Entra de={at(0)} ate={at(1) - 6} style={{ textAlign: "center" }}>
        <Rotulo cor={COR.texto} size={44}>Fundo de garantia</Rotulo>
        <Numero size={150} cor={VERDE} style={{ whiteSpace: "nowrap" }}>até US$ {Math.round(garantia)} mil</Numero>
        <Rotulo cor={COR.texto} size={40}>por pessoa · pagos aos poucos</Rotulo>
      </Entra>
      <Entra de={at(1)} style={{ textAlign: "center" }}>
        <Numero size={120}>SEGUE PARA O<br /><span style={{ color: VERDE }}>PRÓXIMO CAPÍTULO</span></Numero>
      </Entra>
    </Palco>
  );
};

const COMPONENTES: Record<string, FC<{ c: Cena }>> = { gancho: Gancho, banco: Banco, quebra: Quebra, pena: Pena, queda: Queda, fim: Fim };

const Legendas = () => {
  const frame = useCurrentFrame();
  const c = CENAS.find((x) => frame < x.inicio + x.duracao);
  const fala = c?.falas.find((f) => frame >= c.inicio + f.de && frame < c.inicio + f.de + f.duracao);
  if (!fala) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 400, paddingLeft: 60, paddingRight: 150 }}>
      <div style={{ fontFamily: corpo, fontWeight: 700, fontSize: 44, lineHeight: 1.28, textAlign: "center", color: "#fff", background: "rgba(5,12,20,.78)", padding: "12px 24px", borderRadius: 12 }}>
        {fala.legenda}
      </div>
    </AbsoluteFill>
  );
};

const Fundo = () => {
  const frame = useCurrentFrame();
  // Leve movimento no fundo para o quadro nunca ficar parado.
  const y = interpolate(frame, [0, DURACAO_TOTAL], [0, -400]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${40 + Math.sin(frame / 90) * 6}%, #12304A 0%, ${COR.oceano} 60%)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.035) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,.035) 2px, transparent 2px)", backgroundSize: "90px 90px", backgroundPosition: `0 ${y}px` }} />
    </AbsoluteFill>
  );
};

export const UenoReels = () => (
  <AbsoluteFill>
    <Fundo />
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
          <Audio key={f.id} name={f.id} src={staticFile(`voz-ueno/${f.id}.mp3`)} from={c.inicio + f.de} durationInFrames={f.duracao} />
        )),
      )}
    </Track>
    <Track name="Música">
      <Audio
        name="trilha"
        src={staticFile("panama-musica.mp3")}
        durationInFrames={DURACAO_TOTAL}
        volume={(f) => 0.14 * interpolate(f, [DURACAO_TOTAL - 40, DURACAO_TOTAL], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
    </Track>
    <Track name="Transições">
      {CENAS.slice(1).map((c) => (
        <Sequence key={c.id} name={`whoosh ${c.id}`} from={c.inicio - 8} durationInFrames={40} layout="none">
          <Audio src="https://remotion.media/whoosh.wav" volume={0.18} />
        </Sequence>
      ))}
    </Track>
  </AbsoluteFill>
);
