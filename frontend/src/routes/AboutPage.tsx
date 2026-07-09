import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

export default function AboutPage() {
  return (
    <main className="container">
      <PageHeader title="About SecureStack AI" />
      <Card>
        <p>
          SecureStack AI is a local-first security review application built with React, TypeScript, Java 21, Spring Boot,
          defensive static analysis, Docker, and provider-abstracted AI summaries.
        </p>
        <p>
          The methodology combines safe file validation, static heuristics, deterministic risk scoring, mock AI summaries,
          and report generation. It does not execute uploaded code and is not a replacement for a professional audit.
        </p>
        <Link to="/sample-report">View the static sample report</Link>
      </Card>
    </main>
  );
}
