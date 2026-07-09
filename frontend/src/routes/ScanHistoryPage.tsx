import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listScans } from '../api/client';
import type { ScanListItem } from '../types';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import LoadingState from '../components/ui/LoadingState';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';

function formatScanDate(value: string) {
  return new Date(value).toLocaleString();
}

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

  const compareReady = selected.length === 2;

  function handleCompareClick(event: React.MouseEvent) {
    if (!compareReady) event.preventDefault();
  }

  return (
    <main className="container">
      <PageHeader
        eyebrow="Regression review"
        title="Previous scans"
        description="Browse completed local reviews, open a full report, or select two scans below to compare risk trend over time."
      />
      {isLoading && <LoadingState>Loading scan history…</LoadingState>}
      {error && <ErrorState>Unable to load scan history.</ErrorState>}
      {!isLoading && !error && !data.length && <EmptyState>No scans yet. Start a new security review to populate history.</EmptyState>}
      {!!data.length && (
        <section className="card comparison-picker" aria-label="Regression review picker">
          <h2>Regression review</h2>
          <p>Select two completed scans to review risk trend, new findings, resolved findings, unchanged findings, and severity/category movement.</p>
          <Link
            className={`btn ${compareReady ? '' : 'disabled'}`}
            aria-disabled={!compareReady}
            tabIndex={compareReady ? undefined : -1}
            onClick={handleCompareClick}
            to={compareHref}
          >
            Compare selected scans
          </Link>
          <p className="helper">{selected.length}/2 scans selected. Comparison stays local and uses stored scan results.</p>
        </section>
      )}
      {!!data.length && <p className="helper">{data.length} scan(s) in history.</p>}
      {data.map(scan => (
        <article className="card history-row" key={scan.id}>
          <div className="history-row-head">
            <div>
              <h3><Link to={`/scans/${scan.id}`}>{scan.name}</Link></h3>
              <p className="helper"><time dateTime={scan.createdAt}>{formatScanDate(scan.createdAt)}</time></p>
            </div>
            <StatusBadge label={`Risk level: ${scan.riskLevel}`} />
          </div>
          <p>
            <span className="badge badge-neutral">Risk score: {scan.riskScore}/100</span>
            <span className="badge badge-neutral">Findings: {scan.findingCount}</span>
          </p>
          <label>
            <input type="checkbox" checked={selected.includes(scan.id)} onChange={() => toggleScan(scan.id)} />
            Select for regression review
          </label>
        </article>
      ))}
    </main>
  );
}
