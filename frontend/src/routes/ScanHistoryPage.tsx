import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listScans } from '../api/client';
import type { ScanListItem } from '../types';

export default function ScanHistoryPage() {
  const { data = [], error, isLoading } = useQuery<ScanListItem[]>({ queryKey: ['scans'], queryFn: listScans });
  const [selected, setSelected] = useState<string[]>([]);
  const compareHref = useMemo(() => (
    selected.length === 2 ? `/scans/compare?left=${selected[0]}&right=${selected[1]}` : '/scans'
  ), [selected]);

  function toggleScan(scanId: string) {
    setSelected(current => (
      current.includes(scanId)
        ? current.filter(id => id !== scanId)
        : [...current.slice(-1), scanId]
    ));
  }

  return (
    <main className="container">
      <h1>Previous scans</h1>
      {isLoading && <p>Loading scan history…</p>}
      {error && <p className="error">Unable to load scan history.</p>}
      {!isLoading && !data.length && <p className="card">No scans yet. Start a new security review to populate history.</p>}
      {!!data.length && (
        <section className="card comparison-picker" aria-label="Scan comparison picker">
          <h2>Compare completed scans</h2>
          <p>Select two scans to compare risk, finding counts, new findings, resolved findings, and severity/category differences.</p>
          <Link className={`btn ${selected.length === 2 ? '' : 'disabled'}`} aria-disabled={selected.length !== 2} to={compareHref}>Compare selected scans</Link>
        </section>
      )}
      {data.map(scan => (
        <article className="card history-row" key={scan.id}>
          <label>
            <input type="checkbox" checked={selected.includes(scan.id)} onChange={() => toggleScan(scan.id)} />
            Select for comparison
          </label>
          <p><Link to={`/scans/${scan.id}`}>{scan.name}</Link> — {scan.riskScore}/100 — {scan.findingCount} findings</p>
        </article>
      ))}
    </main>
  );
}
