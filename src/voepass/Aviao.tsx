import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// "Voepass ATR 72-500 Free 3D Model", SAIMON584models (Sketchfab), CC BY 4.0.
// Normalizado para o mesmo eixo do resto do palco: nariz para +x, cima +y, comprimento 2,7.
const OCULTAR = /^(Interior_123|Interior_35|Interior_45|NGear_503|RGear_523|LGear_532)$/;
const HELICES = ["Engine1_586", "Engine2_437"];
const ORIENTACAO = new THREE.Euler(0, -Math.PI / 2, 0);

export const ATR72 = ({ giroHelice, gelo = 0 }: { giroHelice: number; gelo?: number }) => {
  const gltf = useLoader(GLTFLoader, staticFile("modelos/atr72-voepass.glb"));
  const { cena, escala, centro, helices } = useMemo(() => {
    const cena = gltf.scene.clone(true);
    cena.traverse((o) => {
      if (OCULTAR.test(o.name)) o.visible = false;
    });
    cena.rotation.copy(ORIENTACAO);
    cena.updateMatrixWorld(true);
    const caixa = new THREE.Box3().setFromObject(cena);
    const tam = caixa.getSize(new THREE.Vector3());
    const helices = HELICES.map((n) => cena.getObjectByName(n)).filter((o): o is THREE.Object3D => !!o);
    return { cena, escala: 2.7 / tam.x, centro: caixa.getCenter(new THREE.Vector3()), helices: helices.map((o) => ({ o, base: o.rotation.clone() })) };
  }, [gltf]);
  for (const { o, base } of helices) o.rotation.set(base.x, base.y, base.z + giroHelice);
  return (
    <group scale={escala}>
      <group position={[-centro.x, -centro.y, -centro.z]}>
        <primitive object={cena} />
      </group>
      {gelo > 0.01 && null}
    </group>
  );
};
