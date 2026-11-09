// Sintetiza a trilha de fundo (sem licença de terceiros): node scripts/musica.mjs <segundos> <saida.mp3>
import { spawnSync } from "node:child_process";

const SEG = Number(process.argv[2] ?? 130);
const SAIDA = process.argv[3] ?? "public/panama-musica.mp3";
const RATE = 44100;
const COMPASSO = 6; // segundos por acorde
const ACORDES = [
  [110.0, 220.0, 261.63, 329.63], // Lá menor
  [87.31, 174.61, 220.0, 261.63], // Fá
  [130.81, 196.0, 261.63, 329.63], // Dó
  [98.0, 196.0, 246.94, 293.66], // Sol
];

const total = Math.floor(SEG * RATE);
const pcm = Buffer.alloc(total * 2);
for (let i = 0; i < total; i++) {
  const t = i / RATE;
  const pos = t / COMPASSO;
  const acorde = ACORDES[Math.floor(pos) % ACORDES.length];
  const f = pos % 1;
  const env = Math.min(1, f * 4) * Math.min(1, (1 - f) * 4);
  let s = 0;
  acorde.forEach((hz, n) => {
    // Dois osciladores levemente desafinados dão o corpo de "pad".
    s += (Math.sin(2 * Math.PI * hz * t) + 0.6 * Math.sin(2 * Math.PI * hz * 1.003 * t)) * (n === 0 ? 0.5 : 0.22);
  });
  // Arpejo suave em colcheias para dar movimento.
  const passo = t / 0.5;
  const nota = acorde[1 + (Math.floor(passo) % 3)] * 2;
  const pluck = Math.sin(2 * Math.PI * nota * t) * Math.exp(-(passo % 1) * 5) * 0.16;
  const v = (s * env * 0.32 + pluck) * Math.min(1, t / 3) * Math.min(1, (SEG - t) / 4);
  pcm.writeInt16LE(Math.max(-1, Math.min(1, v)) * 32000, i * 2);
}

const { status, stderr } = spawnSync(
  "ffmpeg",
  ["-y", "-v", "error", "-f", "s16le", "-ar", `${RATE}`, "-ac", "1", "-i", "-", "-af", "aecho=0.8:0.6:180|360:0.35|0.2,lowpass=f=3200", "-b:a", "160k", SAIDA],
  { input: pcm },
);
if (status !== 0) throw new Error(`ffmpeg falhou: ${stderr}`);
console.log("música gerada:", SAIDA);
