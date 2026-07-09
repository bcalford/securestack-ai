import type { ReactNode } from 'react';

type SectionProps = {
  title?: ReactNode;
  headingId?: string;
  className?: string;
  card?: boolean;
  children: ReactNode;
};

export default function Section({ title, headingId, className = '', card = true, children }: SectionProps) {
  const classes = [card ? 'card' : '', className].filter(Boolean).join(' ');
  return (
    <section className={classes} aria-labelledby={title ? headingId : undefined}>
      {title && <h2 id={headingId}>{title}</h2>}
      {children}
    </section>
  );
}
