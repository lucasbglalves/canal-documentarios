import { random, useCurrentFrame } from "remotion";
import { mix, V3 } from "./timeline";

export const Bloco = ({ p, s, c, rot, rough = 0.8 }: { p: V3; s: V3; c: string; rot?: V3; rough?: number }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} roughness={rough} />
  </mesh>
);

const Chao = ({ c, tam = 120 }: { c: string; tam?: number }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
    <planeGeometry args={[tam, tam]} />
    <meshStandardMaterial color={c} roughness={0.95} />
  </mesh>
);

/** Shared key light: gives the shadows that sell the 3D look. */
export const Luz = ({
  ambiente = 1.1,
  sol = 2.4,
  corSol = "#FFF4DD",
  ceu = "#CFE8FF",
  terra = "#7A6A55",
}: {
  ambiente?: number;
  sol?: number;
  corSol?: string;
  ceu?: string;
  terra?: string;
}) => (
  <>
    <hemisphereLight args={[ceu, terra, ambiente]} />
    <directionalLight
      position={[7, 13, 9]}
      intensity={sol}
      color={corSol}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-16}
      shadow-camera-right={16}
      shadow-camera-top={16}
      shadow-camera-bottom={-16}
      shadow-camera-far={45}
      shadow-bias={-0.0006}
    />
  </>
);

const Nuvem = ({ p, s = 1 }: { p: V3; s?: number }) => (
  <group position={p} scale={s}>
    {([[0, 0, 0, 1.2], [1.2, -0.15, 0, 0.9], [-1.2, -0.2, 0, 0.85], [0.3, 0.5, 0, 0.8]] as const).map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <sphereGeometry args={[r, 20, 16]} />
        <meshStandardMaterial color="#fff" roughness={1} />
      </mesh>
    ))}
  </group>
);

const Arvore = ({ p, s = 1 }: { p: V3; s?: number }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 1.1, 0]} castShadow>
      <cylinderGeometry args={[0.22, 0.3, 2.2, 12]} />
      <meshStandardMaterial color="#6E4A2B" />
    </mesh>
    <mesh position={[0, 2.9, 0]} castShadow>
      <sphereGeometry args={[1.35, 20, 16]} />
      <meshStandardMaterial color="#3EA653" roughness={0.9} />
    </mesh>
    <mesh position={[0.7, 2.4, 0.3]} castShadow>
      <sphereGeometry args={[0.85, 20, 16]} />
      <meshStandardMaterial color="#4DB862" roughness={0.9} />
    </mesh>
  </group>
);

const Ceu = ({ cor, nuvens = true }: { cor: string; nuvens?: boolean }) => {
  const frame = useCurrentFrame();
  const v = frame * 0.004;
  return (
    <>
      <color attach="background" args={[cor]} />
      <fog attach="fog" args={[cor, 28, 75]} />
      {nuvens ? (
        <>
          <Nuvem p={[-13 + v, 12, -28]} s={1.8} />
          <Nuvem p={[9 + v, 15, -32]} s={2.2} />
          <Nuvem p={[22 + v, 11, -34]} s={1.5} />
        </>
      ) : null}
    </>
  );
};

/** Home bathroom. `agua` is the flood height in world units. */
export const BanheiroCasa = ({ agua = 0 }: { agua?: number }) => {
  const frame = useCurrentFrame();
  return (
    <>
      <color attach="background" args={["#BFE3F2"]} />
      <Luz ambiente={1.3} sol={2} />
      {new Array(144).fill(true).map((_, i) => {
        const x = (i % 12) - 5.5;
        const z = Math.floor(i / 12) - 7.5;
        return (
          <mesh key={i} position={[x * 1.3, -0.02, z * 1.3]} receiveShadow>
            <boxGeometry args={[1.28, 0.04, 1.28]} />
            <meshStandardMaterial color={(Math.floor(i / 12) + i) % 2 ? "#F5F7F8" : "#9ED2DF"} roughness={0.35} />
          </mesh>
        );
      })}
      <Bloco p={[0, 4, -7]} s={[20, 8, 0.3]} c="#DDF1F6" />
      <Bloco p={[0, 1.2, -6.8]} s={[20, 2.4, 0.1]} c="#6FB9CC" />
      <Bloco p={[-8, 4, 0]} s={[0.3, 8, 16]} c="#CFEAF1" />
      <Bloco p={[8, 4, 0]} s={[0.3, 8, 16]} c="#CFEAF1" />
      <Bloco p={[4.4, 2.3, -6.8]} s={[2.4, 4.6, 0.25]} c="#8B5E3C" />
      <Bloco p={[-4.5, 4.6, -6.8]} s={[2.2, 2.2, 0.2]} c="#FFF" />
      <Bloco p={[-4.5, 4.6, -6.68]} s={[1.8, 1.8, 0.1]} c="#8ED6F5" />
      <Bloco p={[-6, 0.65, -3.6]} s={[3, 1.3, 5.6]} c="#FDFDFD" rough={0.25} />
      <Bloco p={[-6, 1.32, -3.6]} s={[2.4, 0.05, 5]} c="#59BDE0" rough={0.15} />
      <Bloco p={[5.9, 1.1, -2.2]} s={[2, 2.2, 1.6]} c="#E8D5B5" />
      <Bloco p={[5.9, 2.26, -2.2]} s={[2.2, 0.12, 1.8]} c="#FFF" rough={0.3} />
      {agua > 0 ? (
        <mesh position={[0, agua + Math.sin(frame * 0.15) * 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 16, 1, 1]} />
          <meshStandardMaterial color="#35A7E0" transparent opacity={0.72} roughness={0.1} metalness={0.2} />
        </mesh>
      ) : null}
    </>
  );
};

