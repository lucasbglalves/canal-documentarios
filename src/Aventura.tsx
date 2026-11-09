import { loadFont } from "@remotion/google-fonts/LilitaOne";
import { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  Sequence,
  spring,
  Track,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Character } from "./Character";
import { Chest, CompassIcon, HeartIcon, MapIcon } from "./Items";

const { fontFamily } = loadFont("normal", { weights: ["400"], subsets: ["latin"] });

const YELLOW = "#FFD93D";
const INK = "#2B1B3D";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const useBounce = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: { damping: 9, stiffness: 130, mass: 0.8 },
  });
};

const STARS = new Array(45).fill(true).map((_, i) => ({
  x: random(`star-x-${i}`) * 100,
  y: random(`star-y-${i}`) * 72,
  size: 4 + random(`star-s-${i}`) * 8,
  phase: random(`star-p-${i}`) * 6.28,
}));

const Background = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${165 + Math.sin(frame * 0.02) * 12}deg, #1B0B45 0%, #4A1A8C 55%, #0F6E8C 100%)`,
      }}
    >
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.35 + Math.abs(Math.sin(frame * 0.06 + s.phase)) * 0.6,
          }}
        />
      ))}
      <svg
        viewBox="0 0 1080 500"
        style={{ position: "absolute", bottom: 0, left: -40, width: 1160 }}
      >
        <path
          transform={`translate(${Math.sin(frame * 0.02) * 20} 0)`}
          d="M-40 240 Q200 90 480 220 T1120 170 V500 H-40 Z"
          fill="#17365E"
        />
        <path d="M-40 360 Q300 240 640 340 T1120 300 V500 H-40 Z" fill="#12274A" />
      </svg>
    </AbsoluteFill>
  );
};

