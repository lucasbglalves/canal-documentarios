import { ReactNode } from "react";
import { DoubleSide } from "three";
import { useCurrentFrame } from "remotion";
import { Quem, useCena, V3 } from "./timeline";

const PELE = "#FFC9A0";
const TINTA = "#2A1A1F";

export type Humor = "neutro" | "feliz" | "triste" | "chorando" | "assustado" | "bravo";

const Bola = ({
  p,
  s = [1, 1, 1],
  r = 1,
  c,
  rot,
  emissivo,
}: {
  p: V3;
  s?: V3;
  r?: number;
  c: string;
  rot?: V3;
  emissivo?: number;
}) => (
  <mesh position={p} scale={s} rotation={rot} castShadow>
    <sphereGeometry args={[r, 32, 24]} />
    <meshStandardMaterial
      color={c}
      roughness={0.5}
      emissive={emissivo ? c : "#000"}
      emissiveIntensity={emissivo ?? 0}
    />
  </mesh>
);

const Membro = ({
  p,
  rot,
  raio,
  comp,
  c,
  children,
}: {
  p: V3;
  rot: V3;
  raio: number;
  comp: number;
  c: string;
  children?: ReactNode;
}) => (
  <group position={p} rotation={rot}>
    <mesh position={[0, -comp / 2, 0]} castShadow>
      <capsuleGeometry args={[raio, comp, 8, 16]} />
      <meshStandardMaterial color={c} roughness={0.5} />
    </mesh>
    <group position={[0, -comp, 0]}>{children}</group>
  </group>
);

const Olho = ({ x, abre, olhar, cor }: { x: number; abre: number; olhar: number; cor: string }) => (
  <group position={[x, 1.46, 0.5]} scale={[1, abre, 1]}>
    <Bola p={[0, 0, 0]} r={0.165} c="#fff" />
    <Bola p={[olhar, 0, 0.1]} r={0.1} c={cor} />
    <Bola p={[olhar, 0, 0.15]} r={0.06} c={TINTA} />
    <Bola p={[olhar + 0.035, 0.04, 0.2]} r={0.022} c="#fff" />
  </group>
);

const Boca = ({ abre, humor, y = 1.13, z = 0.59 }: { abre: number; humor: Humor; y?: number; z?: number }) => {
  if (humor === "chorando" || humor === "assustado" || abre > 0.05) {
    const base = humor === "chorando" ? 0.13 : humor === "assustado" ? 0.11 : 0.02;
    return (
      <group position={[0, y, z]}>
        <Bola p={[0, 0, 0]} s={[humor === "assustado" ? 0.1 : 0.17, base + abre * 0.15, 0.05]} c="#6B1D2B" />
        <Bola p={[0, -(base + abre * 0.15) * 0.55, 0.02]} s={[0.09, Math.max(0.01, (base + abre * 0.15) * 0.3), 0.03]} c="#F2797F" />
      </group>
    );
  }
  const triste = humor === "triste" || humor === "bravo";
  return (
    <mesh position={[0, triste ? y - 0.06 : y + 0.05, z]} rotation={[0, 0, triste ? 0 : Math.PI]}>
      <torusGeometry args={[humor === "feliz" ? 0.15 : 0.1, 0.024, 8, 20, Math.PI]} />
      <meshStandardMaterial color="#6B1D2B" />
    </mesh>
  );
};

const Panela = () => (
  <group position={[0, 1.94, -0.02]} rotation={[-0.08, 0, 0.09]}>
    <mesh castShadow>
      <cylinderGeometry args={[0.6, 0.58, 0.42, 40]} />
      <meshStandardMaterial color="#4A4F57" metalness={0.75} roughness={0.32} />
    </mesh>
    <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.6, 0.045, 12, 40]} />
      <meshStandardMaterial color="#6B717A" metalness={0.75} roughness={0.32} />
    </mesh>
    <mesh position={[0, 0.215, 0]}>
      <cylinderGeometry args={[0.6, 0.6, 0.02, 40]} />
      <meshStandardMaterial color="#5A5F67" metalness={0.75} roughness={0.32} />
    </mesh>
    <mesh position={[0.92, 0.05, 0]} castShadow>
      <boxGeometry args={[0.72, 0.09, 0.14]} />
      <meshStandardMaterial color="#20232A" roughness={0.6} />
    </mesh>
  </group>
);