const Casa = ({ porta }: { porta: number }) => (
  <group position={[0, 0, -7]}>
    <Bloco p={[0, 3.2, 0]} s={[14, 6.4, 7]} c="#F2D7A6" />
    <mesh position={[0, 8, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1.48, 1, 0.75]} castShadow>
      <coneGeometry args={[7.4, 3.6, 4]} />
      <meshStandardMaterial color="#B5472F" roughness={0.8} />
    </mesh>
    <Bloco p={[0, 1.95, 3.53]} s={[2.5, 3.9, 0.12]} c="#3A2418" />
    <group position={[-1.1, 0, 3.6]} rotation={[0, -porta * 1.75, 0]}>
      <Bloco p={[1.1, 1.9, 0]} s={[2.2, 3.8, 0.14]} c="#2F7DB5" />
      <mesh position={[1.9, 1.85, 0.12]}>
        <sphereGeometry args={[0.11, 12, 10]} />
        <meshStandardMaterial color="#FFD93D" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
    {[-4.6, 4.6].map((x) => (
      <group key={x}>
        <Bloco p={[x, 3.5, 3.52]} s={[2.5, 2.5, 0.1]} c="#FFF" />
        <Bloco p={[x, 3.5, 3.58]} s={[2.1, 2.1, 0.08]} c="#8ED6F5" />
      </group>
    ))}
  </group>
);

const Cerca = () => (
  <>
    {new Array(21).fill(true).map((_, i) => (
      <group key={i}>
        <Bloco p={[-22 + i * 2.2, 0.8, -4]} s={[0.35, 1.6, 0.14]} c="#FFF8EC" />
      </group>
    ))}
  </>
);

export const Quintal = ({
  porta = 0,
  ceu = "#6EC6FF",
  grama = "#5FBF4A",
  sol = 2.5,
  corSol = "#FFF4DD",
}: {
  porta?: number;
  ceu?: string;
  grama?: string;
  sol?: number;
  corSol?: string;
}) => (
  <>
    <Ceu cor={ceu} />
    <Luz sol={sol} corSol={corSol} ceu={ceu} />
    <Chao c={grama} />
    <Bloco p={[0, 0.02, 2]} s={[3, 0.04, 14]} c="#C9B79C" />
    <Casa porta={porta} />
    <Cerca />
    <Arvore p={[-11, 0, -5.5]} s={1.5} />
    <Arvore p={[11.5, 0, -6]} s={1.8} />
    <Arvore p={[-17, 0, -12]} s={2} />
    <Arvore p={[18, 0, -14]} s={2.2} />
  </>
);

const Carteira = ({ p }: { p: V3 }) => (
  <group position={p}>
    <Bloco p={[0, 1.15, 0]} s={[1.9, 0.12, 1.1]} c="#D9A066" />
    <Bloco p={[-0.8, 0.55, 0]} s={[0.1, 1.1, 0.9]} c="#7B8794" />
    <Bloco p={[0.8, 0.55, 0]} s={[0.1, 1.1, 0.9]} c="#7B8794" />
    <Bloco p={[0, 0.65, 0.95]} s={[1.1, 0.1, 0.8]} c="#E58F4B" />
    <Bloco p={[-0.48, 0.32, 0.95]} s={[0.1, 0.65, 0.7]} c="#7B8794" />
    <Bloco p={[0.48, 0.32, 0.95]} s={[0.1, 0.65, 0.7]} c="#7B8794" />
  </group>
);

