import { motion } from 'framer-motion';

/** Visual only: the surrounding button carries the checkbox role and state. */
export function CheckMark({ isChecked }: { isChecked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
        isChecked
          ? 'bg-accent/20 border border-accent'
          : 'bg-surface-base border border-edge'
      }`}
    >
      <svg className="w-3.5 h-3.5 text-accent" viewBox="0 0 16 16" fill="none">
        <motion.path
          d="M3.5 8.5L6.5 11.5L12.5 5"
          stroke={isChecked ? 'currentColor' : 'transparent'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{
            pathLength: isChecked ? 1 : 0,
            opacity: isChecked ? 1 : 0,
          }}
          transition={{
            pathLength: { type: 'spring', stiffness: 450, damping: 28 },
            opacity: { duration: 0.15 },
          }}
        />
      </svg>
      {isChecked && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-0 rounded-md bg-accent/40 pointer-events-none"
        />
      )}
    </span>
  );
}
