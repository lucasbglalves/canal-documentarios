# Monta mosaicos Sentinel-2 cloudless 2016 (EOX, CC BY 4.0) a partir dos tiles WMTS.
# uso: python -I sat.py <saida.jpg> <lat> <lon> <zoom> <meia_largura_em_tiles>
import io, math, subprocess, sys, time
from PIL import Image

saida, lat, lon, z, n = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
URL = "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"

def tile(lat, lon, z):
    k = 2 ** z
    x = (lon + 180) / 360 * k
    y = (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * k
    return int(x), int(y)

cx, cy = tile(lat, lon, z)
img = Image.new("RGB", (2 * n * 256, 2 * n * 256))
for j in range(-n, n):
    for i in range(-n, n):
        # urllib trava nesta máquina (curl funciona), por isso chama o curl
        cmd = ["curl", "-sf", "--max-time", "30", "-A", "voepass-video/0.1", URL.format(z=z, x=cx + i, y=cy + j)]
        for tentativa in range(3):
            try:
                img.paste(Image.open(io.BytesIO(subprocess.run(cmd, capture_output=True, check=True).stdout)), ((i + n) * 256, (j + n) * 256))
                break
            except Exception as e:
                print("falhou", z, cx + i, cy + j, e)
                time.sleep(1)
img.save(saida, quality=90)
print(saida, img.size, "canto NW tile", cx - n, cy - n)
