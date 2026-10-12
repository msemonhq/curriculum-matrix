import { test } from 'node:test';
import assert from 'node:assert/strict';
import { REMINDER_ID_MAX, REMINDER_ID_MIN, reminderNotificationId } from './reminderIds.ts';

test('each phase gets its own stable notification id', () => {
  assert.equal(reminderNotificationId('phase_1'), 1001);
  assert.equal(reminderNotificationId('phase_8'), 1008);
  assert.equal(reminderNotificationId('phase_3'), reminderNotificationId('phase_3'));
  const ids = Array.from({ length: 8 }, (_, i) => reminderNotificationId(`phase_${i + 1}`));
  assert.equal(new Set(ids).size, 8);
  for (const id of ids) assert.ok(id >= REMINDER_ID_MIN && id <= REMINDER_ID_MAX);
});
