import type { ReactNode } from 'react';

type FindingCardProps = {
  badges: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  id?: string;
  children: ReactNode;
};

/** Shared visual shell for a finding: badge row, title, file/line meta, then detail content. */
export default function FindingCard({ badges, title, meta, id, children }: FindingCardProps) {
  return (
    <article className="card finding-card" id={id}>
      <header className="finding-card-header">
        <div className="finding-card-badges">{badges}</div>
        <h3>{title}</h3>
        {meta && <p className="finding-card-meta">{meta}</p>}
      </header>
      {children}
    </article>
  );
}
