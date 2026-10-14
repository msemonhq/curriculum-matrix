import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The colours live in tailwind.config.js and nowhere else. These tests keep it that way, and keep
// the derived tones honest: each is recomputed from the six named colours, and every text colour
// is checked against every surface it can sit on.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = (await import(pathToFileURL(resolve(root, 'tailwind.config.js')).href)).default;
const colors = config.theme.extend.colors;

const PALETTE = {
  press: '#0B0D10',
  graphite: '#151920',
  folio: '#ECE8DF',
  signal: '#00C4DB',
  clock: '#F7941E',
  brick: '#F87171',
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (fg, bg, alpha) => {
  const [f, b] = [rgb(fg), rgb(bg)];
  return f.map((v, i) => v * alpha + b[i] * (1 - alpha));
};
const linear = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (channels) => {
  const [r, g, b] = channels.map(linear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('the six named colours are the plan’s palette', () => {
  assert.equal(colors.surface.base, PALETTE.press);
  assert.equal(colors.surface.elevated, PALETTE.graphite);
  assert.equal(colors.ink.primary, PALETTE.folio);
  assert.equal(colors.accent.DEFAULT, PALETTE.signal);
  assert.equal(colors.clock.DEFAULT, PALETTE.clock);
  assert.equal(colors.danger.DEFAULT, PALETTE.brick);
});

test('status words borrow a palette colour instead of adding one', () => {
  assert.deepEqual(colors.success, colors.accent);
  assert.deepEqual(colors.warning, colors.clock);
});

test('each derived tone is Folio blended over Press or Graphite, as its comment says', () => {
  const derived = [
    ['surface.subtle', colors.surface.subtle, mix(PALETTE.folio, PALETTE.graphite, 0.04)],
    ['surface.overlay', colors.surface.overlay, mix(PALETTE.folio, PALETTE.graphite, 0.07)],
    ['ink.secondary', colors.ink.secondary, mix(PALETTE.folio, PALETTE.press, 0.72)],
    ['ink.tertiary', colors.ink.tertiary, mix(PALETTE.folio, PALETTE.press, 0.6)],
    ['edge', colors.edge, mix(PALETTE.folio, PALETTE.press, 0.42)],
    ['rule', colors.rule, mix(PALETTE.folio, PALETTE.press, 0.14)],
  ];
  for (const [name, hex, expected] of derived) {
    rgb(hex).forEach((channel, i) => {
      assert.ok(Math.abs(channel - expected[i]) <= 1, `${name} ${hex} drifted from its blend ${expected.map(Math.round)}`);
    });
  }
});

test('every text colour reads at 4.5:1 on every surface', () => {
  const surfaces = Object.entries(colors.surface);
  const texts = [
    ['ink.primary', colors.ink.primary], ['ink.secondary', colors.ink.secondary], ['ink.tertiary', colors.ink.tertiary],
    ['accent', colors.accent.DEFAULT], ['clock', colors.clock.DEFAULT], ['danger', colors.danger.DEFAULT],
  ];
  for (const [textName, fg] of texts) {
    for (const [surfaceName, bg] of surfaces) {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= 4.5, `${textName} ${fg} on surface.${surfaceName} ${bg} is ${ratio.toFixed(2)}:1`);
    }
  }
});

test('control borders (edge) reach 3:1 on the page and on a raised panel', () => {
  for (const bg of [colors.surface.base, colors.surface.elevated]) {
    const ratio = contrast(colors.edge, bg);
    assert.ok(ratio >= 3, `edge ${colors.edge} on ${bg} is ${ratio.toFixed(2)}:1`);
  }
});

test('text on a filled button reads at 4.5:1', () => {
  for (const fill of [colors.accent.DEFAULT, colors.danger.DEFAULT]) {
    const ratio = contrast(colors.surface.base, fill);
    assert.ok(ratio >= 4.5, `Press on ${fill} is ${ratio.toFixed(2)}:1`);
  }
});

// ---- the source must use the tokens, not its own colours ----

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'assets' ? [] : walk(path);
    return /\.(tsx?|css)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
const sources = [...walk(resolve(root, 'src')), resolve(root, 'index.html')].map((path) => ({
  name: relative(root, path),
  text: readFileSync(path, 'utf8'),
}));

test('no source file spells a colour as a hex or rgb() value', () => {
  const offenders = [];
  for (const { name, text } of sources) {
    text.split('\n').forEach((line, i) => {
      if (/#[0-9a-fA-F]{3,8}\b|\brgba?\(/.test(line)) offenders.push(`${name}:${i + 1}: ${line.trim().slice(0, 90)}`);
    });
  }
  assert.deepEqual(offenders, [], 'use a token from tailwind.config.js');
});

test('no source file uses a Tailwind default-palette colour', () => {
  const families = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
  const pattern = new RegExp(
    `(?<![\\w-])(?:bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|outline|decoration|placeholder|caret|accent)-(?:(?:${families})-\\d{2,3}|white|black)(?![\\w-])`,
  );
  const offenders = [];
  for (const { name, text } of sources) {
    // P1.6 deletes the per-tool hues from the registry; remove this exception with them.
    if (name === 'src/workbenches/registry.ts') continue;
    text.split('\n').forEach((line, i) => {
      const hit = line.match(pattern);
      if (hit) offenders.push(`${name}:${i + 1}: ${hit[0]}`);
    });
  }
  assert.deepEqual(offenders, []);
});

test('every colour class in the source names a token that exists', () => {
  const valid = new Set();
  for (const [family, value] of Object.entries(colors)) {
    if (typeof value === 'string') valid.add(family);
    else for (const key of Object.keys(value)) valid.add(key === 'DEFAULT' ? family : `${family}-${key}`);
  }
  const families = Object.keys(colors).concat('line', 'rokomari');
  const pattern = new RegExp(
    `(?<![\\w-])(?:bg|text|border|ring|ring-offset|fill|stroke|from|via|to|divide|outline|decoration|placeholder|caret|accent)-((?:${families.join('|')})(?:-[A-Za-z]+)?)(?![\\w-])`,
    'g',
  );
  const offenders = [];
  for (const { name, text } of sources) {
    text.split('\n').forEach((line, i) => {
      for (const [, token] of line.matchAll(pattern)) {
        if (!valid.has(token)) offenders.push(`${name}:${i + 1}: ${token}`);
      }
    });
  }
  assert.deepEqual(offenders, [], `known tokens: ${[...valid].sort().join(', ')}`);
});

// ---- the design-system page and the retired styles ----

test('docs/design-system.md names every colour token and type role', () => {
  const doc = readFileSync(resolve(root, 'docs/design-system.md'), 'utf8');
  const tokens = [];
  for (const [family, value] of Object.entries(colors)) {
    if (typeof value === 'string') tokens.push(family);
    else for (const key of Object.keys(value)) tokens.push(key === 'DEFAULT' ? family : `${family}-${key}`);
  }
  const missing = [
    ...tokens.filter((token) => !doc.includes(`\`${token}\``)),
    ...Object.keys(config.theme.extend.fontSize).filter((role) => !doc.includes(`\`text-${role}\``)).map((role) => `text-${role}`),
  ];
  assert.deepEqual(missing, [], 'add these to docs/design-system.md');
});

test('the old Card, glass, glow and accent-border styles are gone', () => {
  const offenders = [];
  for (const { name, text } of sources) {
    text.split('\n').forEach((line, i) => {
      if (/\bglass\b|glow|accent-border-top|components\/Card\b/.test(line)) offenders.push(`${name}:${i + 1}: ${line.trim().slice(0, 90)}`);
    });
  }
  assert.deepEqual(offenders, []);
  const extend = config.theme.extend;
  const defined = [...Object.keys(extend.boxShadow ?? {}), ...Object.keys(extend.keyframes ?? {}), ...Object.keys(extend.animation ?? {})];
  assert.deepEqual(defined.filter((name) => /glow/.test(name)), []);
});

// ---- buttons and controls ----

test('Button has one filled primary, one outline secondary, one text variant, and a danger confirm', () => {
  const button = readFileSync(resolve(root, 'src/components/Button.tsx'), 'utf8');
  const block = /const variants = \{([\s\S]*?)\n  \};/.exec(button)?.[1] ?? '';
  const names = [...block.matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]);
  assert.deepEqual(names, ['primary', 'secondary', 'text', 'danger']);
  assert.match(block, /primary:.*bg-accent /);
  assert.match(block, /secondary:.*bg-transparent border border-edge/);
  for (const { name, text } of sources) {
    assert.doesNotMatch(text, /variant="(?:ghost|outline)"/, `${name} uses a retired Button variant`);
  }
});

test('every input, textarea and select has an edge-toned border', () => {
  const offenders = [];
  for (const { name, text } of sources) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      const tag = /<(input|textarea|select)\b/.exec(line);
      if (!tag) return;
      const element = lines.slice(i, i + 12).join('\n').split(/\n\s*\/?>/)[0];
      if (/type="(?:file|range|checkbox|radio|hidden)"/.test(element)) return;
      if (/\bborder-rule\b/.test(element)) offenders.push(`${name}:${i + 1}: <${tag[1]}> uses border-rule`);
    });
  }
  assert.deepEqual(offenders, [], 'control borders use the edge tone (3:1), hairlines use rule');
});

