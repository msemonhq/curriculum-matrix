import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The app must render offline and must not call a third party at launch, so fonts are bundled.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

const css = read('src/index.css');
const fontFaces = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);

test('index.html does not load fonts or styles from a remote host', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
  assert.doesNotMatch(html, /<link[^>]+href=["'](?:https?:)?\/\//i);
});

test('the stylesheet does not import anything remote', () => {
  assert.doesNotMatch(css, /@import\s+(?:url\()?\s*["']?(?:https?:)?\/\//i);
  assert.doesNotMatch(css, /url\(\s*["']?(?:https?:)?\/\//i);
});

test('every @font-face points at a bundled WOFF2 file that exists', () => {
  assert.ok(fontFaces.length >= 2, 'expected @font-face rules for Geist and Geist Mono');
  for (const face of fontFaces) {
    assert.match(face, /font-display:\s*swap/, 'font-display: swap keeps text visible while a font loads');
    const urls = [...face.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    assert.ok(urls.length > 0, `no url() in: ${face}`);
    for (const url of urls) {
      assert.match(url, /^\.{1,2}\//, `font url must be a relative path, got ${url}`);
      const file = resolve(root, 'src', url);
      assert.ok(existsSync(file), `missing font file ${url}`);
      assert.equal(readFileSync(file).subarray(0, 4).toString('latin1'), 'wOF2', `${url} is not a WOFF2 file`);
    }
  }
});

test('the families Tailwind asks for first are the ones that are bundled', async () => {
  const config = (await import(pathToFileURL(resolve(root, 'tailwind.config.js')).href)).default;
  const declared = fontFaces.map((face) => /font-family:\s*["']([^"']+)["']/.exec(face)?.[1]);
  const { sans, mono } = config.theme.extend.fontFamily;
  assert.ok(declared.includes(sans[0]), `${sans[0]} has no @font-face`);
  assert.ok(declared.includes(mono[0]), `${mono[0]} has no @font-face`);
});

test('the license ships with the fonts', () => {
  assert.match(read('src/assets/fonts/OFL.txt'), /SIL OPEN FONT LICENSE/i);
});
