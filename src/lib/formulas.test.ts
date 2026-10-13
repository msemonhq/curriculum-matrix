import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FORMULAS, FORMULA_GROUPS, filterFormulas } from './formulas.ts';

const names = (query: string, group?: Parameters<typeof filterFormulas>[2]) => filterFormulas(FORMULAS, query, group).map((f) => f.name);

test('entries are complete and ids are unique', () => {
  assert.equal(new Set(FORMULAS.map((f) => f.id)).size, FORMULAS.length);
  for (const f of FORMULAS) {
    assert.ok(f.name && f.formula && f.note, `${f.id} is missing text`);
    assert.ok((FORMULA_GROUPS as readonly string[]).includes(f.group), `${f.id} has an unknown group`);
  }
});

test('the Phase 3 and metric formulas the curriculum names are all there', () => {
  const all = FORMULAS.map((f) => f.name).join('|');
  for (const required of ['QUERY', 'ARRAYFORMULA', 'IMPORTRANGE', 'XLOOKUP', 'VLOOKUP', 'INDEX / MATCH', 'SUMIFS', 'UNIQUE', 'GETPIVOTDATA', 'ROI', 'CPA', 'ROAS']) {
    assert.ok(all.includes(required), `${required} is missing`);
  }
  assert.ok(FORMULAS.some((f) => f.group === 'Pivots'));
});

test('Google Sheets only formulas say how to do the same in Excel', () => {
  for (const id of ['query', 'arrayformula', 'importrange']) {
    assert.ok(FORMULAS.find((f) => f.id === id)?.excel, `${id} needs an Excel hint`);
  }
});

test('search ignores case and matches every word', () => {
  assert.equal(names('query')[0], 'QUERY'); // name matches come before notes that merely mention it
  assert.deepEqual(names('  RoAs '), ['ROAS']);
  assert.ok(names('lookup').includes('XLOOKUP') && names('lookup').includes('VLOOKUP'));
  assert.deepEqual(names('sumifs date'), ['SUMIFS']);
  assert.deepEqual(names('zzzz-nothing'), []);
});

test('an empty search lists everything and a group narrows it', () => {
  assert.equal(filterFormulas(FORMULAS, '').length, FORMULAS.length);
  assert.equal(filterFormulas(FORMULAS, '   ').length, FORMULAS.length);
  const metrics = filterFormulas(FORMULAS, '', 'Metrics');
  assert.ok(metrics.length >= 3 && metrics.every((f) => f.group === 'Metrics'));
  assert.deepEqual(names('roas', 'Lookups'), []);
  assert.deepEqual(names('roas', 'Metrics'), ['ROAS']);
});
