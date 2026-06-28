import { Link } from 'react-router-dom';
import { reportUrl } from '../../api/client';
export default function ReportActions({ scanId }: { scanId: string }) { return <section className="card report-actions"><h2>Export report</h2><p>Includes score, findings, remediation checklist, methodology, and limitations.</p><a className="btn" href={reportUrl(scanId)}>Export PDF report</a> <Link className="btn secondary" to="/scans/new">Start another review</Link></section>; }
