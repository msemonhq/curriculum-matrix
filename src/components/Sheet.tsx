import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Sheet({ isOpen, onClose, title, children }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
            tabIndex={-1}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto bg-surface-overlay border-t border-line rounded-t-3xl shadow-surface-lg safe-bottom focus:outline-none"
          >
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>
            {title && (
              <div className="px-5 py-3 border-b border-line">
                <h3 id="sheet-title" className="text-title text-ink-primary">{title}</h3>
              </div>
            )}
            <div className="p-5 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
