import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getChecklist, getFixPlan, getRiskPaths, getScan, getThreatModel, listRules } from '../api/client';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RiskSummaryCards from '../components/dashboard/RiskSummaryCards';
import SeverityChart from '../components/dashboard/SeverityChart';
import FindingFilters, { type Filters } from '../components/findings/FindingFilters';
import FindingsTable from '../components/findings/FindingsTable';
import RemediationStatusSummary from '../components/findings/RemediationStatusSummary';
import ReportActions from '../components/reports/ReportActions';
import AlertState from '../components/ui/ErrorState';
import SeverityBadge from '../components/ui/SeverityBadge';
import StatusBadge from '../components/ui/StatusBadge';
import type { ChecklistItem, ControlMapping, Finding, FixPlanItem, RiskPath, ThreatModel } from '../types';
import { buildRiskExplanation, sortFindingsByPriority, topPriorityFindings } from '../utils/risk';

const markdownElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'];

function MarkdownSummary({ children }: { children: string }) {
  return (
    <div className="markdown-summary">
      <ReactMarkdown allowedElements={markdownElements}>{children}</ReactMarkdown>
    </div>
  );
}

function CompactList({ items }: { items: string[] }) {
  const safeItems = items ?? [];
  return safeItems.length ? (
    <ul>
      {safeItems.map(item => <li key={item}>{item}</li>)}
    </ul>
  ) : <p className="helper">No items generated for this section.</p>;
}

function ThreatModelCard({ threatModel }: { threatModel: ThreatModel }) {
  return (
    <div>
      <p className="helper">Assets, entry points, trust boundaries, and abuse cases inferred from this review's findings.</p>
      <details className="artifact-card" open>
        <summary>Threat model</summary>
        <div className="artifact-grid">
          <div><h4>Assets</h4><CompactList items={threatModel.assets} /></div>
          <div><h4>Entry points</h4><CompactList items={threatModel.entryPoints} /></div>
          <div><h4>Trust boundaries</h4><CompactList items={threatModel.trustBoundaries} /></div>
          <div><h4>Abuse cases</h4><CompactList items={threatModel.abuseCases} /></div>
          <div><h4>Recommended controls</h4><CompactList items={threatModel.recommendedControls} /></div>
        </div>
      </details>
    </div>
  );
}

function RiskPathCard({ riskPaths }: { riskPaths: RiskPath[] }) {
  return (
    <div>
      <p className="helper">Groups of related findings that combine into a larger defensive risk if left unaddressed.</p>
      <details className="artifact-card">
        <summary>Risk paths</summary>
        {(riskPaths ?? []).map(path => (
          <article className="artifact-item" key={path.id}>
            <h4>{path.name}</h4>
            <p>{path.narrative}</p>
            <p><b>Related findings:</b> {path.relatedFindingIds.length ? path.relatedFindingIds.join(', ') : 'None identified'}</p>
            <p><b>Remediation theme:</b> {path.remediationThemes.join('; ')}</p>
          </article>
        ))}
      </details>
    </div>
  );
}

function FixPlanGroup({ title, items }: { title: string; items: FixPlanItem[] }) {
  return (
    <div>
      <h4>{title}</h4>
      {(items ?? []).length ? (items ?? []).map(item => (
        <article className="artifact-item" key={`${item.phase}-${item.title}`}>
          <b>{item.title}</b>
          <p><span className="badge">Effort: {item.estimatedEffort}</span><span className="badge">Risk reduction: {item.expectedRiskReduction}</span></p>
          <p><b>Verification steps:</b></p>
          <CompactList items={item.verificationSteps} />
        </article>
      )) : <p className="helper">No items in this phase.</p>}
    </div>
  );
}

