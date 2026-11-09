import { CSSProperties } from "react";
import { interpolate, useCurrentFrame } from "remotion";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

const SKIN = "#FFCFA3";
const SHIRT = "#FF6B4A";
const PACK = "#2EC4B6";
const PANTS = "#3D5A98";
const BOOT = "#5C3A21";
const HAT = "#E0A458";
const INK = "#2B1B3D";

type Props = {
  readonly size: number;
  /** Mouth moves like speech. */
  readonly talking?: boolean;
  /** Round "o" mouth and small pupils. */
  readonly surprised?: boolean;
  /** 0 = arms down, 1 = arms up. */
  readonly armsUp?: number;
  /** Height of a continuous hop, in SVG units. */
  readonly hop?: number;
  readonly style?: CSSProperties;
};

const Arm = ({ x, sign, angle }: { x: number; sign: 1 | -1; angle: number }) => (
  <g transform={`rotate(${sign * angle} ${x} 305)`}>
    <line
      x1={x}
      y1={305}
      x2={x}
      y2={410}
      stroke={SHIRT}
      strokeWidth={38}
      strokeLinecap="round"
    />
    <circle cx={x} cy={425} r={24} fill={SKIN} />
  </g>
);

export const Character = ({
  size,
  talking = false,
  surprised = false,
  armsUp = 0,
  hop = 0,
  style,
}: Props) => {
  const frame = useCurrentFrame();

  // Offset so a blink never lands on a scene's first frames.
  const eyeOpen = interpolate((frame + 40) % 70, [0, 3, 6], [1, 0.08, 1], clamp);
  const bob = Math.sin(frame * 0.14) * 7;
  const tilt = Math.sin(frame * 0.09) * 3 + (talking ? Math.sin(frame * 0.3) * 2 : 0);
  const sway = Math.sin(frame * 0.12) * 6;
  const angle = interpolate(armsUp, [0, 1], [18, 150]) + sway;
  // Two sines make syllables with small pauses instead of a metronome.
  const mouthOpen = talking
    ? Math.abs(Math.sin(frame * 0.6) * (0.55 + 0.45 * Math.sin(frame * 0.17)))
    : 0;
  const lift = Math.abs(Math.sin(frame * 0.2)) * hop;

  return (
    <svg
      viewBox="0 0 400 560"
      width={size}
      height={size * 1.4}
      style={{ overflow: "visible", ...style }}
    >
      <g transform={`translate(0 ${-lift})`}>
        <ellipse cx={168} cy={500} rx={36} ry={22} fill={BOOT} />
        <ellipse cx={232} cy={500} rx={36} ry={22} fill={BOOT} />
        <rect x={148} y={400} width={40} height={95} rx={18} fill={PANTS} />
        <rect x={212} y={400} width={40} height={95} rx={18} fill={PANTS} />

        <g transform={`translate(0 ${bob})`}>
          <rect x={100} y={285} width={200} height={115} rx={32} fill={PACK} />
          <Arm x={132} sign={1} angle={angle} />
          <Arm x={268} sign={-1} angle={angle} />
          <rect x={128} y={268} width={144} height={155} rx={52} fill={SHIRT} />
          <rect x={128} y={385} width={144} height={18} fill={INK} opacity={0.25} />

          <g transform={`rotate(${tilt} 200 260)`}>
            <circle cx={200} cy={170} r={112} fill={SKIN} />
            <circle cx={122} cy={208} r={20} fill="#FF8E8E" opacity={0.65} />
            <circle cx={278} cy={208} r={20} fill="#FF8E8E" opacity={0.65} />

            <ellipse cx={160} cy={165} rx={25} ry={30 * eyeOpen} fill="#fff" />
            <ellipse cx={240} cy={165} rx={25} ry={30 * eyeOpen} fill="#fff" />
            <ellipse cx={163} cy={168} rx={surprised ? 9 : 14} ry={(surprised ? 9 : 16) * eyeOpen} fill={INK} />
            <ellipse cx={243} cy={168} rx={surprised ? 9 : 14} ry={(surprised ? 9 : 16) * eyeOpen} fill={INK} />

            {surprised ? (
              <ellipse cx={200} cy={232} rx={20} ry={26} fill={INK} />
            ) : talking ? (
              <ellipse cx={200} cy={228} rx={32} ry={5 + mouthOpen * 26} fill={INK} />
            ) : (
              <path
                d="M165 218 Q200 262 235 218 Z"
                fill={INK}
                stroke={INK}
                strokeWidth={6}
                strokeLinejoin="round"
              />
            )}

            <rect x={118} y={8} width={164} height={84} rx={32} fill={HAT} />
            <rect x={118} y={66} width={164} height={22} fill={SHIRT} />
            <ellipse cx={200} cy={92} rx={150} ry={26} fill={HAT} />
          </g>
        </g>
      </g>
    </svg>
  );
};
