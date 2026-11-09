// usage: node stills.cjs <outPrefix> frame frame ...
const root = process.cwd();
const { bundle } = require(root + "/node_modules/@remotion/bundler");
const { renderStill, selectComposition, openBrowser } = require(root + "/node_modules/@remotion/renderer");
const { spawnSync } = require("child_process");
const path = require("path");
const out = process.argv[2];
const frames = process.argv.slice(3).map(Number);
(async () => {
  process.chdir(root);
  const serveUrl = await bundle({ entryPoint: root + "/src/index.ts", publicDir: root + "/public" });
  const chromiumOptions = { gl: "angle" };
  const puppeteerInstance = await openBrowser("chrome", { chromiumOptions });
  const composition = await selectComposition({ serveUrl, id: process.env.COMP || "Episodio", puppeteerInstance, chromiumOptions });
  const files = [];
  for (const frame of frames) {
    const f = `${out}-${String(frame).padStart(5, "0")}.jpg`;
    const t = Date.now();
    await renderStill({ composition, serveUrl, output: f, frame, scale: Number(process.env.SCALE || 0.25), imageFormat: "jpeg", puppeteerInstance, chromiumOptions, overwrite: true });
    console.log(frame, Date.now() - t, "ms");
    files.push(f);
  }
  await puppeteerInstance.close({ silent: true });
  const py = `from PIL import Image,ImageDraw
import sys
fs=sys.argv[2:]
ims=[Image.open(f) for f in fs]
w,h=ims[0].size
C=6
s=Image.new('RGB',(w*C,h*((len(ims)+C-1)//C)))
for i,m in enumerate(ims):
  ImageDraw.Draw(m).text((4,4),fs[i][-9:-4],fill='yellow')
  s.paste(m,((i%C)*w,(i//C)*h))
s.save(sys.argv[1])`;
  const r = spawnSync("python", ["-c", py, out + "-sheet.jpg", ...files], { encoding: "utf8" });
  console.log(r.stderr || "sheet ok");
})().catch((e) => { console.error(e); process.exit(1); });
