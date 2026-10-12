// Pure helper shared by the reminders service and its tests.

/**
 * One notification id per phase (1000 + the phase number), so scheduling again replaces the
 * previous reminder instead of adding a duplicate, and the reminder can be found and cancelled.
 */
export function reminderNotificationId(phaseId: string): number {
  const match = /(\d+)$/.exec(phaseId);
  return 1000 + (match ? Number(match[1]) : 0);
}

export const REMINDER_ID_MIN = 1000;
export const REMINDER_ID_MAX = 1999;
