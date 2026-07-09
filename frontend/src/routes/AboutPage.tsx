import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function AboutPage() {
  return (
    <main className="container">
      <PageHeader
        eyebrow="Local-first defensive review"
        title="About SecureStack AI"
        description="A local-first defensive security review application that helps reviewers analyze code and cloud configuration, prioritize remediation, and export review artifacts for a demo or local assessment."
      />
      <Card>
        <h2>What it does</h2>
        <p>
          SecureStack AI scans pasted files, uploads, safe demo samples, or public GitHub repositories for defensive
          security review signals. It runs deterministic static-analysis rules, scores overall risk, prioritizes
          findings, and produces plain-English review output using a mock AI provider by default.
        </p>
      </Card>
      <Card>
        <h2>Local-first security boundary</h2>
        <p>
          Uploaded, pasted, and imported content is treated as untrusted and is never executed. Reviews run locally
          in the demo app, secret-like evidence is masked in findings and reports, raw file storage is disabled by
          default, and optional Amazon Bedrock summaries must be manually configured.
        </p>
      </Card>
      <Card>
        <h2>Demo data and limitations</h2>
        <p>
          Built-in samples and the static sample report use fake demo-only data. Findings are heuristic triage signals
          for defensive review; they do not prove exploitability, replace manual validation, or guarantee complete
          vulnerability coverage. The app is local/demo-oriented and is not a public hosted scanner or production
          multi-user platform.
        </p>
      </Card>
      <Card>
        <h2>Why the outputs matter</h2>
        <p>
          Risk scoring, fix-first findings, threat models, risk paths, fix plans, checklists, and exports help turn
          raw scan results into a remediation discussion that reviewers can validate, prioritize, and share.
        </p>
      </Card>
      <Card>
        <h2>Explore more</h2>
        <p className="actions">
          <Link className="btn secondary" to="/sample-report">View the static sample report</Link>
          <Link className="btn secondary" to="/rules">Browse the rule catalog</Link>
        </p>
      </Card>
    </main>
  );
}
