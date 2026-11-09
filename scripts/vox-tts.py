# Narração com VoxCPM2 (Apache-2.0), clonando tts/voz-<projeto>-ref.wav. Retomável: pula o que já foi gerado.
#   E:/VoiceStudio/teste-vox/.venv/Scripts/python.exe -I scripts/vox-tts.py [--projeto=voepass] [ids]
# Depois: node scripts/voz.mjs --projeto=voepass --so-medir
import hashlib, json, pathlib, subprocess, sys, time
import numpy as np, soundfile as sf, torch
from voxcpm import VoxCPM

args = sys.argv[1:]
PROJETO = next((a.split("=")[1] for a in args if a.startswith("--projeto=")), "voepass")
ids = [a for a in args if not a.startswith("--")]
REF, PASTA = f"tts/voz-{PROJETO}-ref.wav", pathlib.Path(f"public/voz-{PROJETO}")
# Fora do projeto e com hash do texto: mudar uma fala só regenera aquela fala.
CACHE = pathlib.Path(f"E:/VoiceStudio/teste-vox/cache-{PROJETO}")
ESTILO = "(voz masculina grave, encorpada, ritmo pausado de documentário)"
FILTRO = "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5"

roteiro = json.load(open(f"src/{PROJETO}/roteiro.json", encoding="utf-8"))
falas = [(f"{c['id']}-{i}", f["texto"]) for c in roteiro for i, f in enumerate(c["falas"])]
falas = [f for f in falas if not ids or f[0] in ids]
CACHE.mkdir(parents=True, exist_ok=True)
caminho = lambda id, texto: CACHE / f"{id}-{hashlib.sha1(texto.encode()).hexdigest()[:8]}.wav"

modelo = None
for id, texto in falas:
    wav_path = caminho(id, texto)
    if not wav_path.exists():
        modelo = modelo or VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False, optimize=False)
        torch.manual_seed(42)
        t = time.time()
        wav = np.asarray(modelo.generate(text=ESTILO + texto, reference_wav_path=REF, max_len=max(256, len(texto) * 6)), dtype=np.float32).squeeze()
        # Parte de uma fala cortada não pode virar arquivo "pronto" no cache.
        assert len(wav) / modelo.tts_model.sample_rate > len(texto) * 0.02, f"{id}: áudio curto demais"
        tmp = wav_path.with_suffix(".tmp.wav")
        sf.write(tmp, wav, modelo.tts_model.sample_rate)
        tmp.replace(wav_path)
        print(id, f"{len(wav)/modelo.tts_model.sample_rate:.1f}s em {time.time()-t:.0f}s", flush=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav_path), "-af", FILTRO, "-ar", "44100", "-b:a", "128k", str(PASTA / f"{id}.mp3")], check=True)
print("fim", len(falas), "falas", flush=True)