const Topete = () => (
  <group position={[0, 2.0, 0.08]}>
    {[-0.5, -0.15, 0.2, 0.55].map((giro, i) => (
      <mesh key={giro} position={[giro * 0.2, 0.02 + (i % 2) * 0.03, 0]} rotation={[0.25, 0, -giro]}>
        <capsuleGeometry args={[0.045, 0.2, 6, 10]} />
        <meshStandardMaterial color="#D9974F" roughness={0.6} />
      </mesh>
    ))}
  </group>
);

const Lagrimas = ({ frame }: { frame: number }) => (
  <>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const t = ((frame + i * 7) % 28) / 28;
      const lado = i % 2 ? 0.26 : -0.26;
      return (
        <Bola
          key={i}
          p={[lado * (1 + t * 0.25), 1.34 - t * 0.85, 0.56 + t * 0.1]}
          s={[0.55, 0.85, 0.55]}
          r={0.07}
          c="#5AC8FA"
        />
      );
    })}
  </>
);

export type BebeProps = {
  quem: "tommy" | "nico";
  p: V3;
  /** Yaw in radians; 0 faces the camera side (+z). */
  giro?: number;
  humor?: Humor;
  /** Leg-swing speed; 0 stands still, 0.45 walks, 0.75 runs. */
  anda?: number;
  /** 0 = arms down, 1 = arms up. */
  bracos?: number;
  /** 0 to 1: leans forward and swings harder, for running. */
  corrida?: number;
  inclina?: number;
  escala?: number;
  /** Raises one finger to the lips ("shhh"). */
  segredo?: boolean;
  olhar?: number;
  /** Crawl pose, body pitched forward. */
  engatinha?: boolean;
};

