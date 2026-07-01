import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { getScan } from '../api/client';
import type { ComparedFinding } from '../utils/scanComparison';
import { compareScans } from '../utils/scanComparison';

function Delta({ value, suffix = '' }: { value: number; suffix?: string }) {
  const label = value > 0 ? `+${value}` : String(value);
  return <strong className={value > 0 ? 'delta-up' : value < 0 ? 'delta-down' : ''}>{label}{suffix}</strong>;
}

function findingTitle(item: ComparedFinding) {
  const finding = item.right ?? item.left;
  return finding ? `${finding.title} — ${finding.fileName}${finding.lineNumber ? `:${finding.lineNumber}` : ''}` : item.key;
}

function FindingComparisonList({ title, items, empty }: { title: string; items: ComparedFinding[]; empty: string }) {
  return (
    <section className="card comparison-list">
      <h2>{title}</h2>
      {!items.length ? <p>{empty}</p> : items.map(item => {
        const left = item.left;
        const right = item.right;
        return (
          <article key={item.key}>
            <h3>{findingTitle(item)}</h3>
            <p>
              {left && <span className={`badge sev-${left.severity}`}>Left: {left.severity}</span>}
              {right && <span className={`badge sev-${right.severity}`}>Right: {right.severity}</span>}
              {left && right && left.category !== right.category && <span className="badge">Category: {left.category} → {right.category}</span>}
              {left && right && left.severity !== right.severity && <span className="badge">Severity changed</span>}
            </p>
          </article>
        );
      })}
    </section>
  );
}

export default function ScanComparePage() {
  const [params] = useSearchParams();
  const leftId = params.get('left') ?? '';
  const rightId = params.get('right') ?? '';
  const [leftQuery, rightQuery] = useQueries({
    queries: [leftId, rightId].map(id => ({
      queryKey: ['scan', id],
      queryFn: () => getScan(id),
      enabled: Boolean(id),
      retry: false,
    })),
  });

  const comparison = useMemo(() => (
    leftQuery.data && rightQuery.data ? compareScans(leftQuery.data, rightQuery.data) : undefined
  ), [leftQuery.data, rightQuery.data]);

  if (!leftId || !rightId) {
    return <main className="container"><h1>Compare scans</h1><p className="error">Select two completed scans from history to compare.</p><Link className="btn" to="/scans">Back to scan history</Link></main>;
  }

  if (leftQuery.isLoading || rightQuery.isLoading) return <main className="container"><h1>Compare scans</h1><p>Loading scan comparison…</p></main>;
  if (leftQuery.error || rightQuery.error || !leftQuery.data || !rightQuery.data || !comparison) {
    return <main className="container"><h1>Compare scans</h1><p className="error">Unable to load both completed scans for comparison.</p><Link className="btn" to="/scans">Back to scan history</Link></main>;
  }

  return (
    <main className="container">
      <p className="eyebrow">Local deterministic comparison</p>
      <h1>Compare scans</h1>
      <section className="comparison-hero">
        <article className="card"><h2>Left baseline</h2><Link to={`/scans/${leftQuery.data.id}`}>{leftQuery.data.name}</Link><p>{leftQuery.data.riskScore}/100 · {leftQuery.data.findingCount} findings</p></article>
        <article className="card"><h2>Right comparison</h2><Link to={`/scans/${rightQuery.data.id}`}>{rightQuery.data.name}</Link><p>{rightQuery.data.riskScore}/100 · {rightQuery.data.findingCount} findings</p></article>
      </section>
      <section className="grid cards" aria-label="Comparison deltas">
        <article className="card"><span>Risk score delta</span><Delta value={comparison.riskScoreDelta} /></article>
        <article className="card"><span>Finding count delta</span><Delta value={comparison.findingCountDelta} /></article>
        <article className="card"><span>Severity/category differences</span><strong>{comparison.changedFindings.length}</strong></article>
      </section>
      <FindingComparisonList title="New findings" items={comparison.newFindings} empty="No new findings in the right scan." />
      <FindingComparisonList title="Resolved findings" items={comparison.resolvedFindings} empty="No findings were resolved." />
      <FindingComparisonList title="Unchanged findings" items={comparison.unchangedFindings} empty="No unchanged findings." />
      <FindingComparisonList title="Severity/category differences" items={comparison.changedFindings} empty="No severity or category changes." />
    </main>
  );
}
