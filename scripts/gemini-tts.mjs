// Gera a narração com o TTS do Gemini e salva em public/voz-<projeto>/<id>.mp3.
//   node scripts/gemini-tts.mjs --projeto=voepass             todas as falas
//   node scripts/gemini-tts.mjs --projeto=voepass gancho-0    só essas
//   --voz=Charon  --modelo=gemini-3.8-flash-tts
// Depois: node scripts/voz.mjs --projeto=voepass --so-medir
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const PROJETO = opt.projeto ?? "voepass";
const PASTA = `public/voz-${PROJETO}`;
const MODELO = opt.modelo ?? "gemini-3.8-flash-tts";
const VOZ = opt.voz ?? "Charon";
const KEY = readFileSync(".env", "utf8").match(/^GEMINI_API_KEY=(.+)$/m)?.[1].trim().replace(/^"|"$/g, "");
if (!KEY) throw new Error("falta GEMINI_API_KEY no .env");

// Só o texto: o gemini-3.8-flash-tts lê em voz alta qualquer direção de estilo posta no texto
// e recusa systemInstruction ("Developer instruction is not enabled").

const roteiro = JSON.parse(readFileSync(`src/${PROJETO}/roteiro.json`, "utf8"));
const falas = roteiro.flatMap((c) => c.falas.map((f, i) => ({ ...f, id: `${c.id}-${i}` }))).filter((f) => !ids.length || ids.includes(f.id));

const gerar = async (fala) => {
  for (let tentativa = 1; ; tentativa++) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fala.texto }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOZ } } } },
      }),
    });
    const corpo = await res.json();
    const dados = corpo.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (res.ok && dados) {
      // PCM 16 bits, 24 kHz, mono: corta silêncio nas pontas e normaliza o volume.
      const { status, stderr } = spawnSync(
        "ffmpeg",
        ["-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "-",
          "-af", "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5",
          "-ar", "44100", "-b:a", "128k", `${PASTA}/${fala.id}.mp3`],
        { input: Buffer.from(dados, "base64") },
      );
      if (status !== 0) throw new Error(`${fala.id}: ffmpeg ${stderr}`);
      return console.log("gerada", fala.id);
    }
    // 429 = limite do plano gratuito: espera e tenta de novo
    if (tentativa >= 5 || ![429, 500, 503].includes(res.status)) throw new Error(`${fala.id}: Gemini ${res.status} ${JSON.stringify(corpo).slice(0, 400)}`);
    console.log(`${fala.id}: ${res.status}, tentando de novo em ${20 * tentativa}s`);
    await new Promise((r) => setTimeout(r, 20000 * tentativa));
  }
};

mkdirSync(PASTA, { recursive: true });
for (const f of falas) await gerar(f);
