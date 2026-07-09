import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listScans } from '../api/client';
import type { ScanListItem } from '../types';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';

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
      <p className="eyebrow">Regression review</p>
      <h1>Previous scans</h1>
      {isLoading && <LoadingState>Loading scan history…</LoadingState>}
      {error && <ErrorState>Unable to load scan history.</ErrorState>}
      {!isLoading && !data.length && <EmptyState>No scans yet. Start a new security review to populate history.</EmptyState>}
      {!!data.length && (
        <section className="card comparison-picker" aria-label="Regression review picker">
          <h2>Regression review</h2>
          <p>Select two completed scans to review risk trend, new findings, resolved findings, unchanged findings, and severity/category movement.</p>
          <Link className={`btn ${selected.length === 2 ? '' : 'disabled'}`} aria-disabled={selected.length !== 2} to={compareHref}>Compare selected scans</Link>
          <p className="helper">{selected.length}/2 scans selected. Comparison stays local and uses stored scan results.</p>
        </section>
      )}
      {data.map(scan => (
        <article className="card history-row" key={scan.id}>
          <label>
            <input type="checkbox" checked={selected.includes(scan.id)} onChange={() => toggleScan(scan.id)} />
            Select for regression review
          </label>
          <p><Link to={`/scans/${scan.id}`}>{scan.name}</Link> — {new Date(scan.createdAt).toLocaleString()} — {scan.riskScore}/100 — {scan.findingCount} findings</p>
        </article>
      ))}
    </main>
  );
}
