import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScan } from '../api/client';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RiskSummaryCards from '../components/dashboard/RiskSummaryCards';
import SeverityChart from '../components/dashboard/SeverityChart';
import FindingFilters, { type Filters } from '../components/findings/FindingFilters';
import FindingsTable from '../components/findings/FindingsTable';
import RemediationStatusSummary from '../components/findings/RemediationStatusSummary';
import ReportActions from '../components/reports/ReportActions';
import type { Finding } from '../types';
import { buildRiskExplanation, sortFindingsByPriority, topPriorityFindings } from '../utils/risk';

const markdownElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'];

function MarkdownSummary({ children }: { children: string }) {
  return (
    <div className="markdown-summary">
      <ReactMarkdown allowedElements={markdownElements}>{children}</ReactMarkdown>
    </div>
  );
}

function LoadingState() {
  return (
    <main className="container">
      <h1>Review progress</h1>
      <ol>
        <li>Files received</li>
        <li>Static checks running</li>
        <li>AI summary generation</li>
        <li>Report generation</li>
      </ol>
    </main>
  );
}

function ErrorState() {
  return (
    <main className="container">
      <h1>Unable to load review results</h1>
      <p className="error">Unable to load this review. Confirm the backend is running and try again.</p>
      <Link className="btn" to="/scans">Back to review history</Link>
    </main>
  );
}

function FixFirstPanel({ findings }: { findings: Finding[] }) {
  const top = topPriorityFindings(findings);

  return (
    <section className="card fix-first">
      <h2>Fix these first</h2>
      {top.length ? top.map(finding => (
        <article key={finding.id}>
          <span className={`badge sev-${finding.severity}`}>{finding.severity}</span>
          {' '}<b>{finding.title}</b>
          <p>
            {finding.fileName}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
            {' '}— {finding.recommendation}
          </p>
        </article>
      )) : (
        <p>No prioritized findings. Review the summary and export the report if needed.</p>
      )}
    </section>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => getScan(id!),
  });
  const [filters, setFilters] = useState<Filters>({ search: '', severity: '', category: '', status: '', confidence: '', sortBy: 'priority' });

  if (isLoading) return <LoadingState />;
  if (error || !data) return <ErrorState />;

  const severityRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
  const rows = data.findings
    .filter(finding => (
      finding.title + finding.fileName + finding.category + finding.description
    ).toLowerCase().includes(filters.search.toLowerCase()))
    .filter(finding => !filters.severity || finding.severity === filters.severity)
    .filter(finding => !filters.category || finding.category === filters.category)
    .filter(finding => !filters.status || finding.status === filters.status)
    .filter(finding => !filters.confidence || finding.confidence === filters.confidence)
    .sort((a, b) => {
      if (filters.sortBy === 'priority') return sortFindingsByPriority([a, b])[0] === a ? -1 : 1;
      if (filters.sortBy === 'severity') return severityRank[a.severity] - severityRank[b.severity];
      if (filters.sortBy === 'file') return `${a.fileName}:${a.lineNumber ?? 0}`.localeCompare(`${b.fileName}:${b.lineNumber ?? 0}`);
      if (filters.sortBy === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  return (
    <main className="container">
      <section className="results-hero">
        <div>
          <p className="eyebrow">Review results</p>
          <h1>{data.name}</h1>
          <p className="risk-explanation">{buildRiskExplanation(data)}</p>
          <p>
            <span className="badge">Summary provider: {data.aiProvider ?? 'mock'}</span>
            <span className="badge">Files reviewed: {data.fileCount}</span>
            <span className="badge">Findings: {data.findingCount}</span>
          </p>
        </div>
        <div className="score-card">
          <span>Risk score</span>
          <strong>{data.riskScore}</strong>
          <span>{data.riskLevel}</span>
        </div>
      </section>

      <div className="grid cards">
        <RiskSummaryCards scan={data} />
        <SeverityChart counts={data.severityCounts} />
        <CategoryBreakdown counts={data.categoryCounts} />
      </div>

      <FixFirstPanel findings={data.findings} />
      <RemediationStatusSummary findings={data.findings} />

      <section className="card summary-card" aria-labelledby="summary-heading">
        <h2 id="summary-heading">AI summary</h2>
        <p className="eyebrow">Summary provider: {data.aiProvider ?? 'mock'}</p>
        <h3>Executive summary</h3>
        <MarkdownSummary>{data.executiveSummary}</MarkdownSummary>
        <h3>Remediation summary</h3>
        <MarkdownSummary>{data.remediationSummary}</MarkdownSummary>
      </section>

      <ReportActions scanId={data.id} />

      <section>
        <h2>Findings</h2>
        <FindingFilters filters={filters} setFilters={setFilters} categories={Object.keys(data.categoryCounts)} />
        <FindingsTable scanId={data.id} rows={rows} />
      </section>
    </main>
  );
}
