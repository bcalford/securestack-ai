import type { Severity } from '../../types';

/** Severity is always rendered as visible text, never color alone. */
export default function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={`badge sev-${severity}`}>{severity}</span>;
}
