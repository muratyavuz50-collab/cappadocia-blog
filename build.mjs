import { mkdir, readFile, readdir, rm } from "node:fs/promises";
import { build } from "esbuild";

const out = new URL("./dist/", import.meta.url);
await rm(out, { recursive: true, force: true });
await mkdir(new URL("./server/", out), { recursive: true });
const files = {
  "/styles.css": ["./styles.css", "text/css; charset=utf-8"],
  "/site.js": ["./site.js", "application/javascript; charset=utf-8"],
  "/admin.css": ["./admin.css", "text/css; charset=utf-8"],
  "/admin.js": ["./admin.js", "application/javascript; charset=utf-8"],
  "/favicon.svg": ["./assets/favicon.svg", "image/svg+xml"],
  "/googlef58436032d816b1e.html": ["./googlef58436032d816b1e.html", "text/html; charset=utf-8"],
  "/assets/cappadocia-sunrise.webp": ["./assets/cappadocia-sunrise.webp", "image/webp"],
};
const assets = {};
for (const file of await readdir(new URL("./assets/articles/", import.meta.url))) {
  if (file.endsWith(".webp")) files[`/assets/articles/${file}`] = [`./assets/articles/${file}`, "image/webp"];
}
for (const [path, [source,type]] of Object.entries(files)) {
  assets[path] = { type, base64: (await readFile(new URL(source, import.meta.url))).toString("base64") };
}
const client=await build({entryPoints:["site.js"],bundle:true,minify:true,format:"iife",target:"es2020",write:false});
assets["/site.js"]={type:"application/javascript; charset=utf-8",base64:Buffer.from(client.outputFiles[0].contents).toString("base64")};
await build({ entryPoints: ["worker.mjs"], outfile: "dist/server/index.js", bundle: true,
  format: "esm", platform: "browser", target: "es2022",
  plugins: [{ name: "static-assets", setup(builder) {
    builder.onResolve({filter:/^site-assets$/},()=>({path:"site-assets",namespace:"assets"}));
    builder.onLoad({filter:/.*/,namespace:"assets"},()=>({contents:`export default ${JSON.stringify(assets)};`,loader:"js"}));
  }}],
});
const worker = await import(new URL("./server/index.js", out));
if (typeof worker.default?.fetch !== "function") throw new Error("Worker fetch export missing.");
console.log("Built persistent editorial CMS, public guides and travel planning.");
