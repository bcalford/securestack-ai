import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listScans } from '../api/client';
import type { ScanListItem } from '../types';
export default function ScanHistoryPage() { const {data=[],error,isLoading}=useQuery<ScanListItem[]>({queryKey:['scans'],queryFn:listScans}); return <main className="container"><h1>Previous scans</h1>{isLoading&&<p>Loading scan history…</p>}{error&&<p className="error">Unable to load scan history.</p>}{!isLoading&&!data.length&&<p className="card">No scans yet. Start a new security review to populate history.</p>}{data.map(s=><p className="card" key={s.id}><Link to={`/scans/${s.id}`}>{s.name}</Link> — {s.riskScore}/100 — {s.findingCount} findings</p>)}</main>; }
