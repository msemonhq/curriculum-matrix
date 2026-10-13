// Fails when a source file has a byte-order mark, is not valid UTF-8, or contains the damaged-dash
// pattern ("â€“", "â€”", ...) that appears when UTF-8 text is read back as Windows-1252.
// Usage: node scripts/check-encoding.mjs [dir ...]   (default: src)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Built from code points so this file never contains the damaged sequence itself.
const DAMAGED = new RegExp(`${String.fromCharCode(0x00e2)}${String.fromCharCode(0x20ac)}`);
const TEXT_FILE = /\.(ts|tsx|js|jsx|mjs|cjs|json|css|html|md)$/;

export function findProblems(name, bytes) {
  const problems = [];
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    problems.push(`${name}: starts with a byte-order mark (save as UTF-8 without BOM)`);
  }
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    problems.push(`${name}: is not valid UTF-8`);
    return problems;
  }
  text.split('\n').forEach((line, index) => {
    if (DAMAGED.test(line)) {
      problems.push(`${name}:${index + 1}: damaged dash/quote (UTF-8 read as Windows-1252): ${line.trim().slice(0, 80)}`);
    }
  });
  return problems;
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (TEXT_FILE.test(entry)) yield path;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const dirs = process.argv.slice(2);
  const roots = dirs.length > 0 ? dirs : ['src'];
  const problems = [];
  let checked = 0;
  for (const root of roots) {
    for (const file of walk(root)) {
      checked += 1;
      problems.push(...findProblems(file, readFileSync(file)));
    }
  }
  if (problems.length > 0) {
    console.error(problems.join('\n'));
    console.error(`\nEncoding check failed (${problems.length} problem(s) in ${checked} files).`);
    process.exit(1);
  }
  console.log(`Encoding check passed (${checked} files).`);
}
