// Sharing and copying text from the app. Uses the native share sheet when it exists and the
// clipboard otherwise, and says which one happened so the screen can tell the person.

export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function wasCancelled(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /abort|cancel/i.test(message);
}

export async function shareText(title: string, value: string): Promise<ShareOutcome> {
  try {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text: value, dialogTitle: title });
    return 'shared';
  } catch (error) {
    if (wasCancelled(error)) return 'cancelled';
    return (await copyText(value)) ? 'copied' : 'failed';
  }
}