test('the form-control components use edge, not rule', () => {
  for (const file of ['TextInput', 'TextArea', 'Select', 'ToolInput', 'ToolTextArea']) {
    const text = readFileSync(resolve(root, `src/components/${file}.tsx`), 'utf8');
    assert.match(text, /\bborder-edge\b/, `${file} should use border-edge`);
    assert.doesNotMatch(text, /\bborder-rule\b/, `${file} should not use border-rule`);
  }
});

test('every single-line text input is at least 44px tall', () => {
  const offenders = [];
  for (const { name, text } of sources) {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (!/<input\b/.test(line)) return;
      const element = lines.slice(i, i + 12).join('\n').split(/\n\s*\/?>/)[0];
      if (/type="(?:file|range|checkbox|radio|hidden)"/.test(element)) return;
      if (!/\bmin-h-11\b/.test(element)) offenders.push(`${name}:${i + 1}`);
    });
  }
  assert.deepEqual(offenders, []);
});

// ---- sentence case ----

test('labels are sentence case: no caps or wide-tracking utilities', () => {
  const offenders = [];
  for (const { name, text } of sources) {
    text.split('\n').forEach((line, i) => {
      if (/(?<![\w-])(?:uppercase|lowercase|capitalize|tracking-wide|tracking-wider|tracking-widest)(?![\w-])|text-transform/.test(line)) {
        offenders.push(`${name}:${i + 1}: ${line.trim().slice(0, 90)}`);
      }
    });
  }
  assert.deepEqual(offenders, []);
});
