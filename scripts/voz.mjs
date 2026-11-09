// Gera a narração na ElevenLabs e mede cada fala para sincronizar cenas e bocas.
//   node scripts/voz.mjs                 gera todas as falas e mede
//   node scripts/voz.mjs banheiro-2      regenera só essa fala e mede
//   node scripts/voz.mjs --so-medir      só mede os MP3 que já existem
//   node scripts/voz.mjs --faltando      gera só as falas sem MP3
//   node scripts/voz.mjs --projeto=panama  usa src/panama e public/voz-panama
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const FPS = 30;
const RATE = 8000;
const FALTANDO = process.argv.includes("--faltando"); // retomada: não paga de novo o que já existe
const args = process.argv.slice(2).filter((a) => !a.startsWith("--projeto=") && a !== "--faltando");
const PROJETO = process.argv.find((a) => a.startsWith("--projeto="))?.slice(10) ?? "episodio";
const PASTA = PROJETO === "episodio" ? "public/voz" : `public/voz-${PROJETO}`;
const VOZES = {
  documentario: "pNInz6obpgDQGcFmaJgB", // Adam
  reels: "JBFqnCBsd6RMkjVDRZzb", // George
  narrador: "ErXwobaYiN019PkySvjV", // Antoni
  tommy: "cgSgspJ2msm6clMCkdW9", // Jessica
  nico: "FGY2WhTYpPnrIDTdsKH5", // Laura
  pai: "pNInz6obpgDQGcFmaJgB", // Adam
  professora: "XrExE9yKIg1WjnnlVkGX", // Matilda
  monstro: "VR6AewLTigWG4xSOukaG", // Arnold
  victor: "YNOujSUmHtgN6anjqXPf", // Victor Power (biblioteca, pt-BR)
};

const roteiro = JSON.parse(readFileSync(`src/${PROJETO}/roteiro.json`, "utf8"));
const falas = roteiro.flatMap((cena) =>
  cena.falas.map((f, i) => ({ ...f, id: `${cena.id}-${i}` })),
);
// Narração contínua: voz mais estável, e o texto vizinho mantém a entonação entre os trechos.
const ajustes = (fala) => {
  if (!["documentario", "reels", "victor"].includes(fala.quem)) return { voice_settings: { stability: 0.4, similarity_boost: 0.75, style: 0.4 } };
  const i = falas.indexOf(fala);
  return {
    voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0.15 },
    previous_text: falas[i - 1]?.texto,
    next_text: falas[i + 1]?.texto,
  };
};

const gerar = async (fala, key) => {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOZES[fala.quem]}`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: fala.texto,
        model_id: "eleven_multilingual_v2",
        ...ajustes(fala),
      }),
    },
  );
  if (!res.ok) throw new Error(`${fala.id}: ElevenLabs ${res.status} ${await res.text()}`);
  writeFileSync(`${PASTA}/${fala.id}.mp3`, Buffer.from(await res.arrayBuffer()));
  console.log("gerada", fala.id);
};

// Volume por frame (0-9) em texto: é o que abre e fecha a boca dos personagens.
const medir = (id) => {
  const { stdout, status } = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", `${PASTA}/${id}.mp3`, "-f", "s16le", "-ac", "1", "-ar", `${RATE}`, "-"],
    { maxBuffer: 1 << 28 },
  );
  if (status !== 0) throw new Error(`ffmpeg falhou ou falta o áudio: ${id}`);
  const janela = RATE / FPS;
  const total = stdout.length / 2;
  const niveis = [];
  for (let i = 0; i + janela <= total; i += janela) {
    let soma = 0;
    for (let j = 0; j < janela; j++) soma += stdout.readInt16LE((Math.floor(i) + j) * 2) ** 2;
    niveis.push(Math.sqrt(soma / janela));
  }
  const pico = Math.max(...niveis, 1);
  return { d: total / RATE, m: niveis.map((n) => Math.round((n / pico) * 9)).join("") };
};

mkdirSync(PASTA, { recursive: true });
if (!args.includes("--so-medir")) {
  try {
    process.loadEnvFile();
  } catch {
    // Sem .env: a chave pode vir direto do ambiente.
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("Defina ELEVENLABS_API_KEY no arquivo .env");
  for (const f of falas.filter((f) => (!args.length || args.includes(f.id)) && !(FALTANDO && existsSync(`${PASTA}/${f.id}.mp3`)))) await gerar(f, key);
}
writeFileSync(
  `src/${PROJETO}/voz.json`,
  JSON.stringify(Object.fromEntries(falas.map((f) => [f.id, medir(f.id)]))),
);
console.log("voz.json atualizado:", falas.length, "falas");
