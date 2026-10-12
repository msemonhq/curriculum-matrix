// Study reminders on top of @capacitor/local-notifications. One reminder per phase: the
// notification id is derived from the phase id, so setting it again replaces the old one.
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { REMINDER_ID_MAX, REMINDER_ID_MIN, reminderNotificationId } from '../lib/reminderIds';

export type ReminderFailure = 'browser' | 'denied' | 'past' | 'error';

export type ReminderResult =
  | { ok: true }
  | { ok: false; reason: ReminderFailure; message: string };

const MESSAGES: Record<ReminderFailure, string> = {
  browser: 'Reminders only work in the Android app, not in a browser.',
  denied: 'Notifications are off for this app. Turn them on in Android settings, then try again.',
  past: 'That time has already passed. Pick a later time.',
  error: 'Could not set the reminder. Please try again.',
};

const fail = (reason: ReminderFailure): ReminderResult => ({ ok: false, reason, message: MESSAGES[reason] });

/** Checks permission first and only asks when Android hasn't decided yet. */
async function ensurePermission(): Promise<boolean> {
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return true;
  if (current.display === 'prompt' || current.display === 'prompt-with-rationale') {
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted';
  }
  return false;
}

export async function scheduleReminder(phaseId: string, phaseTitle: string, at: Date): Promise<ReminderResult> {
  if (!Capacitor.isNativePlatform()) return fail('browser');
  if (at.getTime() <= Date.now()) return fail('past');
  try {
    if (!(await ensurePermission())) return fail('denied');
    const id = reminderNotificationId(phaseId);
    // Cancel first so a second reminder for the same phase can never leave two pending.
    await LocalNotifications.cancel({ notifications: [{ id }] });
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title: 'Curriculum Reminder',
        body: `Time to get back to ${phaseTitle}!`,
        schedule: { at, allowWhileIdle: true },
      }],
    });
    return { ok: true };
  } catch {
    return fail('error');
  }
}

export async function cancelReminder(phaseId: string): Promise<ReminderResult> {
  if (!Capacitor.isNativePlatform()) return { ok: true }; // nothing can be scheduled in a browser
  try {
    await LocalNotifications.cancel({ notifications: [{ id: reminderNotificationId(phaseId) }] });
    return { ok: true };
  } catch {
    return fail('error');
  }
}

/** The time of the phase's pending notification according to the OS; null when none (or in a browser). */
export async function getReminder(phaseId: string): Promise<Date | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const { notifications } = await LocalNotifications.getPending();
    const at = notifications.find((n) => n.id === reminderNotificationId(phaseId))?.schedule?.at;
    return at ? new Date(at) : null;
  } catch {
    return null;
  }
}

/** Cancels every phase reminder (used by "Reset all progress"). Best effort. */
export async function cancelAllReminders(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { notifications } = await LocalNotifications.getPending();
    const ours = notifications.filter((n) => n.id >= REMINDER_ID_MIN && n.id <= REMINDER_ID_MAX).map((n) => ({ id: n.id }));
    if (ours.length > 0) await LocalNotifications.cancel({ notifications: ours });
  } catch {
    // Nothing useful to do if the OS call fails; the store entries are cleared regardless.
  }
}
