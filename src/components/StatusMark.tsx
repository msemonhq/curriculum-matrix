import { Check } from 'lucide-react';
import type { MarkState } from '../lib/progress';

/**
 * The one status mark in the app: solid with a tick when done, a ringed dot while under way, hollow
 * before. It is filled with the page colour so a line running behind it (the Roadmap's spine) never
 * shows through. Decorative: whoever uses it says the state in words.
 */
export function StatusMark({ state }: { state: MarkState }) {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent" aria-hidden="true">
        <Check className="h-3.5 w-3.5 text-surface-base" strokeWidth={3} />
      </span>
    );
  }
  if (state === 'active') {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-surface-base" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
    );
  }
  return <span className="h-6 w-6 shrink-0 rounded-full border-2 border-edge bg-surface-base" aria-hidden="true" />;
}
