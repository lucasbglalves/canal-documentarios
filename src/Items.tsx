import { interpolate, random, useCurrentFrame } from "remotion";

export const MapIcon = () => (
  <svg viewBox="0 0 200 200" width="100%">
    <path d="M20 40 L75 20 L125 40 L180 20 V160 L125 180 L75 160 L20 180 Z" fill="#F4E1B5" />
    <path d="M75 20 V160 M125 40 V180" stroke="#D9BE85" strokeWidth={5} />
    <path
      d="M42 145 Q70 95 100 115 T150 65"
      fill="none"
      stroke="#FF6B4A"
      strokeWidth={8}
      strokeDasharray="14 12"
      strokeLinecap="round"
    />
    <path d="M140 45 L165 70 M165 45 L140 70" stroke="#E5383B" strokeWidth={11} strokeLinecap="round" />
  </svg>
);

export const CompassIcon = () => {
  const frame = useCurrentFrame();
  const needle = Math.sin(frame * 0.12) * 28 + 20;
  return (
    <svg viewBox="0 0 200 200" width="100%">
      <circle cx={100} cy={100} r={84} fill="#FFC93C" />
      <circle cx={100} cy={100} r={62} fill="#FFF8E7" />
      <g transform={`rotate(${needle} 100 100)`}>
        <path d="M100 48 L116 100 H84 Z" fill="#E5383B" />
        <path d="M100 152 L116 100 H84 Z" fill="#3D5A98" />
      </g>
      <circle cx={100} cy={100} r={9} fill="#2B1B3D" />
    </svg>
  );
};

export const HeartIcon = () => {
  const frame = useCurrentFrame();
  const beat = 1 + Math.abs(Math.sin(frame * 0.16)) * 0.14;
  return (
    <svg viewBox="0 0 200 200" width="100%">
      <path
        transform={`translate(100 100) scale(${beat}) translate(-100 -100)`}
        d="M100 170 C30 120 20 85 30 60 C42 30 85 28 100 62 C115 28 158 30 170 60 C180 85 170 120 100 170 Z"
        fill="#FF4D6D"
      />
    </svg>
  );
};

const COINS = new Array(16).fill(true).map((_, i) => ({
  dir: (random(`coin-x-${i}`) - 0.5) * 2,
  height: 180 + random(`coin-y-${i}`) * 170,
  phase: random(`coin-p-${i}`),
}));

export const Chest = ({ size, openAt }: { size: number; openAt: number }) => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [openAt, openAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Rattles before opening, so the eye is on the chest when it pops.
  const rattle = frame < openAt ? Math.sin(frame * 1.4) * 2.5 : 0;

  return (
    <svg
      viewBox="0 0 400 320"
      width={size}
      height={size * 0.8}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="chest-glow">
          <stop offset="0%" stopColor="#FFE066" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FFE066" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={200} cy={120} r={290} fill="url(#chest-glow)" opacity={open} />
      <rect x={60} y={80} width={280} height={70} fill="#FFF3B0" opacity={open} />

      {open > 0 &&
        COINS.map((c, i) => {
          const t = ((frame - openAt) / 42 + c.phase) % 1;
          return (
            <ellipse
              key={i}
              cx={200 + c.dir * 210 * t}
              cy={150 - c.height * 4 * t * (1 - t)}
              rx={13 + Math.sin(frame * 0.5 + i) * 6}
              ry={19}
              fill={i % 3 === 0 ? "#FFF3B0" : "#FFC93C"}
              stroke="#E09F1F"
              strokeWidth={4}
            />
          );
        })}

      <g transform={`rotate(${rattle} 200 300)`}>
        <rect x={45} y={135} width={310} height={165} rx={18} fill="#8B4F24" />
        <rect x={45} y={135} width={310} height={30} fill="#6E3B16" />
        <rect x={80} y={135} width={32} height={165} fill="#FFC93C" />
        <rect x={288} y={135} width={32} height={165} fill="#FFC93C" />
        <rect x={172} y={125} width={56} height={68} rx={10} fill="#FFC93C" />
        <circle cx={200} cy={155} r={9} fill="#6E3B16" />

        <g transform={`translate(0 ${-open * 62}) rotate(${-open * 12} 45 135)`}>
          <path d="M45 135 V95 Q45 40 110 40 H290 Q355 40 355 95 V135 Z" fill="#A9652F" />
          <rect x={80} y={40} width={32} height={95} fill="#FFC93C" />
          <rect x={288} y={40} width={32} height={95} fill="#FFC93C" />
        </g>
      </g>
    </svg>
  );
};
