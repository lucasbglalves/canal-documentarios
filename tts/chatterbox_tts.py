# Gera a narração localmente com o Chatterbox (grátis, roda no processador).
#   tts/.venv/Scripts/python tts/chatterbox_tts.py --projeto=voepass            todas as falas
#   tts/.venv/Scripts/python tts/chatterbox_tts.py --projeto=voepass gancho-0   só essa fala
#   --ref=tts/voz-ref.wav   clona a voz desse áudio (10-20 s, uma pessoa, sem música)
# Depois: node scripts/voz.mjs --projeto=voepass --so-medir
import json, subprocess, sys, tempfile
from pathlib import Path

import torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

args = sys.argv[1:]
opt = {a[2:].split("=")[0]: a.split("=", 1)[1] for a in args if a.startswith("--") and "=" in a}
ids = [a for a in args if not a.startswith("--")]
projeto = opt.get("projeto", "voepass")
pasta = Path(f"public/voz-{projeto}")
pasta.mkdir(parents=True, exist_ok=True)

roteiro = json.loads(Path(f"src/{projeto}/roteiro.json").read_text(encoding="utf-8"))
falas = [(f"{c['id']}-{i}", f["texto"]) for c in roteiro for i, f in enumerate(c["falas"])]

torch.manual_seed(int(opt.get("seed", 7)))  # mesma seed = mesma leitura ao regerar
modelo = ChatterboxMultilingualTTS.from_pretrained(device="cpu")
if "ref" in opt:
    modelo.prepare_conditionals(opt["ref"], exaggeration=0.4)

for fid, texto in falas:
    if ids and fid not in ids:
        continue
    wav = modelo.generate(texto, language_id="pt", exaggeration=0.4, cfg_weight=0.5)
    with tempfile.TemporaryDirectory() as tmp:
        bruto = Path(tmp) / "f.wav"
        torchaudio.save(str(bruto), wav, modelo.sr)
        # tira silêncio das pontas e normaliza volume, como a saída da ElevenLabs
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(bruto), "-af",
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
                        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5",
                        "-ar", "44100", "-b:a", "128k", str(pasta / f"{fid}.mp3")], check=True)
    print("gerada", fid, flush=True)
