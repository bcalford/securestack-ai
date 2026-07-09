import type { ControlMapping, Finding } from '../../types';

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

function formatControlMappings(controlMappings: ControlMapping[]) {
  return controlMappings.map(mapping => `${mapping.framework}: ${mapping.value}`).join(' | ');
}

type FindingDetailsProps = {
  finding: Finding;
  controlMappings?: ControlMapping[];
};

export default function FindingDetails({ finding, controlMappings }: FindingDetailsProps) {
  return (
    <details className="finding-details">
      <summary>View finding details</summary>
      <p>{finding.description}</p>
      <dl>
        <DetailRow label="Evidence" value={finding.evidence} />
        <DetailRow label="Recommended fix" value={finding.recommendation} />
        <DetailRow label="Secure example" value={finding.secureExample} />
        {!!controlMappings?.length && (
          <DetailRow label="Control mappings" value={formatControlMappings(controlMappings)} />
        )}
        <DetailRow label="Reference" value="OWASP secure coding and least privilege guidance." />
      </dl>
    </details>
  );
}