/** Keeps every scene's cut punchy: quick zoom-and-fade on its last frames. */
const SceneExit = ({ end, children }: { end: number; children: ReactNode }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [end - 6, end], [1, 0], clamp),
        scale: interpolate(frame, [end - 6, end], [1, 1.12], clamp),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const BigText = ({
  size,
  color = "#fff",
  style,
  children,
}: {
  size: number;
  color?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <div
    style={{
      fontFamily,
      fontSize: size,
      lineHeight: 1.02,
      color,
      textAlign: "center",
      WebkitTextStroke: `${size * 0.09}px ${INK}`,
      paintOrder: "stroke fill",
      textShadow: `0 ${size * 0.06}px 0 ${INK}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line1 = useBounce(0);
  const line2 = useBounce(10);
  const character = useBounce(18);
  const shake = interpolate(frame, [12, 40], [14, 0], clamp) * Math.sin(frame * 1.7);

  return (
    <SceneExit end={3 * fps}>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
        <BigText size={170} style={{ scale: `${line1}` }}>
          O TESOURO
        </BigText>
        <BigText
          size={270}
          color={YELLOW}
          style={{ scale: `${line2}`, translate: `${shake}px 0`, rotate: "-3deg" }}
        >
          SUMIU!
        </BigText>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 800 }}>
        <Character
          size={480}
          surprised
          armsUp={interpolate(frame, [20, 32], [0, 1], clamp)}
          style={{ translate: `0 ${(1 - character) * 900}px` }}
        />
      </AbsoluteFill>
      <BigText
        size={170}
        color="#7BDFF2"
        style={{
          position: "absolute",
          left: 130,
          top: 880 + Math.sin(frame * 0.2) * 16,
          scale: `${useBounce(30)}`,
          rotate: "-14deg",
        }}
      >
        ?
      </BigText>
      <BigText
        size={210}
        color="#FF8FA3"
        style={{
          position: "absolute",
          right: 130,
          top: 800 + Math.cos(frame * 0.2) * 16,
          scale: `${useBounce(38)}`,
          rotate: "14deg",
        }}
      >
        ?
      </BigText>
    </SceneExit>
  );
};

const Bubble = ({ text, highlight }: { text: string; highlight: string }) => (
  <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
    <div
      style={{
        scale: `${useBounce()}`,
        width: 860,
        minHeight: 270,
        boxSizing: "border-box",
        padding: "30px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "#fff",
        borderRadius: 64,
        color: INK,
        fontFamily,
        fontSize: 92,
        lineHeight: 1.05,
        position: "relative",
      }}
    >
      <div>
        {text} <span style={{ color: "#E8452C" }}>{highlight}</span>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: -44,
          left: 390,
          width: 0,
          height: 0,
          borderLeft: "40px solid transparent",
          borderRight: "40px solid transparent",
          borderTop: "54px solid #fff",
        }}
      />
    </div>
  </AbsoluteFill>
);

const ItemCard = ({
  delay,
  color,
  label,
  children,
}: {
  delay: number;
  color: string;
  label: string;
  children: ReactNode;
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: 260,
        padding: "22px 16px 18px",
        boxSizing: "border-box",
        borderRadius: 44,
        background: color,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        scale: `${useBounce(delay)}`,
        translate: `0 ${Math.sin((frame - delay) * 0.1) * 8}px`,
      }}
    >
      <div style={{ width: 170 }}>{children}</div>
      <div style={{ fontFamily, fontSize: 46, color: "#fff" }}>{label}</div>
    </div>
  );
};

// Times in seconds, relative to the scene. `talkUntil` leaves a pause before the next line.
const LINES = [
  { from: 0, to: 2.2, talkUntil: 1.8, text: "Oi! Eu sou o", highlight: "TICO!" },
  { from: 2.2, to: 4.2, talkUntil: 3.9, text: "Preciso de um", highlight: "MAPA," },
  { from: 4.2, to: 6.2, talkUntil: 5.9, text: "uma boa", highlight: "BÚSSOLA" },
  { from: 6.2, to: 9, talkUntil: 8, text: "e muita", highlight: "CORAGEM!" },
];

const Explain = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const talking = LINES.some((l) => frame >= l.from * fps && frame < l.talkUntil * fps);
  // Arm swings up as each new item lands, then relaxes.
  const gesture = Math.max(
    ...LINES.slice(1).map((l) =>
      interpolate(frame, [l.from * fps, (l.from + 0.25) * fps, (l.from + 0.9) * fps], [0, 0.65, 0], clamp),
    ),
  );

  return (
    <SceneExit end={9 * fps}>
      <Track name="Falas">
        {LINES.map((l) => (
          <Sequence
            key={l.text}
            name={`Fala: ${l.highlight}`}
            from={Math.round(l.from * fps)}
            durationInFrames={Math.round((l.to - l.from) * fps)}
            layout="none"
          >
            <Bubble text={l.text} highlight={l.highlight} />
          </Sequence>
        ))}
      </Track>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 495 }}>
        <Character
          size={480}
          talking={talking}
          armsUp={gesture}
          style={{ translate: `0 ${(1 - useBounce(4)) * 900}px` }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 20,
          paddingTop: 1180,
        }}
      >
        <ItemCard delay={2.3 * fps} color="#2EC4B6" label="Mapa">
          <MapIcon />
        </ItemCard>
        <ItemCard delay={4.3 * fps} color="#FF8C42" label="Bússola">
          <CompassIcon />
        </ItemCard>
        <ItemCard delay={6.3 * fps} color="#C2255C" label="Coragem">
          <HeartIcon />
        </ItemCard>
      </AbsoluteFill>
    </SceneExit>
  );
};

const Finale = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ctaDelay = 2.2 * fps;
  const openAt = 0.9 * fps;
  const pulse = 1 + Math.abs(Math.sin((frame - ctaDelay) * 0.14)) * 0.06;

  return (
    <>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
        <BigText size={150} style={{ scale: `${useBounce(0)}` }}>
          ACHAMOS O
        </BigText>
        <BigText size={190} color={YELLOW} style={{ scale: `${useBounce(8)}`, rotate: "-2deg" }}>
          TESOURO!
        </BigText>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-end",
          paddingTop: 620,
          height: 1270,
          gap: 10,
        }}
      >
        <Character
          size={380}
          talking={frame > 2.2 * fps && frame < 4.6 * fps}
          armsUp={interpolate(frame, [openAt, openAt + 10], [0, 1], clamp)}
          hop={frame > openAt ? 45 : 0}
          style={{ translate: `${(1 - useBounce(4)) * -800}px 0` }}
        />
        <div style={{ scale: `${useBounce(6)}` }}>
          <Chest size={480} openAt={openAt} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 1300 }}>
        <div
          style={{
            scale: `${useBounce(ctaDelay) * pulse}`,
            width: 820,
            padding: "26px 40px 32px",
            boxSizing: "border-box",
            borderRadius: 80,
            background: "#FF3B6B",
            borderBottom: "14px solid #B31B45",
            color: "#fff",
            fontFamily,
            fontSize: 74,
            lineHeight: 1.08,
            textAlign: "center",
          }}
        >
          SIGA PARA A PRÓXIMA AVENTURA!
        </div>
      </AbsoluteFill>
    </>
  );
};

export const Aventura = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#1B0B45" }}>
      <Background />
      <Track name="Cenas">
        <Sequence name="Gancho" durationInFrames={3 * fps}>
          <Hook />
        </Sequence>
        <Sequence name="Explicação" from={3 * fps} durationInFrames={9 * fps}>
          <Explain />
        </Sequence>
        <Sequence name="Conclusão + CTA" from={12 * fps} durationInFrames={6 * fps}>
          <Finale />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};