/** Classroom. `queda` (0-1) drops the bricks of the right wall, opening the escape hole. */
export const SalaDeAula = ({ queda = 0, tremor = 0 }: { queda?: number; tremor?: number }) => {
  const tijolos = [];
  for (let y = 0; y < 8; y++) {
    for (let z = 0; z < 7; z++) {
      const seed = `${y}-${z}`;
      const atraso = random(`t-${seed}`) * 0.5;
      const t = mix(queda, [atraso, atraso + 0.5], [0, 1]);
      tijolos.push(
        <Bloco
          key={seed}
          p={[
            7.85 - t * (0.6 + random(`x-${seed}`) * 1.2),
            Math.max(0.3, 0.3 + y * 0.6 + t * (1.5 - t * (2 + y * 0.6 + 1.5))),
            -2.1 + z * 0.75 + (y % 2) * 0.2 + t * (random(`z-${seed}`) - 0.5),
          ]}
          s={[0.5, 0.56, 0.72]}
          c={random(`c-${seed}`) > 0.5 ? "#C65A3A" : "#B24C31"}
          rot={[t * 1.4, t * 2, t * 0.8]}
        />,
      );
    }
  }
  return (
    <>
      <color attach="background" args={["#DDEBC8"]} />
      <Luz ambiente={1.35} sol={1.9} ceu="#FFF3D1" />
      <Chao c="#C99A62" tam={50} />
      <Bloco p={[0, 4.4, -7]} s={[18, 8.8, 0.3]} c="#EFE3B8" />
      <Bloco p={[-8, 4.4, 0]} s={[0.3, 8.8, 16]} c="#E6D9A9" />
      <Bloco p={[0, 4, -6.8]} s={[9.5, 4, 0.14]} c="#7A5230" />
      <Bloco p={[0, 4, -6.72]} s={[9, 3.5, 0.1]} c="#2F6B4F" />
      <Bloco p={[-2.4, 4.8, -6.65]} s={[2.8, 0.09, 0.03]} c="#FFF" />
      <Bloco p={[-1.9, 4.2, -6.65]} s={[3.6, 0.09, 0.03]} c="#FFF" />
      <Bloco p={[2.1, 4.4, -6.65]} s={[2.1, 0.09, 0.03]} c="#FFE066" />
      <Bloco p={[-6, 4.8, -6.82]} s={[1.5, 1.8, 0.1]} c="#FF8FA3" />
      <Bloco p={[6, 5.2, -6.82]} s={[1.8, 1.3, 0.1]} c="#7BDFF2" />

      <group position={[Math.sin(tremor * 30) * tremor * 0.08, 0, 0]}>
        <Bloco p={[8, 4.4, -5]} s={[0.3, 8.8, 4]} c="#E6D9A9" />
        <Bloco p={[8, 4.4, 5.3]} s={[0.3, 8.8, 5.4]} c="#E6D9A9" />
        <Bloco p={[8, 6.9, 0.3]} s={[0.3, 3.8, 6]} c="#E6D9A9" />
        <mesh position={[8.4, 2.5, 0.3]}>
          <boxGeometry args={[0.2, 5, 6]} />
          <meshBasicMaterial color="#8ED6F5" />
        </mesh>
        {tijolos}
      </group>

      <Bloco p={[-2.5, 1.5, -4.8]} s={[4.2, 0.2, 1.9]} c="#8B5E3C" />
      <Bloco p={[-4.3, 0.7, -4.8]} s={[0.25, 1.4, 1.6]} c="#6B4628" />
      <Bloco p={[-0.7, 0.7, -4.8]} s={[0.25, 1.4, 1.6]} c="#6B4628" />
      <Carteira p={[-4.5, 0, -1.4]} />
      <Carteira p={[0, 0, -1.4]} />
      <Carteira p={[-4.5, 0, 2.2]} />
    </>
  );
};

