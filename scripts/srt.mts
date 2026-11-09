// Gera legendas .srt a partir dos tempos medidos da narração (para subir no YouTube).
//   npx tsx scripts/srt.mts voepass   -> out/voepass.srt
import { mkdirSync, writeFileSync } from "node:fs";

const projeto = process.argv[2] ?? "voepass";
const { CENAS } = await import(`../src/${projeto}/timeline.ts`);
const FPS = 30;

const ts = (frame: number) => {
  const ms = Math.round((frame / FPS) * 1000);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const cues: string[] = [];
for (const c of CENAS) {
  for (const f of c.falas) {
    // uma frase por legenda; o tempo da fala é dividido pelo tamanho de cada frase
    const frases: string[] = f.legenda.match(/[^.!?]+[.!?]+["”]?\s*|[^.!?]+$/g)!.map((s: string) => s.trim());
    const total = frases.reduce((s, x) => s + x.length, 0);
    let t = c.inicio + f.de;
    for (const frase of frases) {
      const dur = (f.duracao * frase.length) / total;
      cues.push(`${cues.length + 1}\n${ts(t)} --> ${ts(t + dur)}\n${frase}\n`);
      t += dur;
    }
  }
}
mkdirSync("out", { recursive: true });
writeFileSync(`out/${projeto}.srt`, cues.join("\n"));
console.log(`out/${projeto}.srt`, cues.length, "legendas");
