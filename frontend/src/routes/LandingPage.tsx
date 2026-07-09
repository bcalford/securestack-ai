import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';

const workflow = [
  { title: 'Add files', description: 'Paste source, upload files/ZIP, pick a safe demo sample, or import a public GitHub repository URL.' },
  { title: 'Analyze locally', description: 'Deterministic static rules inspect code and configuration without executing anything.' },
  { title: 'Review risk', description: 'A risk score, severity/category breakdown, and "fix these first" prioritization explain what matters.' },
  { title: 'Generate report/artifacts', description: 'Get a threat model, risk paths, fix plan, checklist, and PDF/SARIF/JSON/bundle exports.' },
];

const capabilities = [
  { title: 'Static analysis rules', description: 'Deterministic checks for secrets, auth, API security, IaC, Docker, and input validation.' },
  { title: 'Public GitHub URL import', description: 'Import a public repository for local-only analysis. No token, no OAuth, no execution.' },
  { title: 'Threat model', description: 'Assets, entry points, trust boundaries, and abuse cases derived from findings.' },
  { title: 'Risk paths', description: 'Related findings grouped into a larger defensive risk narrative.' },
  { title: 'Fix plan', description: 'Phased remediation by effort and expected risk reduction, with verification steps.' },
  { title: 'Security checklist', description: 'A verification-driven checklist for confirming remediation before release.' },
  { title: 'PDF / SARIF / JSON / bundle exports', description: 'Hand off a completed review in the format your workflow needs.' },
  { title: 'Scan comparison', description: 'Compare two completed scans for risk trend, new, resolved, and unchanged findings.' },
];

function CapabilityGrid() {
  return (
    <section aria-labelledby="capabilities-heading">
      <SectionHeader
        headingId="capabilities-heading"
        eyebrow="What it can do"
        title="A complete local-first review workflow"
        description="From static analysis to export, every step runs against your files without a hosted backend."
      />
      <div className="capability-grid">
        {capabilities.map(item => (
          <article className="capability-card" key={item.title}>
            <h3>{item.title}</h3>
            <p className="helper">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section aria-labelledby="workflow-heading">
      <SectionHeader headingId="workflow-heading" eyebrow="How it works" title="Four steps, entirely local" />
      <div className="workflow-steps">
        {workflow.map((step, index) => (
          <article className="card workflow-step" key={step.title}>
            <span className="workflow-step-index" aria-hidden="true">{index + 1}</span>
            <h3>{step.title}</h3>
            <p className="helper">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="container">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Local-first defensive review</p>
          <h1>AI-assisted security review for code and cloud config</h1>
          <p className="lede">
            Upload, paste, or demo project files to find risky patterns, prioritize remediation,
            generate AI-assisted summaries, and export a security review PDF.
          </p>
          <p className="actions">
            <Link className="btn" to="/scans/new">
              Start a review
            </Link>
            <Link className="btn secondary" to="/scans/new?sample=full-portfolio-demo">
              Run sample security review
            </Link>
          </p>
          <p className="helper">
            <Link to="/sample-report">View sample report</Link> to see example output before running your own review.
          </p>
        </div>

        <aside className="preview" aria-label="Product preview">
          <h2 className="visually-hidden">Product preview</h2>
          <div className="preview-score">
            <span>Risk score</span>
            <strong>78</strong>
            <span className="badge badge-neutral">HIGH</span>
          </div>
          <div className="preview-chips" aria-label="Example findings">
            <span className="badge sev-CRITICAL">CRITICAL · Hardcoded credential</span>
            <span className="badge sev-HIGH">HIGH · Missing authorization</span>
            <span className="badge sev-MEDIUM">MEDIUM · Public storage bucket</span>
          </div>
          <div className="preview-chips" aria-label="Export formats">
            <span className="preview-chip">PDF</span>
            <span className="preview-chip">SARIF</span>
            <span className="preview-chip">JSON</span>
            <span className="preview-chip">Bundle</span>
          </div>
          <ul className="preview-list">
            <li>Uploaded code is never executed</li>
            <li>Mock AI summaries by default</li>
            <li>Raw file storage disabled by default</li>
          </ul>
        </aside>
      </section>

      <WorkflowSection />
      <CapabilityGrid />

      <Card as="section" className="trust">
        <h2>Trust and safety</h2>
        <p>
          SecureStack AI treats uploaded files as untrusted, does not execute code,
          masks secret-like evidence, and uses mock AI by default.
        </p>
        <div className="trust-strip">
          <p className="trust-strip-item"><span className="trust-strip-icon" aria-hidden="true">✓</span><span><strong>Code is not executed.</strong> Static analysis only, on pasted, uploaded, or imported files.</span></p>
          <p className="trust-strip-item"><span className="trust-strip-icon" aria-hidden="true">✓</span><span><strong>Mock AI by default.</strong> Amazon Bedrock is optional and manually configured.</span></p>
          <p className="trust-strip-item"><span className="trust-strip-icon" aria-hidden="true">✓</span><span><strong>Raw file storage disabled by default.</strong> Findings mask secret-like evidence.</span></p>
          <p className="trust-strip-item"><span className="trust-strip-icon" aria-hidden="true">✓</span><span><strong>Public GitHub import is public-only.</strong> No token, OAuth, or private repository access.</span></p>
        </div>
        <p>
          <Link to="/scans/new">Start review</Link>
          {' · '}
          <Link to="/scans/new?sample=full-portfolio-demo">Sample review</Link>
          {' · '}
          <Link to="/sample-report">Sample report</Link>
          {' · '}
          <Link to="/scans">Review history</Link>
          {' · '}
          <Link to="/about">About/architecture</Link>
        </p>
      </Card>
    </main>
  );
}
