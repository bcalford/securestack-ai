import { Link } from 'react-router-dom';
import { reportUrl } from '../../api/client';
export default function ReportActions({ scanId }: { scanId: string }) { return <p><a className="btn" href={reportUrl(scanId)}>Export PDF</a> <Link className="btn secondary" to="/scans/new">Re-run scan</Link></p>; }