export const Bebe = ({
  quem,
  p,
  giro = 0,
  humor = "neutro",
  anda = 0,
  bracos = 0,
  corrida = 0,
  inclina = 0,
  escala = 1,
  segredo = false,
  olhar = 0,
  engatinha = false,
}: BebeProps) => {
  const frame = useCurrentFrame();
  const { boca } = useCena();
  const fase = quem === "nico" ? 1.7 : 0;
  const abre = boca(quem);
  const piscar = (frame + (quem === "nico" ? 31 : 7)) % 83;
  const palpebra = piscar < 3 ? 0.12 : piscar < 5 ? 0.55 : humor === "assustado" ? 1.18 : 1;
  const passo = anda ? Math.sin(frame * anda + fase) : 0;
  const pulo = anda ? Math.abs(Math.cos(frame * anda + fase)) * (0.07 + corrida * 0.14) : 0;
  const respira = Math.sin(frame * 0.09 + fase) * 0.012;
  const tremor = humor === "assustado" ? Math.sin(frame * 1.9) * 0.012 : 0;
  const cabeca = Math.sin(frame * 0.07 + fase) * 0.035 + abre * 0.07 * Math.sin(frame * 0.55);
  const abertura = 0.14 + bracos * 2.55;
  const gesto = abre * 0.3 * Math.sin(frame * 0.4);
  const amplitude = 0.6 + corrida * 0.5;
  const braco = (lado: 1 | -1): V3 =>
    engatinha
      ? [-1.25 + passo * lado * 0.45, 0, 0]
      : [
          -passo * lado * amplitude + (bracos > 0.5 ? Math.sin(frame * 0.35 + lado) * 0.14 : 0) + (lado === 1 ? gesto : 0),
          0,
          lado * abertura,
        ];

  return (
    <group position={p} rotation={[0, giro, 0]} scale={escala}>
      <group
        position={[tremor, pulo + (engatinha ? -0.15 : 0), 0]}
        rotation={[engatinha ? 1.05 : corrida * 0.24 + inclina, 0, 0]}
        scale={[1 - respira, 1 + respira, 1 - respira]}
      >
        <Bola p={[0, 0.66, 0]} s={[0.47, 0.5, 0.42]} c={PELE} />
        <Bola p={[0, 0.5, 0]} s={[0.5, 0.36, 0.45]} c="#F7F4EE" />
        <Bola p={[-0.2, 0.62, 0.34]} s={[0.1, 0.06, 0.04]} c="#7CC6E8" />
        <Bola p={[0.2, 0.62, 0.34]} s={[0.1, 0.06, 0.04]} c="#7CC6E8" />

        <Membro p={[-0.18, 0.28, 0]} rot={[engatinha ? -1.1 : passo * amplitude, 0, 0.04]} raio={0.13} comp={0.13} c={PELE}>
          <Bola p={[0, -0.05, 0.06]} s={[0.14, 0.09, 0.2]} c={PELE} />
        </Membro>
        <Membro p={[0.18, 0.28, 0]} rot={[engatinha ? -1.1 : -passo * amplitude, 0, -0.04]} raio={0.13} comp={0.13} c={PELE}>
          <Bola p={[0, -0.05, 0.06]} s={[0.14, 0.09, 0.2]} c={PELE} />
        </Membro>

        <Membro p={[-0.42, 0.84, 0]} rot={braco(-1)} raio={0.095} comp={0.3} c={PELE}>
          <Bola p={[0, -0.06, 0]} r={0.12} c={PELE} />
        </Membro>
        {segredo ? (
          <Membro p={[0.42, 0.84, 0.05]} rot={[-2.25, 0, 0.55]} raio={0.095} comp={0.3} c={PELE}>
            <Bola p={[0, -0.04, 0]} r={0.12} c={PELE} />
            <Bola p={[0, -0.16, 0]} s={[0.4, 1, 0.4]} r={0.09} c={PELE} />
          </Membro>
        ) : (
          <Membro p={[0.42, 0.84, 0]} rot={braco(1)} raio={0.095} comp={0.3} c={PELE}>
            <Bola p={[0, -0.06, 0]} r={0.12} c={PELE} />
          </Membro>
        )}

        <group position={[0, 1.05, 0]} rotation={[engatinha ? -0.85 : 0, Math.sin(frame * 0.05 + fase) * 0.06, cabeca]}>
          <group position={[0, -1.05, 0]}>
            <Bola p={[0, 1.42, 0]} s={[0.66, 0.63, 0.62]} c={PELE} />
            <Bola p={[-0.65, 1.4, 0]} s={[0.1, 0.15, 0.08]} c={PELE} />
            <Bola p={[0.65, 1.4, 0]} s={[0.1, 0.15, 0.08]} c={PELE} />
            <Bola p={[-0.4, 1.22, 0.42]} s={[0.13, 0.09, 0.06]} c="#FF9D9D" />
            <Bola p={[0.4, 1.22, 0.42]} s={[0.13, 0.09, 0.06]} c="#FF9D9D" />
            <Bola p={[0, 1.3, 0.62]} s={[0.06, 0.045, 0.045]} c="#F5AE82" />

            <Olho x={-0.23} abre={palpebra} olhar={olhar} cor="#3C8DDE" />
            <Olho x={0.23} abre={palpebra} olhar={olhar} cor="#3C8DDE" />

            <mesh
              position={[-0.23, humor === "assustado" ? 1.74 : 1.68, 0.55]}
              rotation={[0, 0, Math.PI / 2 + (humor === "bravo" ? -0.45 : humor === "triste" || humor === "chorando" ? 0.45 : 0.08)]}
            >
              <capsuleGeometry args={[0.022, 0.2, 4, 8]} />
              <meshStandardMaterial color="#B9834D" />
            </mesh>
            <mesh
              position={[0.23, humor === "assustado" ? 1.74 : 1.68, 0.55]}
              rotation={[0, 0, Math.PI / 2 + (humor === "bravo" ? 0.45 : humor === "triste" || humor === "chorando" ? -0.45 : -0.08)]}
            >
              <capsuleGeometry args={[0.022, 0.2, 4, 8]} />
              <meshStandardMaterial color="#B9834D" />
            </mesh>

            <Boca abre={abre} humor={humor} />
            {quem === "nico" ? <Panela /> : <Topete />}
            {humor === "chorando" ? <Lagrimas frame={frame} /> : null}
          </group>
        </group>
      </group>
    </group>
  );
};

