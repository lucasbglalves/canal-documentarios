# Converte roteiro-novo.md em roteiro.json: legenda com algarismos, texto por extenso para a voz.
import json, re, sys
sys.stdout.reconfigure(encoding="utf-8")
U="zero um dois três quatro cinco seis sete oito nove dez onze doze treze catorze quinze dezesseis dezessete dezoito dezenove".split()
D=[0,0,"vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"]
C=["","cento","duzentos","trezentos","quatrocentos","quinhentos","seiscentos","setecentos","oitocentos","novecentos"]
def ate999(n,f=False):
    if n==100: return "cem"
    p=[]
    if n>=100:p.append(C[n//100]);n%=100
    if n>=20:
        p.append(D[n//10]);n%=10
    if n or not p:p.append(U[n])
    s=" e ".join(p)
    if f:
        s=s.replace("cento","\0").replace("entos","entas").replace("\0","cento")
        s=re.sub(r"\bum$","uma",s); s=re.sub(r"\bdois$","duas",s)
    return s
def ext(n,f=False):
    if n>=1000:
        m,r=divmod(n,1000)
        s=("mil" if m==1 else ate999(m)+" mil")
        if r: s+=(" e " if r<100 or r%100==0 else " ")+ate999(r,f)
        return s
    return ate999(n,f)
FEM=r"(pessoas|páginas|horas|voltas|notificações|vezes|recomendações)"
def fala(t):
    t=t.replace("PS-VPB","P S V P B").replace("ATR 72-500","A T R setenta e dois quinhentos").replace("ATR 72-600","A T R setenta e dois seiscentos").replace("ATR 72","A T R setenta e dois").replace("o 500,","o quinhentos,")
    t=re.sub(r"\bATR\b","A T R",t); t=re.sub(r"\bAPM\b","A P M",t)
    t=t.replace("Às 9h06","Às nove e seis")
    t=re.sub(r"(\d{1,2})h(\d\d) e (\d+)( segundos)?",lambda m:f"{ext(int(m[1]))} e {ext(int(m[2]))}, e {ext(int(m[3]))} segundos",t)
    t=re.sub(r"(\d{1,2})h(\d\d)",lambda m:f"{ext(int(m[1]))} e {ext(int(m[2]))}",t)
    t=re.sub(r"(\d+)%",lambda m:ext(int(m[1]))+" por cento",t)
    t=re.sub(r"\b(\d+) mil\b",lambda m:ext(int(m[1]))+" mil",t)
    t=re.sub(r"\b(\d{1,3}(?:\.\d{3})|\d+)(?=\s+"+FEM+r"\b)",lambda m:ext(int(m[1].replace(".","")),True),t)
    t=re.sub(r"\b\d{1,3}(?:\.\d{3})+\b|\b\d+\b",lambda m:ext(int(m[0].replace(".",""))),t)
    t=re.sub(r"(voo|Passaredo) dois mil duzentos e oitenta e três",r"\g<1> dois dois oito três",t)
    return re.sub(r"(^|[.:?!] )([a-zà-ú])",lambda m:m[1]+m[2].upper() if m[0][-3:-1]!=": "[0:2] or m[1]!=": " else m[0],t)
md=open("src/voepass/roteiro-novo.md",encoding="utf-8").read().split("## O que mudou")[0].rsplit("---",1)[0]
IDS=["abertura","empresa","adversario","diario","despacho","avisos","minutos","vinhedo","fatores","depois","canal"]
CAU={"abertura":20,"vinhedo":30,"depois":150,"canal":130}
caps=re.split(r"^## \d+\. .*$",md,flags=re.M)[1:]; assert len(caps)==11
out=[]
for id,c in zip(IDS,caps):
    fs=[]
    for p in [x.strip() for x in c.split("\n\n") if x.strip()]:
        if p.startswith("*("): fs[-1]["pausa"]=380; continue
        leg=re.sub(r"\s*\*\*\[I.*?\]\*\*","",p).strip()
        tx=fala(leg); f={"quem":"victor","texto":tx}
        if tx!=leg: f["legenda"]=leg
        fs.append(f)
    out.append({"id":id,"cauda":CAU.get(id,12),"falas":fs})
json.dump(out,open("src/voepass/roteiro.json","w",encoding="utf-8"),ensure_ascii=False,indent=1)
n=0
for c in out:
    print("##",c["id"],len(c["falas"]))
    for i,f in enumerate(c["falas"]):
        n+=len(f["texto"])
        if "legenda" in f: print(i,f["texto"])
print("total",n)
assert not re.search(r"\d"," ".join(f["texto"] for c in out for f in c["falas"]))
