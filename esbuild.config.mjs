import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner = `/*
Obsidian Trae
在 Obsidian 内通过 Trae Work 整理链接文章并保存为笔记（移动端优先）
*/`;

const prod = process.argv[2] === "production";

const context = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  banner: { js: banner },
  external: ["obsidian", "electron", ...builtins],
  format: "cjs",
  target: "es2018",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

if (prod) {
  await context.rebuild();
  process.exit(0);
} else {
  await context.watch();
}
