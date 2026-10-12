import React, { useCallback, useMemo, useState } from 'react';
import { Toast } from './Toast';
import type { ToastTone } from './Toast';
import { ToastContext } from '../hooks/useToast';

interface ActiveToast {
  id: number;
  message: string;
  tone: ToastTone;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast((current) => ({ id: (current?.id ?? 0) + 1, message, tone }));
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  const api = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* key restarts the auto-dismiss timer when the same message is shown twice */}
      {toast && <Toast key={toast.id} message={toast.message} tone={toast.tone} onClose={dismiss} />}
    </ToastContext.Provider>
  );
}
