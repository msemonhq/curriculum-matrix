import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Six type roles, defined once in tailwind.config.js. Screens pick a role; they do not invent sizes.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = (await import(pathToFileURL(resolve(root, 'tailwind.config.js')).href)).default;
const { fontSize, fontFamily } = config.theme.extend;
const px = (rem) => parseFloat(rem) * 16;

test('the roles are Display, Figure, Title, Body, Meta and Kicker, at the planned sizes', () => {
  const sizes = Object.fromEntries(
    Object.entries(fontSize).map(([role, [size, { lineHeight }]]) => [role, `${px(size)}/${px(lineHeight)}`]),
  );
  assert.deepEqual(sizes, {
    display: '32/36',
    figure: '40/40',
    title: '20/26',
    body: '15/24',
    meta: '13/18',
    kicker: '12/16',
  });
});

test('nothing is smaller than 12px', () => {
  for (const [role, [size]] of Object.entries(fontSize)) assert.ok(px(size) >= 12, `${role} is ${px(size)}px`);
});

test('the kicker is sentence-case friendly: 500 weight and 0.02em tracking', () => {
  const [, { fontWeight, letterSpacing }] = fontSize.kicker;
  assert.equal(fontWeight, '500');
  assert.equal(letterSpacing, '0.02em');
});

test('the serif face is the first choice for the serif roles and a system serif follows it', () => {
  assert.equal(fontFamily.serif[0], 'Newsreader');
  assert.ok(fontFamily.serif.includes('serif'));
  const css = readFileSync(resolve(root, 'src/index.css'), 'utf8');
  assert.match(css, /\.text-display,\s*\.text-figure,\s*\.text-title\s*\{\s*font-family:\s*theme\('fontFamily\.serif'\)/);
});

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'assets' ? [] : walk(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
const sources = walk(resolve(root, 'src')).map((path) => ({ name: relative(root, path), text: readFileSync(path, 'utf8') }));

const scan = (pattern) => {
  const hits = [];
  for (const { name, text } of sources) {
    text.split('\n').forEach((line, i) => {
      const found = line.match(pattern);
      if (found) hits.push(`${name}:${i + 1}: ${found[0]}`);
    });
  }
  return hits;
};

test('no arbitrary font sizes such as text-[13px]', () => {
  assert.deepEqual(scan(/(?<![\w-])text-\[[0-9.]+(?:px|rem|em)\]/), []);
});

test('no Tailwind default sizes (text-sm, text-xl ...) and no retired role names', () => {
  assert.deepEqual(scan(/(?<![\w-])text-(?:xs|sm|base|lg|xl|[2-9]xl|heading|caption|micro)(?![\w-])/), []);
});

test('UI text uses the planned weights: no bold, extrabold or black', () => {
  assert.deepEqual(scan(/(?<![\w-])font-(?:bold|extrabold|black)(?![\w-])/), []);
});
