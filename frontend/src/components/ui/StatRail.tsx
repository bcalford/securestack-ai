import type { ReactNode } from 'react';

/** A rail of metric/chart cards used for "at a glance" summaries. */
export default function StatRail({ children, ariaLabel }: { children: ReactNode; ariaLabel?: string }) {
  return (
    <div className="stat-rail" aria-label={ariaLabel}>
      {children}
    </div>
  );
}
