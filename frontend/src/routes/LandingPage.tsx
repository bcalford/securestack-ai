import { Link } from 'react-router-dom';

function Card({ title, description }: { title: string; description: string }) {
  return <article className="card"><h3>{title}</h3><p>{description}</p></article>;
}

export default function LandingPage() {
  return <main className="container">
    <section className="hero-panel">
      <div>
        <p className="eyebrow">Local-first defensive review</p>
        <h1>AI-assisted security review for code and cloud config</h1>
        <p className="lede">Upload, paste, or demo project files to find risky patterns, prioritize remediation, generate AI-assisted summaries, and export a security review PDF.</p>
        <p className="actions"><Link className="btn" to="/scans/new">Start a review</Link><Link className="btn secondary" to="/scans/new?sample=full-portfolio-demo">Run sample security review</Link></p>
      </div>
      <aside className="preview" aria-label="Product preview"><h2>What you get</h2><p><b>Risk score</b> with plain-English context.</p><p><b>Fix these first</b> prioritization.</p><p><b>Mock or Bedrock</b> summary badge.</p><p><b>PDF report</b> for portfolio demos.</p></aside>
    </section>
    <section><h2>Features</h2><div className="grid cards">
      <Card title="Static analysis" description="Detects risky code, auth, logging, and input validation patterns." />
      <Card title="Secrets detection" description="Flags hardcoded keys, tokens, passwords, and environment-style secrets." />
      <Card title="Docker and IaC checks" description="Reviews Dockerfiles, Terraform, IAM, S3, and security-group patterns." />
      <Card title="Bedrock summaries" description="Uses mock summaries by default, with optional manually configured Amazon Bedrock summaries." />
      <Card title="PDF export" description="Creates recruiter-friendly security review reports." />
    </div></section>
    <section><h2>How it works</h2><div className="grid cards">
      <Card title="1. Add files" description="Paste, upload, or select safe demo files so you can see exactly what is reviewed." />
      <Card title="2. Run defensive checks" description="Static rules inspect code and configuration without executing uploaded content." />
      <Card title="3. Review prioritized findings" description="The dashboard explains risk score, top fixes, evidence, and recommendations." />
      <Card title="4. Export a report" description="Download a PDF with score, methodology, findings, remediation, and limitations." />
    </div></section>
    <section className="card trust"><h2>Trust and safety</h2><p>SecureStack AI treats uploaded files as untrusted, does not execute code, masks secret-like evidence, and uses mock AI by default.</p><p><Link to="/scans/new">Start review</Link> · <Link to="/scans/new?sample=full-portfolio-demo">Sample review</Link> · <Link to="/scans">Review history</Link> · <Link to="/about">About/architecture</Link></p></section>
  </main>;
}