export type AdultoProps = {
  quem: Extract<Quem, "pai" | "professora">;
  p: V3;
  giro?: number;
  humor?: Humor;
  anda?: number;
  /** 0 to 1: raises the right arm to point. */
  aponta?: number;
};

export const Adulto = ({ quem, p, giro = 0, humor = "bravo", anda = 0, aponta = 0 }: AdultoProps) => {
  const frame = useCurrentFrame();
  const { boca } = useCena();
  const abre = boca(quem);
  const professora = quem === "professora";
  const camisa = professora ? "#7B3FA0" : "#2E8B7A";
  const calca = professora ? "#3A2A5C" : "#34495E";
  const cabelo = professora ? "#8A3B1E" : "#3A2A1E";
  const passo = anda ? Math.sin(frame * anda) : 0;
  const piscar = (frame + 19) % 97;
  const palpebra = piscar < 3 ? 0.12 : 1;
  const sobrancelha = humor === "bravo" ? 0.4 : 0;

  return (
    <group position={p} rotation={[0, giro, 0]}>
      <Membro p={[-0.26, 1.5, 0]} rot={[passo * 0.6, 0, 0]} raio={0.17} comp={1.2} c={calca}>
        <Bola p={[0, -0.1, 0.1]} s={[0.2, 0.13, 0.33]} c="#222" />
      </Membro>
      <Membro p={[0.26, 1.5, 0]} rot={[-passo * 0.6, 0, 0]} raio={0.17} comp={1.2} c={calca}>
        <Bola p={[0, -0.1, 0.1]} s={[0.2, 0.13, 0.33]} c="#222" />
      </Membro>
      <group position={[0, Math.abs(Math.cos(frame * anda)) * (anda ? 0.05 : 0), 0]}>
        <mesh position={[0, 2.15, 0]} castShadow>
          <capsuleGeometry args={[0.47, 0.62, 10, 24]} />
          <meshStandardMaterial color={camisa} roughness={0.6} />
        </mesh>
        <Membro p={[-0.58, 2.65, 0]} rot={[-passo * 0.5 + abre * 0.4 * Math.sin(frame * 0.3), 0, -0.14]} raio={0.13} comp={0.95} c={camisa}>
          <Bola p={[0, -0.08, 0]} r={0.15} c={PELE} />
        </Membro>
        <Membro p={[0.58, 2.65, 0]} rot={[-aponta * 1.55 + passo * 0.5, 0, 0.14 - aponta * 0.1]} raio={0.13} comp={0.95} c={camisa}>
          <Bola p={[0, -0.08, 0]} r={0.15} c={PELE} />
        </Membro>

        <group position={[0, 1.88, 0]} rotation={[0, 0, Math.sin(frame * 0.05) * 0.03 + abre * 0.03 * Math.sin(frame * 0.5)]}>
          <Bola p={[0, 1.42, 0]} s={[0.55, 0.6, 0.53]} c={PELE} />
          <Bola p={[0, 1.76, -0.08]} s={[0.55, 0.32, 0.46]} c={cabelo} />
          {professora ? <Bola p={[0, 2.04, -0.14]} r={0.2} c={cabelo} /> : null}
          <group position={[0, 0.02, 0.03]} scale={[0.85, 1, 0.85]}>
            <Olho x={-0.2} abre={palpebra} olhar={0} cor={professora ? "#3A7D44" : "#5A3B20"} />
            <Olho x={0.2} abre={palpebra} olhar={0} cor={professora ? "#3A7D44" : "#5A3B20"} />
          </group>
          <mesh position={[-0.19, 1.6, 0.46]} rotation={[0, 0, Math.PI / 2 - sobrancelha]}>
            <capsuleGeometry args={[0.03, 0.2, 4, 8]} />
            <meshStandardMaterial color={cabelo} />
          </mesh>
          <mesh position={[0.19, 1.6, 0.46]} rotation={[0, 0, Math.PI / 2 + sobrancelha]}>
            <capsuleGeometry args={[0.03, 0.2, 4, 8]} />
            <meshStandardMaterial color={cabelo} />
          </mesh>
          <Bola p={[0, 1.34, 0.53]} s={[0.07, 0.07, 0.07]} c="#F5AE82" />
          <Boca abre={abre} humor={humor} y={1.14} z={0.5} />
        </group>
      </group>
    </group>
  );
};

