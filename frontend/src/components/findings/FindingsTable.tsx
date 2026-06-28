import { useEffect, useState } from 'react';
import { updateFindingStatus } from '../../api/client';
import type { Finding } from '../../types';
import { sortFindingsByPriority } from '../../utils/risk';
import FindingDetails from './FindingDetails';

export default function FindingsTable({ scanId, rows }: { scanId: string; rows: Finding[] }) {
  const [local, setLocal] = useState(rows); const [error, setError] = useState('');
  useEffect(() => setLocal(sortFindingsByPriority(rows)), [rows]);
  async function change(f: Finding, status: string) { setError(''); try { await updateFindingStatus(scanId, f.id, status); setLocal(local.map(x => x.id === f.id ? { ...x, status } : x)); } catch { setError('Status update failed. Please retry after confirming the backend is available.'); } }
  if (!local.length) return <p className="card empty-state">No findings match the current filters. Clear filters or review the summary if this was a clean scan.</p>;
  return <section className="finding-list" aria-label="Finding details">{error&&<p role="alert" className="error">{error}</p>}{local.map(f=><article className="card finding-card" key={f.id}><header><span className={`badge sev-${f.severity}`}>{f.severity}</span><span className="badge">{f.category}</span><h3>{f.title}</h3><p>{f.fileName}{f.lineNumber ? `:${f.lineNumber}` : ''} · Confidence: {f.confidence}</p></header><FindingDetails finding={f}/><label>Status<select aria-label={`Update status for ${f.title}`} value={f.status} onChange={e=>change(f,e.target.value)}><option>OPEN</option><option>REVIEWED</option><option>FALSE_POSITIVE</option><option>FIXED</option></select></label><p className="rule-id">Rule ID: {f.ruleId}</p></article>)}</section>;
}
