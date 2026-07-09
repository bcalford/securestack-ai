import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'default' | 'neutral';
  children: ReactNode;
};

export default function Badge({ tone = 'default', children }: BadgeProps) {
  const className = tone === 'neutral' ? 'badge badge-neutral' : 'badge';
  return <span className={className}>{children}</span>;
}