export const Pato = ({ p, escala = 1, rot = [0, 0, 0] }: { p: V3; escala?: number; rot?: V3 }) => (
  <group position={p} scale={escala} rotation={rot}>
    <Bola p={[0, 0.17, 0]} s={[0.22, 0.17, 0.27]} c="#FFD93D" />
    <Bola p={[0, 0.39, 0.12]} r={0.13} c="#FFD93D" />
    <Bola p={[0, 0.37, 0.26]} s={[0.07, 0.03, 0.06]} c="#FF8C1A" />
    <Bola p={[-0.06, 0.43, 0.23]} r={0.02} c={TINTA} />
    <Bola p={[0.06, 0.43, 0.23]} r={0.02} c={TINTA} />
  </group>
);

const Vaso = ({ tampa = 0 }: { tampa?: number }) => (
  <>
    <mesh position={[0, 0.42, 0]} castShadow>
      <cylinderGeometry args={[0.72, 0.42, 0.85, 32]} />
      <meshStandardMaterial color="#F4F6F8" roughness={0.25} />
    </mesh>
    <mesh position={[0, 0.86, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <torusGeometry args={[0.62, 0.11, 12, 32]} />
      <meshStandardMaterial color="#E4E8EC" roughness={0.3} />
    </mesh>
    <mesh position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.6, 32]} />
      <meshStandardMaterial color="#3FA7D6" roughness={0.2} />
    </mesh>
    <mesh position={[0, 1.45, -0.75]} castShadow>
      <boxGeometry args={[1.3, 1.25, 0.45]} />
      <meshStandardMaterial color="#F4F6F8" roughness={0.25} />
    </mesh>
    <mesh position={[0.45, 1.86, -0.51]}>
      <boxGeometry args={[0.24, 0.07, 0.07]} />
      <meshStandardMaterial color="#AEB6BF" metalness={0.8} roughness={0.3} />
    </mesh>
    <group position={[0, 0.96, -0.62]} rotation={[-tampa * 1.45, 0, 0]}>
      <mesh position={[0, 0, 0.62]} scale={[1, 0.08, 1]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 1, 32]} />
        <meshStandardMaterial color="#DCE1E6" roughness={0.3} side={DoubleSide} />
      </mesh>
    </group>
  </>
);

export const Privada = ({ p, giro = 0, tampa = 0 }: { p: V3; giro?: number; tampa?: number }) => (
  <group position={p} rotation={[0, giro, 0]}>
    <Vaso tampa={tampa} />
  </group>
);

