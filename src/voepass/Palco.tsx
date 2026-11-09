import { useLoader, useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { ATR72 } from "./Aviao";

export type Pose = {
  roll: number; // graus, + = asa direita para baixo
  pitch: number; // graus, + = nariz para cima
  yaw: number; // graus
  gelo?: number;
};
export type Camera = { azim: number; elev: number; dist: number; alvo?: [number, number, number] };

const rad = (g: number) => (g * Math.PI) / 180;

const Lente = ({ cam }: { cam: Camera }) => {
  const camera = useThree((s) => s.camera);
  const [ax, ay, az] = cam.alvo ?? [0, 0, 0];
  const x = ax + cam.dist * Math.cos(rad(cam.elev)) * Math.cos(rad(cam.azim));
  const y = ay + cam.dist * Math.sin(rad(cam.elev));
  const z = az + cam.dist * Math.cos(rad(cam.elev)) * Math.sin(rad(cam.azim));
  useLayoutEffect(() => {
    camera.position.set(x, y, z);
    camera.lookAt(ax, ay, az);
  });
  return null;
};

const L = 90; // tamanho do volume de nuvens que se repete
const wrap = (v: number) => ((((v + L / 2) % L) + L) % L) - L / 2;

// Textura de nuvem macia: vários círculos com borda esfumada, desenhados uma vez.
let texturaNuvem: THREE.CanvasTexture | null = null;
const nuvem = () => {
  if (texturaNuvem) return texturaNuvem;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  for (let i = 0; i < 28; i++) {
    const x = 128 + (random(`nx${i}`) - 0.5) * 120;
    const y = 128 + (random(`ny${i}`) - 0.5) * 60;
    const r = 30 + random(`nr${i}`) * 50;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, "rgba(255,255,255,0.35)");
    gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
  }
  texturaNuvem = new THREE.CanvasTexture(c);
  return texturaNuvem;
};

/** avanco: quanto o avião andou (nuvens passam para trás). queda: quanto caiu (nuvens sobem). */
const Nuvens = ({ avanco, queda }: { avanco: number; queda: number }) => {
  const mapa = useMemo(nuvem, []);
  const puffs = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        x: (random(`x${i}`) - 0.5) * L,
        y: (random(`y${i}`) - 0.5) * L * 0.5,
        z: (random(`z${i}`) - 0.5) * L,
        r: 6 + random(`r${i}`) * 10,
        tom: 0.82 + random(`t${i}`) * 0.18,
      })).filter((p) => Math.hypot(p.y, p.z) > 6),
    [],
  );
  return (
    <group>
      {puffs.map((p, i) => (
        <sprite key={i} position={[wrap(p.x - avanco), wrap(p.y + queda) * 0.5, p.z]} scale={[p.r * 1.6, p.r * 0.8, 1]}>
          <spriteMaterial map={mapa} color={new THREE.Color(p.tom, p.tom, p.tom * 1.03)} transparent depthWrite={false} fog />
        </sprite>
      ))}
    </group>
  );
};

// Chão com a imagem de satélite real da região de Campinas (Sentinel-2 cloudless 2016, EOX).
const Chao = ({ avanco, queda }: { avanco: number; queda: number }) => {
  const mapa = useLoader(THREE.TextureLoader, staticFile("satelite-voepass/campinas-z11.jpg"));
  mapa.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-(avanco % 60) + 30, -40 + Math.min(queda, 30), 0]}>
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial map={mapa} fog />
    </mesh>
  );
};

export const Palco = ({ pose, cam, avanco, queda = 0, ceu = "#7F93A8" }: { pose: Pose; cam: Camera; avanco: number; queda?: number; ceu?: string }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(#3E5874 0%, ${ceu} 32%, ${ceu} 100%)` }}>
      <ThreeCanvas width={width} height={height} camera={{ fov: 35, near: 0.1, far: 300 }} gl={{ alpha: true, antialias: true }}>
        <fog attach="fog" args={[ceu, 25, 160]} />
        <ambientLight intensity={0.6} />
        <hemisphereLight args={["#DCE6F0", "#4A5560", 1.1]} />
        <directionalLight position={[6, 12, 4]} intensity={2.2} color="#FFF4E0" />
        <Lente cam={cam} />
        <Chao avanco={avanco} queda={queda} />
        <Nuvens avanco={avanco} queda={queda} />
        {/* ordem: guinada, arfagem, rolagem */}
        <group rotation={[0, rad(-pose.yaw), 0]}>
          <group rotation={[0, 0, rad(pose.pitch)]}>
            <group rotation={[rad(pose.roll), 0, 0]}>
              <ATR72 giroHelice={frame * 0.9} gelo={pose.gelo} />
            </group>
          </group>
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(5,8,12,.62), transparent 26%, transparent 70%, rgba(5,8,12,.55))" }} />
    </AbsoluteFill>
  );
};
