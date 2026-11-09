import sys,re,json,difflib,unicodedata
from faster_whisper import WhisperModel
sys.stdout.reconfigure(encoding="utf-8")
m=WhisperModel(sys.argv[1],device="cpu",compute_type="int8",cpu_threads=2)
r=json.load(open("src/voepass/roteiro.json",encoding="utf-8"))
norm=lambda s:re.sub(r"[^a-z0-9 ]","",unicodedata.normalize("NFKD",s.lower()).encode("ascii","ignore").decode())
for c in r:
    for i,f in enumerate(c["falas"]):
        s,_=m.transcribe(f"public/voz-voepass/{c['id']}-{i}.mp3",language="pt",beam_size=1)
        t="".join(x.text for x in s).strip()
        q=difflib.SequenceMatcher(None,norm(f.get("legenda",f["texto"])),norm(t)).ratio()
        if q<0.93: print(f"{q:.2f}",c["id"],i,"|",t[:170],flush=True)
print("fim transcricao",flush=True)
