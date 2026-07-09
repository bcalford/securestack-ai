import { useEffect, useState } from 'react';
import { updateFindingStatus } from '../../api/client';
import type { Finding } from '../../types';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import SeverityBadge from '../ui/SeverityBadge';
import FindingDetails from './FindingDetails';

type FindingsTableProps = {
  scanId: string;
  rows: Finding[];
};

export default function FindingsTable({ scanId, rows }: FindingsTableProps) {
  const [local, setLocal] = useState<Finding[]>(rows);
  const [error, setError] = useState('');

  useEffect(() => {
    setLocal(rows);
  }, [rows]);

  async function changeStatus(finding: Finding, status: string) {
    setError('');

    try {
      await updateFindingStatus(scanId, finding.id, status);
      setLocal(current => current.map(item => (
        item.id === finding.id ? { ...item, status } : item
      )));
    } catch {
      setError('Status update failed. Please retry after confirming the backend is available.');
    }
  }

  if (!local.length) {
    return (
      <EmptyState>
        No findings match the current filters. Clear filters or review the summary if this was a clean scan.
      </EmptyState>
    );
  }

  return (
    <section className="finding-list" aria-label="Finding details">
      {error && <ErrorState>{error}</ErrorState>}

      {local.map(finding => (
        <article className="card finding-card" key={finding.id}>
          <header>
            <SeverityBadge severity={finding.severity} />
            <span className="badge">{finding.category}</span>
            <h3>{finding.title}</h3>
            <p>
              {finding.fileName}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
              {' '}· Confidence: {finding.confidence}
            </p>
          </header>

          <FindingDetails finding={finding} />

          <label>
            Status
            <select
              aria-label={`Update status for ${finding.title}`}
              value={finding.status}
              onChange={event => changeStatus(finding, event.target.value)}
            >
              <option>OPEN</option>
              <option>REVIEWED</option>
              <option>FALSE_POSITIVE</option>
              <option>FIXED</option>
            </select>
          </label>

          <p className="rule-id">Rule ID: {finding.ruleId}</p>
        </article>
      ))}
    </section>
  );
}
