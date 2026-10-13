import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findProblems } from './check-encoding.mjs';

const enc = (s) => new TextEncoder().encode(s);
const damagedDash = String.fromCharCode(0x00e2, 0x20ac, 0x201c);

test('clean UTF-8 with real dashes passes', () => {
  assert.deepEqual(findProblems('a.ts', enc('const range = "15\u201318h"; // em dash \u2014 ok')), []);
});

test('a byte-order mark is reported', () => {
  const withBom = new Uint8Array([0xef, 0xbb, 0xbf, ...enc('x')]);
  assert.match(findProblems('a.ts', withBom)[0], /byte-order mark/);
});

test('the damaged-dash pattern is reported with its line number', () => {
  const problems = findProblems('a.ts', enc(`ok\nconst s = "15${damagedDash}18h";\n`));
  assert.equal(problems.length, 1);
  assert.match(problems[0], /a\.ts:2: damaged dash/);
});

test('invalid UTF-8 is reported', () => {
  assert.match(findProblems('a.ts', new Uint8Array([0x61, 0xff, 0xfe]))[0], /not valid UTF-8/);
});
