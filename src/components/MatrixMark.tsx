import { markCell } from '../lib/matrixMark';

interface MatrixMarkProps {
  /** The tab you are on: dashboard, curriculum, workbenches or audit. */
  activeTab: string;
}

const SQUARE = 8;
const ORIGIN = 1;
const STEP = 12;
const CORNERS = [0, 1] as const;

/**
 * The app mark: a 2 by 2 grid of outlined squares, one filled in Signal. The filled square slides to the
 * square that belongs to the screen you are on. It is a plain CSS transform, so it needs no animation
 * library, and the global reduced-motion rule in index.css makes it jump instead of slide.
 */
export function MatrixMark({ activeTab }: MatrixMarkProps) {
  const { col, row } = markCell(activeTab);
  return (
    <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" data-mark-col={col} data-mark-row={row}>
        {CORNERS.flatMap((r) =>
          CORNERS.map((c) => (
            <rect
              key={`${c}${r}`}
              x={ORIGIN + c * STEP}
              y={ORIGIN + r * STEP}
              width={SQUARE}
              height={SQUARE}
              rx="2.5"
              className="fill-surface-overlay stroke-edge/50"
              strokeWidth="0.8"
            />
          )),
        )}
        <rect
          data-mark-fill
          x={ORIGIN}
          y={ORIGIN}
          width={SQUARE}
          height={SQUARE}
          rx="2.5"
          className="fill-accent"
          style={{ transform: `translate(${col * STEP}px, ${row * STEP}px)`, transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
    </div>
  );
}
