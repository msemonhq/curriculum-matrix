import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { IconButton } from '../components/IconButton';

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-title text-ink-primary">{children}</h3>;
}

/** Muted explanatory text under a heading. */
export function Hint({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-meta text-ink-secondary ${className}`}>{children}</p>;
}

/** What to do first, shown while a list is still empty. */
export function EmptyHint({ children }: { children: React.ReactNode }) {
  return <div className="p-4 mb-3 border border-dashed border-rule rounded-xl text-body text-ink-secondary">{children}</div>;
}

/** A raised group inside a tool where the person types: one claim, one branch, one day. */
export function Panel({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 bg-surface-elevated border border-rule rounded-xl ${className}`} {...props}>{children}</div>;
}

interface ToolSectionProps {
  title: string;
  /** One line under the title, only for what the screen's own description does not already say. */
  hint?: React.ReactNode;
  /** The first section of a tool has no rule above it. */
  first?: boolean;
  children: React.ReactNode;
}

/** A titled part of a tool, separated from the part above by a hairline. */
export function ToolSection({ title, hint, first = false, children }: ToolSectionProps) {
  return (
    <section className={first ? '' : 'mt-8 border-t border-rule pt-6'}>
      <SectionHeading>{title}</SectionHeading>
      {hint && <Hint className="mt-1">{hint}</Hint>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface RemoveButtonProps {
  /** Spoken name of the action, for example "Delete claim 3". */
  label: string;
  /** True when the item holds something worth confirming before it is lost. */
  needsConfirm: boolean;
  onRemove: () => void;
}

/** A delete button that asks "Remove / Keep" first when the item has content. */
export function RemoveButton({ label, needsConfirm, onRemove }: RemoveButtonProps) {
  const [asking, setAsking] = useState(false);
  if (asking) {
    return (
      <div className="flex items-center gap-1 shrink-0" role="group" aria-label={`Confirm: ${label}`}>
        <button
          type="button"
          onClick={() => { setAsking(false); onRemove(); }}
          className="min-h-11 px-3 rounded-xl bg-danger text-surface-base text-body font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          Remove
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="min-h-11 px-3 rounded-xl text-ink-secondary text-body font-semibold hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
        >
          Keep
        </button>
      </div>
    );
  }
  return (
    <IconButton label={label} className="shrink-0" onClick={() => (needsConfirm ? setAsking(true) : onRemove())}>
      <Trash2 className="w-4 h-4" aria-hidden="true" />
    </IconButton>
  );
}
