#!/usr/bin/env node

/**
 * Lightweight Supabase Edge Function static checks.
 *
 * This catches cheap-but-expensive mistakes before deploy:
 * - missing function entrypoints
 * - missing Deno.serve calls
 * - broken local relative imports
 * - public functions without explicit config visibility
 *
 * It intentionally does not require Supabase credentials or a linked project.
 */

import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, normalize, relative } from "node:path";

const ROOT = process.cwd();
const FUNCTIONS_DIR = join(ROOT, "supabase", "functions");
const CONFIG_PATH = join(ROOT, "supabase", "config.toml");

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
  console.error(`❌ ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`⚠️  ${message}`);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

async function dirs(path) {
  return (await readdir(path, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function localImportTargets(source) {
  const targets = [];
  const importRe = /(?:import|export)\s+(?:[^"']+\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g;
  let match;
  while ((match = importRe.exec(source))) targets.push(match[1]);
  return targets;
}

async function walkTsFiles(path, files = []) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const full = join(path, entry.name);
    if (entry.isDirectory()) await walkTsFiles(full, files);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function resolveLocalImport(fromFile, target) {
  const base = normalize(join(dirname(fromFile), target));
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return candidates.some((candidate) => existsSync(candidate));
}

function rel(path) {
  return relative(ROOT, path);
}

async function main() {
  if (!existsSync(FUNCTIONS_DIR)) fail("supabase/functions directory is missing");
  if (!existsSync(CONFIG_PATH)) fail("supabase/config.toml is missing");
  if (failures.length) process.exit(1);

  const config = await readFile(CONFIG_PATH, "utf8");
  const functionDirs = (await dirs(FUNCTIONS_DIR)).filter((name) => !name.startsWith("_"));

  if (functionDirs.length === 0) fail("No Supabase function directories found");

  for (const functionName of functionDirs) {
    const entry = join(FUNCTIONS_DIR, functionName, "index.ts");
    if (!existsSync(entry)) {
      fail(`${functionName} is missing index.ts`);
      continue;
    }

    const source = await readFile(entry, "utf8");
    if (!source.includes("Deno.serve")) {
      fail(`${functionName}/index.ts does not call Deno.serve`);
    }

    if (!source.includes("OPTIONS")) {
      warn(`${functionName}/index.ts does not appear to handle OPTIONS requests`);
    }

    const configSection = `[functions.${functionName}]`;
    if (!config.includes(configSection)) {
      warn(`${functionName} has no explicit supabase/config.toml section`);
    }
  }

  const allTs = await walkTsFiles(FUNCTIONS_DIR);
  for (const file of allTs) {
    const source = await readFile(file, "utf8");
    for (const target of localImportTargets(source)) {
      if (!resolveLocalImport(file, target)) {
        fail(`${rel(file)} imports missing local module ${target}`);
      }
    }
  }

  if (failures.length) {
    console.error(`\nSupabase function checks failed with ${failures.length} issue(s).`);
    process.exit(1);
  }

  ok(`Checked ${functionDirs.length} Supabase functions and ${allTs.length} TypeScript files.`);
  if (warnings.length) {
    console.log(`Warnings: ${warnings.length}. These are cleanup targets, not CI blockers yet.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
