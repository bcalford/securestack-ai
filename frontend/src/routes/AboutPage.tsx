import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function AboutPage() {
  return (
    <main className="container">
      <PageHeader
        eyebrow="Local-first defensive review"
        title="About SecureStack AI"
        description="A local-first security review tool that scans pasted files, uploads, safe demo samples, or public GitHub repositories for risky patterns, then explains what to fix first."
      />
      <Card>
        <h2>What it does</h2>
        <p>
          SecureStack AI runs deterministic static-analysis rules over code and configuration, scores overall risk,
          groups prioritized findings, and generates a plain-English summary using a mock AI provider by default
          (optionally Amazon Bedrock, if manually configured).
        </p>
      </Card>
      <Card>
        <h2>Local-first security boundary</h2>
        <p>
          Uploaded, pasted, and imported content is always treated as untrusted and is never executed. Reviews run
          locally and unauthenticated, secret-like evidence is masked in findings and reports, and this application
          is intended for local and demo use rather than public or production deployment.
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
