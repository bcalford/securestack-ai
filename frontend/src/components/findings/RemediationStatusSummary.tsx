import type { Finding } from '../../types';

const statuses = [
  ['OPEN', 'Open findings'],
  ['REVIEWED', 'Reviewed findings'],
  ['FALSE_POSITIVE', 'False positives'],
  ['FIXED', 'Fixed findings'],
] as const;

export default function RemediationStatusSummary({ findings }: { findings: Finding[] }) {
  const counts = findings.reduce<Record<string, number>>((acc, finding) => {
    acc[finding.status] = (acc[finding.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <section className="card remediation-status" aria-label="Remediation workflow status summary">
      <h2>Remediation workflow</h2>
      <div className="grid cards">
        {statuses.map(([status, label]) => (
          <article key={status}>
            <span>{label}</span>
            <strong>{counts[status] ?? 0}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
