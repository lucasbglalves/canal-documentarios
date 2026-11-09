import { Composition } from "remotion";
import { Aventura } from "./Aventura";
import { Episodio } from "./episodio/Episodio";
import { DURACAO_TOTAL, FPS } from "./episodio/timeline";
import { Piloto } from "./panama/Piloto";
import { DURACAO_TOTAL as DURACAO_PANAMA } from "./panama/timeline";
import { DURACAO_TOTAL as DURACAO_UENO, UenoReels } from "./ueno/Ueno";
import { DURACAO_TOTAL as DURACAO_VOEPASS, Voepass2283 } from "./voepass/Voepass";

export const MyComposition = () => {
  return (
    <>
      <Composition
        id="Voepass2283"
        component={Voepass2283}
        durationInFrames={DURACAO_VOEPASS}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="UenoReels"
        component={UenoReels}
        durationInFrames={DURACAO_UENO}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="CanalPanama"
        component={Piloto}
        durationInFrames={DURACAO_PANAMA}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Episodio"
        component={Episodio}
        durationInFrames={DURACAO_TOTAL}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="AventuraInfantil"
        component={Aventura}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
