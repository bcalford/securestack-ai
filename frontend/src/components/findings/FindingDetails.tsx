import type { Finding } from '../../types';

type DetailRowProps = {
  label: string;
  value?: string | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  if (!value) return null;

  return (
    <div className="finding-detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function FindingDetails({ finding }: { finding: Finding }) {
  return (
    <details className="finding-details">
      <summary>View finding details</summary>
      <p>{finding.description}</p>
      <dl>
        <DetailRow label="Evidence" value={finding.evidence} />
        <DetailRow label="Recommended fix" value={finding.recommendation} />
        <DetailRow label="Secure example" value={finding.secureExample} />
        <DetailRow label="Reference" value="OWASP secure coding and least privilege guidance." />
      </dl>
    </details>
  );
}
