import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  headingId?: string;
};

/** A compact heading block for in-page sections (as opposed to PageHeader, which is the top-of-page h1 block). */
export default function SectionHeader({ eyebrow, title, description, headingId }: SectionHeaderProps) {
  return (
    <div className="section-header">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={headingId}>{title}</h2>
      {description && <p className="helper">{description}</p>}
    </div>
  );
}
