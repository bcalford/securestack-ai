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
import ReportActions from '../components/reports/ReportActions';

function MarkdownSummary({ children }: { children: string }) {
  return (
    <div className="markdown-summary">
      <ReactMarkdown allowedElements={['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre']}>{children}</ReactMarkdown>
    </div>
  );
}

export default function ResultsPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ['scan', id], queryFn: () => getScan(id!) });
  const [filters, setFilters] = useState<Filters>({ search: '', severity: '', category: '', status: '' });

  if (isLoading) {
    return <main className="container"><h1>Scan progress</h1><ol><li>Files received</li><li>Static checks running</li><li>AI summary generation</li><li>Report generation</li></ol></main>;
  }

  if (error || !data) {
    const message = error instanceof Error ? error.message : 'Unable to load scan results.';
    return <main className="container"><h1>Unable to load scan results</h1><p className="error">{message}</p><Link className="btn" to="/scans">Back to scan history</Link></main>;
  }

  const rows = data.findings
    .filter(f => (f.title + f.fileName + f.category + f.description).toLowerCase().includes(filters.search.toLowerCase()))
    .filter(f => !filters.severity || f.severity === filters.severity)
    .filter(f => !filters.category || f.category === filters.category)
    .filter(f => !filters.status || f.status === filters.status);

  return (
    <main className="container">
      <h1>{data.name}</h1>
      <div className="grid cards"><RiskSummaryCards scan={data} /><SeverityChart counts={data.severityCounts} /><CategoryBreakdown counts={data.categoryCounts} /></div>
      <section className="card summary-card" aria-labelledby="summary-heading">
        <h2 id="summary-heading">AI summary</h2>
        <p className="eyebrow">Summary provider: {data.aiProvider ?? 'mock'}</p>
        <h3>Executive summary</h3>
        <MarkdownSummary>{data.executiveSummary}</MarkdownSummary>
        <h3>Remediation summary</h3>
        <MarkdownSummary>{data.remediationSummary}</MarkdownSummary>
      </section>
      <ReportActions scanId={data.id} />
      <h2>Findings</h2>
      <FindingFilters filters={filters} setFilters={setFilters} categories={Object.keys(data.categoryCounts)} />
      <FindingsTable scanId={data.id} rows={rows} />
    </main>
  );
}