function ChecklistCard({ items }: { items: ChecklistItem[] }) {
  return (
    <div>
      <p className="helper">A verification-driven checklist for confirming remediation before release.</p>
      <details className="artifact-card">
        <summary>Security review checklist</summary>
        <div className="checklist-grid">
          {(items ?? []).map(item => (
            <article className="artifact-item" key={item.id}>
              <b>{item.label}</b>
              <p><StatusBadge label={item.status} /><span className="badge">Category: {item.id}</span></p>
              <p>{item.guidance}</p>
            </article>
          ))}
        </div>
      </details>
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
    <section className="card fix-first" aria-labelledby="fix-first-heading">
      <h2 id="fix-first-heading">Fix these first</h2>
      {top.length ? top.map(finding => (
        <article key={finding.id}>
          <SeverityBadge severity={finding.severity} />
          {' '}<StatusBadge label={finding.status} />
          {' '}<a href={`#finding-${finding.id}`}><b>{finding.title}</b></a>
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
  const reviewArtifacts = useQuery({
    queryKey: ['review-artifacts', id],
    enabled: Boolean(data?.id),
    queryFn: async () => {
      const [threatModel, riskPaths, fixPlan, checklist] = await Promise.all([
        getThreatModel(data!.id),
        getRiskPaths(data!.id),
        getFixPlan(data!.id),
        getChecklist(data!.id),
      ]);
      return { threatModel, riskPaths, fixPlan, checklist };
    },
  });
  const rulesQuery = useQuery({ queryKey: ['rules'], queryFn: listRules });
  const controlMappingsByRuleId = useMemo(() => {
    const map: Record<string, ControlMapping[]> = {};
    if (Array.isArray(rulesQuery.data)) {
      rulesQuery.data.forEach(rule => {
        if (rule.controlMappings?.length) map[rule.id] = rule.controlMappings;
      });
    }
    return map;
  }, [rulesQuery.data]);
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
          {!!data.files?.length && (
            <details className="finding-details">
              <summary>Files in this review ({data.files.length})</summary>
              <ul>
                {data.files.map(file => <li key={file}>{file}</li>)}
              </ul>
            </details>
          )}
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

      <section className="card review-artifacts" aria-labelledby="review-artifacts-heading">
        <p className="eyebrow">Backend-generated review artifacts</p>
        <h2 id="review-artifacts-heading">Security review artifacts</h2>
        <p className="helper">Concise defensive outputs for planning remediation and verification.</p>
        {reviewArtifacts.isError && (
          <AlertState>Unable to load security review artifacts. Please try again.</AlertState>
        )}
        {reviewArtifacts.isLoading && <p className="helper">Loading security review artifacts…</p>}
        {reviewArtifacts.data && (
          <div className="artifact-stack">
            <ThreatModelCard threatModel={reviewArtifacts.data.threatModel} />
            <RiskPathCard riskPaths={reviewArtifacts.data.riskPaths.riskPaths} />
            <div>
              <p className="helper">A phased plan for prioritizing remediation work by effort and expected risk reduction.</p>
              <details className="artifact-card">
                <summary>Fix plan</summary>
                <div className="artifact-grid">
                  <FixPlanGroup title="Fix first" items={reviewArtifacts.data.fixPlan.fixFirst} />
                  <FixPlanGroup title="Fix next" items={reviewArtifacts.data.fixPlan.fixNext} />
                  <FixPlanGroup title="Hardening backlog" items={reviewArtifacts.data.fixPlan.hardeningBacklog} />
                </div>
              </details>
            </div>
            <ChecklistCard items={reviewArtifacts.data.checklist.items} />
          </div>
        )}
      </section>

      <ReportActions scanId={data.id} />

      <section>
        <h2>Findings</h2>
        <FindingFilters filters={filters} setFilters={setFilters} categories={Object.keys(data.categoryCounts)} />
        <p className="helper">Showing {rows.length} of {data.findingCount} finding(s).</p>
        <FindingsTable scanId={data.id} rows={rows} controlMappingsByRuleId={controlMappingsByRuleId} />
      </section>
    </main>
  );
}