/** Dark school bathroom with a flickering light and a sickly green glow on the last stall. */
export const BanheiroEscola = ({ brilho = 0 }: { brilho?: number }) => {
  const frame = useCurrentFrame();
  const pisca = 0.65 + 0.35 * Math.abs(Math.sin(frame * 0.09) * Math.sin(frame * 0.31));
  return (
    <>
      <color attach="background" args={["#10161D"]} />
      <hemisphereLight args={["#6B8BA8", "#1A242C", 0.7]} />
      <pointLight position={[0, 6.7, 2]} intensity={70 * pisca} color="#DDF2E8" castShadow distance={22} />
      <pointLight position={[4.2, 2, -3]} intensity={brilho * 18} color="#44FF77" distance={13} />
      {new Array(100).fill(true).map((_, i) => {
        const x = (i % 10) - 4.5;
        const z = Math.floor(i / 10) - 4.5;
        return (
          <mesh key={i} position={[x * 1.9, -0.02, z * 1.5]} receiveShadow>
            <boxGeometry args={[1.88, 0.04, 1.48]} />
            <meshStandardMaterial color={(Math.floor(i / 10) + i) % 2 ? "#3D4A52" : "#58666E"} roughness={0.3} />
          </mesh>
        );
      })}
      <Bloco p={[0, 3.6, -6]} s={[20, 7.2, 0.3]} c="#7B9391" />
      <Bloco p={[0, 1.2, -5.84]} s={[20, 2.4, 0.05]} c="#536B6A" />
      <Bloco p={[-9, 3.6, 0]} s={[0.3, 7.2, 14]} c="#6D8583" />
      <Bloco p={[9, 3.6, 0]} s={[0.3, 7.2, 14]} c="#6D8583" />
      <Bloco p={[0, 7.3, 0]} s={[20, 0.25, 14]} c="#39474C" />
      {[-5.7, -2.2, 1.3, 6.3].map((x) => (
        <Bloco key={x} p={[x, 2.1, -3.8]} s={[0.15, 4.2, 4]} c="#44636E" />
      ))}
      <Bloco p={[-7.6, 1.15, 3.5]} s={[1.5, 2.3, 5]} c="#6E7A7F" />
      <Bloco p={[-7.6, 2.34, 3.5]} s={[1.7, 0.1, 5.2]} c="#AEB9BE" rough={0.3} />
    </>
  );
};

/** Endless school corridor: only the props move, so the actors can run in place. */
export const Corredor = ({ velocidade = 0.3 }: { velocidade?: number }) => {
  const frame = useCurrentFrame();
  const passo = 5;
  const offset = (frame * velocidade) % passo;
  return (
    <>
      <color attach="background" args={["#141A2E"]} />
      <fog attach="fog" args={["#141A2E", 18, 52]} />
      <hemisphereLight args={["#B8C9F0", "#3A3045", 1.5]} />
      <directionalLight position={[3, 9, 8]} intensity={1.6} castShadow color="#EAF0FF" />
      <Chao c="#7E8AA3" />
      <Bloco p={[0, 7.2, 0]} s={[13, 0.2, 120]} c="#39425C" />
      <Bloco p={[-6.2, 3.6, 0]} s={[0.3, 7.2, 120]} c="#DAD3B8" />
      <Bloco p={[6.2, 3.6, 0]} s={[0.3, 7.2, 120]} c="#DAD3B8" />
      {new Array(13).fill(true).map((_, i) => {
        const z = 15 - i * passo + offset;
        return (
          <group key={i}>
            <Bloco p={[0, 7.06, z]} s={[3, 0.08, 1]} c="#FFF9DC" />
            {[-5.7, 5.7].map((x) =>
              [-1.5, 0, 1.5].map((dz, j) => (
                <group key={`${x}${j}`} position={[x, 0, z + dz]}>
                  <Bloco p={[0, 2, 0]} s={[0.7, 4, 1.4]} c={(i + j) % 3 === 0 ? "#E0574A" : "#3C7FB8"} />
                  <Bloco p={[x > 0 ? -0.37 : 0.37, 3.4, 0.3]} s={[0.05, 0.2, 0.5]} c="#1C2B3A" />
                </group>
              )),
            )}
          </group>
        );
      })}
    </>
  );
};

export const Patio = ({ ceu = "#FF9E6B", grama = "#6BA84A" }: { ceu?: string; grama?: string }) => (
  <>
    <Ceu cor={ceu} />
    <Luz sol={2.6} corSol="#FFD2A1" ceu={ceu} ambiente={1.15} />
    <Chao c={grama} />
    <Bloco p={[0, 4.5, -19]} s={[42, 9, 5]} c="#D9C48F" />
    <Bloco p={[0, 9.4, -19]} s={[44, 0.8, 6]} c="#8B4B32" />
    {[-17, -11, -5, 5, 11, 17].map((x) => (
      <group key={x}>
        <Bloco p={[x, 5.5, -16.45]} s={[3, 3, 0.1]} c="#FFF" />
        <Bloco p={[x, 5.5, -16.38]} s={[2.5, 2.5, 0.1]} c="#FFE6A6" />
      </group>
    ))}
    <Arvore p={[-16, 0, -9]} s={1.7} />
    <Arvore p={[16, 0, -10]} s={1.9} />
  </>
);
