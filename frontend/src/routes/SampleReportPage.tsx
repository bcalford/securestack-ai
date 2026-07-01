import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RiskSummaryCards from '../components/dashboard/RiskSummaryCards';
import SeverityChart from '../components/dashboard/SeverityChart';
import FindingDetails from '../components/findings/FindingDetails';
import { sampleReport } from '../data/sampleReport';
import { topPriorityFindings } from '../utils/risk';

const markdownElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'em', 'ul', 'ol', 'li', 'code', 'pre'];

function MarkdownSummary({ children }: { children: string }) {
  return (
    <div className="markdown-summary">
      <ReactMarkdown allowedElements={markdownElements}>{children}</ReactMarkdown>
    </div>
  );
}

function ReadOnlyFindings() {
  return (
    <section className="finding-list" aria-label="Sample finding details">
      {sampleReport.findings.map(finding => (
        <article className="card finding-card" key={finding.id}>
          <header>
            <span className={`badge sev-${finding.severity}`}>{finding.severity}</span>
            <span className="badge">{finding.category}</span>
            <span className="badge">Status: {finding.status}</span>
            <h3>{finding.title}</h3>
            <p>
              {finding.fileName}{finding.lineNumber ? `:${finding.lineNumber}` : ''}
              {' '}· Confidence: {finding.confidence}
            </p>
          </header>
          <FindingDetails finding={finding} />
          <p className="rule-id">Rule ID: {finding.ruleId}</p>
        </article>
      ))}
    </section>
  );
}

export default function SampleReportPage() {
  const prioritized = topPriorityFindings(sampleReport.findings);

  return (
    <main className="container">
      <section className="results-hero">
        <div>
          <p className="eyebrow">Static sample report</p>
          <h1>{sampleReport.name}</h1>
          <p>
            This report uses static, fake demo-only data rendered entirely in the browser so you can preview
            SecureStack AI results without uploading files or calling the backend.
          </p>
          <p>
            <span className="badge">Risk level: {sampleReport.riskLevel}</span>
            <span className="badge">Files reviewed: {sampleReport.fileCount}</span>
            <span className="badge">Findings: {sampleReport.findingCount}</span>
          </p>
        </div>
        <div className="score-card" aria-label="Sample risk score">
          <span>Risk score</span>
          <strong>{sampleReport.riskScore}</strong>
          <span>{sampleReport.riskLevel}</span>
        </div>
      </section>

      <div className="grid cards" aria-label="Sample severity and category summary">
        <RiskSummaryCards scan={sampleReport} />
        <SeverityChart counts={sampleReport.severityCounts} />
        <CategoryBreakdown counts={sampleReport.categoryCounts} />
      </div>

      <section className="card">
        <h2>Files reviewed</h2>
        <ul>
          {sampleReport.files.map(file => <li key={file}>{file}</li>)}
        </ul>
      </section>

      <section className="card fix-first">
        <h2>Prioritized findings</h2>
        {prioritized.map(finding => (
          <article key={finding.id}>
            <span className={`badge sev-${finding.severity}`}>{finding.severity}</span>
            {' '}<b>{finding.title}</b>
            <p>{finding.recommendation}</p>
          </article>
        ))}
      </section>

      <section className="card summary-card" aria-labelledby="sample-summary-heading">
        <h2 id="sample-summary-heading">AI-style summary</h2>
        <p className="eyebrow">Summary provider: {sampleReport.aiProvider}</p>
        <MarkdownSummary>{sampleReport.executiveSummary}</MarkdownSummary>
        <MarkdownSummary>{sampleReport.remediationSummary}</MarkdownSummary>
      </section>

      <section>
        <h2>Finding details</h2>
        <ReadOnlyFindings />
      </section>

      <section className="card">
        <h2>Methodology</h2>
        <p>
          SecureStack AI validates submitted files, treats all content as untrusted, applies deterministic
          defensive static-analysis rules, scores risk from severity and confidence, and generates a concise
          remediation-oriented summary using the configured AI provider.
        </p>
      </section>

      <section className="card">
        <h2>Limitations</h2>
        <p>
          This static report is illustrative only. It does not represent a live scan, execute code, prove exploitability,
          replace manual review, or guarantee that every vulnerability in a real project would be found.
        </p>
      </section>

      <section className="card">
        <h2>Run the guided sample review</h2>
        <p>Use the guided sample to create a fresh local review with the normal scan workflow.</p>
        <Link className="btn" to="/scans/new?sample=full-portfolio-demo">Run sample security review</Link>
      </section>
    </main>
  );
}
