import React, { useEffect } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';

export type ToastTone = 'success' | 'danger' | 'info';

interface ToastProps {
  message: string;
  tone?: ToastTone;
  onClose: () => void;
  duration?: number;
}

const toneStyles: Record<ToastTone, string> = {
  success: 'bg-success-dim border-success/30 text-success',
  danger: 'bg-danger-dim border-danger/30 text-danger',
  info: 'bg-accent-dim border-accent/30 text-accent',
};

export function Toast({ message, tone = 'info', onClose, duration = 3200 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`fixed left-4 right-4 top-4 z-[60] flex items-center gap-3 rounded-xl border px-4 py-3 text-body shadow-surface-lg ${toneStyles[tone]}`}
    >
      {tone === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" /> : <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />}
      <span className="min-w-0 flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="min-h-11 min-w-11 rounded-full p-2 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
