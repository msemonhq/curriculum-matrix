import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asCalendarEvents, daysUntil, inDaysAtNine, looseDateToYmd, nextEvent, parseYmd, reminderTimeOn, toYmd } from './dates.ts';

const NOW = new Date(2026, 9, 12, 13, 0, 0); // Mon 12 Oct 2026, 13:00 local

test('free text without a year becomes the next occurrence on or after today', () => {
  assert.equal(looseDateToYmd('Oct 15', NOW), '2026-10-15');
  assert.equal(looseDateToYmd('October 15th', NOW), '2026-10-15');
  assert.equal(looseDateToYmd('15 Oct', NOW), '2026-10-15');
  assert.equal(looseDateToYmd('Oct 12', NOW), '2026-10-12'); // today still counts
  assert.equal(looseDateToYmd('Oct 11', NOW), '2027-10-11'); // already passed this year
  assert.equal(looseDateToYmd('Jan 5', NOW), '2027-01-05');
});

test('an explicit year or ISO date is kept as written', () => {
  assert.equal(looseDateToYmd('Oct 15, 2027', NOW), '2027-10-15');
  assert.equal(looseDateToYmd('2026-12-01', NOW), '2026-12-01');
  assert.equal(looseDateToYmd('Mar 3 2020', NOW), '2020-03-03');
});

test('unreadable or impossible dates come back empty', () => {
  for (const bad of ['', '  ', 'sometime in Q4', 'Octember 5', 'Feb 30', '2026-13-01', 'Oct 32', null, 42, undefined]) {
    assert.equal(looseDateToYmd(bad, NOW), '', `expected empty for ${String(bad)}`);
  }
});

test('Feb 29 resolves to the next leap year', () => {
  assert.equal(looseDateToYmd('Feb 29', NOW), '2028-02-29');
});

test('parseYmd is strict', () => {
  assert.deepEqual(parseYmd('2026-10-15'), { year: 2026, month: 10, day: 15 });
  assert.equal(parseYmd('2026-2-3'), null);
  assert.equal(parseYmd('2026-02-30'), null);
  assert.equal(parseYmd(5), null);
});

test('reminder times are 09:00 local', () => {
  const at = reminderTimeOn('2026-10-15');
  assert.ok(at);
  assert.equal(at.getHours(), 9);
  assert.equal(toYmd(at), '2026-10-15');
  assert.equal(reminderTimeOn('nope'), null);
  const tomorrow = inDaysAtNine(NOW, 1);
  assert.equal(toYmd(tomorrow), '2026-10-13');
  assert.equal(tomorrow.getHours(), 9);
  assert.equal(toYmd(inDaysAtNine(NOW, 3)), '2026-10-15');
  assert.equal(toYmd(inDaysAtNine(new Date(2026, 11, 30, 10), 3)), '2027-01-02'); // crosses the year
});

test('nextEvent picks the soonest future event and skips past, empty and invalid dates', () => {
  const events = [
    { date: '2026-10-12', title: 'Today but 09:00 has passed' },
    { date: '', title: 'No date' },
    { date: '2026-11-20', title: 'Later' },
    { date: '2026-10-15', title: 'Soonest' },
    { date: '2026-09-01', title: 'Past' },
  ];
  const next = nextEvent(events, NOW);
  assert.equal(next?.title, 'Soonest');
  assert.equal(toYmd(next!.at), '2026-10-15');
  assert.equal(nextEvent([], NOW), null);
  assert.equal(nextEvent([{ date: '2026-01-01', title: 'x' }], NOW), null);
});

test('asCalendarEvents tolerates untyped saved data', () => {
  assert.deepEqual(asCalendarEvents([{ date: '2026-10-15', title: 'A' }, null, 'x', { date: 5 }]), [
    { date: '2026-10-15', title: 'A' },
    { date: '', title: '' },
  ]);
  assert.deepEqual(asCalendarEvents(undefined), []);
  assert.deepEqual(asCalendarEvents({}), []);
});

test('daysUntil counts calendar days from today, across month ends and daylight-saving changes', () => {
  assert.equal(daysUntil('2026-10-12', NOW), 0);
  assert.equal(daysUntil('2026-10-13', NOW), 1);
  assert.equal(daysUntil('2026-10-11', NOW), -1);
  assert.equal(daysUntil('2026-11-01', NOW), 20);
  assert.equal(daysUntil('2027-10-12', NOW), 365);
  assert.equal(daysUntil('2026-03-29', new Date(2026, 2, 28, 23, 59)), 1);
  assert.equal(daysUntil('', NOW), null);
  assert.equal(daysUntil('2026-02-30', NOW), null);
});
