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
const arcadeEntries = entries.filter(([source]) =>
  source.endsWith("ArcadeBridgeLabPage.tsx") || source.endsWith("BubbleShooterGame.tsx")
);
const phaserEntries = entries.filter(
  ([source]) => /(^|[\\/])node_modules[\\/]phaser[\\/]/i.test(source),
);

assert(appEntry, "Vite manifest is missing the application entry.");
assert(arcadeEntries.length === 2, "Vite manifest is missing a lazy arcade route.");
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
const [phaserSource, phaserChunk] = phaserEntries[0];
const appStaticImports = collectStaticImports(appSource);
const indexHtml = await readFile(join(projectRoot, "dist", "index.html"), "utf8");

assert(!appStaticImports.has(phaserSource), "The initial application graph statically reaches Phaser.");
for (const [arcadeSource] of arcadeEntries) {
  assert(
    collectReachableImports(arcadeSource).has(phaserSource),
    `The lazy arcade route ${arcadeSource} does not reach the Phaser chunk.`,
  );
}
assert(!indexHtml.includes(phaserChunk.file), "dist/index.html must not preload Phaser.");

console.log(JSON.stringify({
  appEntry: manifest[appSource].file,
  arcadeEntries: arcadeEntries.map(([source]) => manifest[source].file),
  phaserChunk: phaserChunk.file,
  phaserPreloaded: false,
}, null, 2));
