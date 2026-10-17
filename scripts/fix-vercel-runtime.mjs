// @astrojs/vercel 7.x (last version for Astro 4) only knows Node 18/20 and writes
// nodejs18.x into the function config, which Vercel now rejects. Point every
// function at the Node major the build actually ran on instead.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const runtime = `nodejs${process.versions.node.split('.')[0]}.x`;
const root = '.vercel/output/functions';

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (!entry.name.endsWith('.func')) {
      walk(path);
      continue;
    }
    const configPath = join(path, '.vc-config.json');
    if (!existsSync(configPath)) continue;
    const config = JSON.parse(readFileSync(configPath, 'utf8'));
    if (config.runtime?.startsWith('nodejs') && config.runtime !== runtime) {
      console.log(`[fix-vercel-runtime] ${path}: ${config.runtime} -> ${runtime}`);
      config.runtime = runtime;
      writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  }
}

if (existsSync(root)) walk(root);
