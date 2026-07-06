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

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function findingTitle(item: ComparedFinding) {
  const finding = item.right ?? item.left;
  return finding ? `${finding.title} — ${finding.fileName}${finding.lineNumber ? `:${finding.lineNumber}` : ''}` : item.key;
}

function DeltaList({ title, deltas, empty }: { title: string; deltas: Record<string, number>; empty: string }) {
  const entries = Object.entries(deltas).filter(([, value]) => value !== 0);
  return (
    <article className="card">
      <h2>{title}</h2>
      {!entries.length ? <p>{empty}</p> : (
        <ul className="delta-list">
          {entries.map(([name, value]) => <li key={name}><span>{name}</span><Delta value={value} /></li>)}
        </ul>
      )}
    </article>
  );
}

function FindingComparisonList({ title, items, empty }: { title: string; items: ComparedFinding[]; empty: string }) {
  return (
    <section className="card comparison-list">
      <h2>{title}</h2>
      {!items.length ? <p className="empty-state">{empty}</p> : items.map(item => {
        const left = item.left;
        const right = item.right;
        return (
          <article key={item.key} className="comparison-finding">
            <h3>{findingTitle(item)}</h3>
            <p>
              {left && <span className={`badge sev-${left.severity}`}>Baseline: {left.severity}</span>}
              {right && <span className={`badge sev-${right.severity}`}>Follow-up: {right.severity}</span>}
              {left && right && item.statusChanged && <span className="badge">Status: {left.status} → {right.status}</span>}
              {left && right && item.fileChanged && <span className="badge">File: {left.fileName} → {right.fileName}</span>}
              {left && right && item.categoryChanged && <span className="badge">Category: {left.category} → {right.category}</span>}
              {left && right && item.severityChanged && <span className="badge">Severity changed</span>}
            </p>
            {right?.evidence && <p className="helper">Evidence: {right.evidence}</p>}
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
    return <main className="container"><p className="eyebrow">Regression review</p><h1>Regression review</h1><p className="error">Select two completed scans from history to compare.</p><Link className="btn" to="/scans">Back to scan history</Link></main>;
  }

  if (leftQuery.isLoading || rightQuery.isLoading) return <main className="container"><p className="eyebrow">Regression review</p><h1>Regression review</h1><p>Loading scan comparison…</p></main>;
  if (leftQuery.error || rightQuery.error || !leftQuery.data || !rightQuery.data || !comparison) {
    return <main className="container"><p className="eyebrow">Regression review</p><h1>Regression review</h1><p className="error">Unable to load both completed scans for comparison.</p><Link className="btn" to="/scans">Back to scan history</Link></main>;
  }

  return (
    <main className="container">
      <p className="eyebrow">Regression review</p>
      <h1>Risk trend</h1>
      <section className="comparison-hero">
        <article className="card"><h2>Baseline scan</h2><Link to={`/scans/${leftQuery.data.id}`}>{leftQuery.data.name}</Link><p>{formatDate(leftQuery.data.createdAt)}</p><p>{leftQuery.data.riskScore}/100 · {leftQuery.data.findingCount} findings</p></article>
        <article className="card"><h2>Follow-up scan</h2><Link to={`/scans/${rightQuery.data.id}`}>{rightQuery.data.name}</Link><p>{formatDate(rightQuery.data.createdAt)}</p><p>{rightQuery.data.riskScore}/100 · {rightQuery.data.findingCount} findings</p></article>
      </section>
      <section className="grid cards" aria-label="Regression review deltas">
        <article className="card"><span>Risk score delta</span><Delta value={comparison.riskScoreDelta} /></article>
        <article className="card"><span>Finding count delta</span><Delta value={comparison.findingCountDelta} /></article>
        <article className="card"><span>New findings</span><strong>{comparison.newFindings.length}</strong></article>
        <article className="card"><span>Resolved findings</span><strong>{comparison.resolvedFindings.length}</strong></article>
        <article className="card"><span>Unchanged findings</span><strong>{comparison.unchangedFindings.length}</strong></article>
      </section>
      <section className="grid cards" aria-label="Severity and category deltas">
        <DeltaList title="Severity delta" deltas={comparison.severityDelta} empty="No severity count changes." />
        <DeltaList title="Category delta" deltas={comparison.categoryDelta} empty="No category count changes." />
      </section>
      <FindingComparisonList title="New findings" items={comparison.newFindings} empty="No new findings in the follow-up scan." />
      <FindingComparisonList title="Resolved findings" items={comparison.resolvedFindings} empty="No findings were resolved in the follow-up scan." />
      <FindingComparisonList title="Unchanged findings" items={comparison.unchangedFindings} empty="No unchanged findings between these scans." />
      <FindingComparisonList title="Changed findings" items={comparison.changedFindings} empty="No severity, status, file, or category changes." />
    </main>
  );
}
