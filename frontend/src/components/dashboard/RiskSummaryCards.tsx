import MetricCard from '../ui/MetricCard';
import type { Scan } from '../../types';

export default function RiskSummaryCards({ scan }: { scan: Scan }) {
  return (
    <>
      <MetricCard label="Risk score" value={`${scan.riskScore}/100 (${scan.riskLevel})`} />
      <MetricCard label="Files scanned" value={scan.fileCount} />
      <MetricCard label="Findings" value={scan.findingCount} />
    </>
  );
}