export const Monstro = ({
  p,
  giro = 0,
  escala = 1.5,
  feliz = false,
  pulo = 0,
  abre = 0,
  acorda = 1,
  tremor = 0,
}: {
  p: V3;
  giro?: number;
  escala?: number;
  feliz?: boolean;
  /** Current hop height, 0 on the ground. */
  pulo?: number;
  abre?: number;
  /** 0 = plain toilet, 1 = fully awake. */
  acorda?: number;
  tremor?: number;
}) => {
  const frame = useCurrentFrame();
  const { boca } = useCena();
  const fala = Math.max(boca("monstro"), abre);
  const achata = pulo > 0.02 ? 1 + Math.min(pulo * 0.1, 0.12) : 1;
  const corOlho = feliz ? "#49C6E5" : "#FF2E2E";
  const shake = Math.sin(frame * 2.1) * tremor;
  const tampa = Math.min(0.62, acorda * 0.22 + fala * 0.4);

  return (
    <group position={[p[0] + shake, p[1] + pulo, p[2]]} rotation={[0, giro, shake * 0.3]} scale={[escala / achata, escala * achata, escala / achata]}>
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <group key={`${x}${z}`} scale={[acorda, acorda, acorda]}>
            <Membro p={[x * 0.46, 0.25, z * 0.3 - 0.1]} rot={[z * 0.45, 0, -x * 0.55]} raio={0.1} comp={0.42} c="#223">
              <Bola p={[0, -0.05, 0]} s={[0.15, 0.08, 0.2]} c="#111" />
            </Membro>
          </group>
        )),
      )}
      <group position={[0, 0.22 * acorda, 0]}>
        <Vaso tampa={tampa} />
        {acorda > 0.1 ? (
          <>
            <Bola p={[0, 0.85, 0]} s={[0.58, 0.05, 0.58]} c={feliz ? "#3FA7D6" : "#5FD068"} />
            <mesh position={[0, 0.92, 0.1]} rotation={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.46, 0.5, 0.02 + fala * 0.5, 24, 1, true]} />
              <meshStandardMaterial color="#201018" side={DoubleSide} />
            </mesh>
            <Bola p={[0, 0.93 + fala * 0.08, 0.3]} s={[0.26, 0.05, 0.3]} c="#E8505B" />
            {[-0.42, -0.21, 0, 0.21, 0.42].map((x) => (
              <mesh key={x} position={[x, 0.97, 0.53 - Math.abs(x) * 0.3]} rotation={[Math.PI, 0, 0]} scale={[1, 0.3 + fala, 1]}>
                <coneGeometry args={[0.07, 0.18, 10]} />
                <meshStandardMaterial color="#fff" roughness={0.3} />
              </mesh>
            ))}
            <group position={[0, 2.5, -0.68]} scale={[acorda, acorda, acorda]}>
              {[-0.34, 0.34].map((x) => (
                <group key={x} position={[x, 0, 0]}>
                  <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.07, 0.09, 0.4, 12]} />
                    <meshStandardMaterial color="#E4E8EC" roughness={0.3} />
                  </mesh>
                  <Bola p={[0, 0, 0]} r={0.27} c="#FFF7D6" />
                  <Bola p={[x * 0.08, 0, 0.2]} r={0.13} c={corOlho} emissivo={1.2} />
                  <Bola p={[x * 0.08, 0, 0.3]} r={0.06} c={TINTA} />
                  {feliz ? null : (
                    <mesh position={[0, 0.2, 0.22]} rotation={[0, 0, x > 0 ? 0.5 : -0.5]}>
                      <boxGeometry args={[0.52, 0.09, 0.08]} />
                      <meshStandardMaterial color="#223" />
                    </mesh>
                  )}
                </group>
              ))}
            </group>
          </>
        ) : null}
      </group>
    </group>
  );
};
