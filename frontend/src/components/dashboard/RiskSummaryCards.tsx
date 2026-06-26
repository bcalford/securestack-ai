import type { Scan } from '../../types';
export default function RiskSummaryCards({ scan }: { scan: Scan }) { return <><div className="card"><h3>Risk score</h3><p>{scan.riskScore}/100 ({scan.riskLevel})</p></div><div className="card"><h3>Files scanned</h3><p>{scan.fileCount}</p></div><div className="card"><h3>Findings</h3><p>{scan.findingCount}</p></div></>; }
