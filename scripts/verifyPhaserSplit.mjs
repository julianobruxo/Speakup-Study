import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(
  await readFile(join(projectRoot, "dist", ".vite", "manifest.json"), "utf8"),
);
const entries = Object.entries(manifest);
const appEntry = entries.find(([, chunk]) => chunk.isEntry);
const arcadeEntry = entries.find(([source]) => source.endsWith("ArcadeBridgeLabPage.tsx"));
const phaserEntries = entries.filter(
  ([source, chunk]) => source.toLowerCase().includes("phaser") || chunk.file.toLowerCase().includes("phaser"),
);

assert(appEntry, "Vite manifest is missing the application entry.");
assert(arcadeEntry, "Vite manifest is missing the lazy arcade bridge route.");
assert(phaserEntries.length === 1, `Expected one Phaser chunk, found ${phaserEntries.length}.`);

function collectStaticImports(source, collected = new Set()) {
  if (collected.has(source)) return collected;
  collected.add(source);
  for (const importedSource of manifest[source]?.imports ?? []) {
    collectStaticImports(importedSource, collected);
  }
  return collected;
}

function collectReachableImports(source, collected = new Set()) {
  if (collected.has(source)) return collected;
  collected.add(source);
  const chunk = manifest[source];
  for (const importedSource of [...(chunk?.imports ?? []), ...(chunk?.dynamicImports ?? [])]) {
    collectReachableImports(importedSource, collected);
  }
  return collected;
}

const [appSource] = appEntry;
const [arcadeSource] = arcadeEntry;
const [phaserSource, phaserChunk] = phaserEntries[0];
const appStaticImports = collectStaticImports(appSource);
const arcadeImports = collectReachableImports(arcadeSource);
const indexHtml = await readFile(join(projectRoot, "dist", "index.html"), "utf8");

assert(!appStaticImports.has(phaserSource), "The initial application graph statically reaches Phaser.");
assert(arcadeImports.has(phaserSource), "The lazy arcade route does not reach the Phaser chunk.");
assert(!indexHtml.includes(phaserChunk.file), "dist/index.html must not preload Phaser.");

console.log(JSON.stringify({
  appEntry: manifest[appSource].file,
  arcadeEntry: manifest[arcadeSource].file,
  phaserChunk: phaserChunk.file,
  phaserPreloaded: false,
}, null, 2));
