import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  tone?: 'elevated' | 'sunken' | 'glow';
  children: ReactNode;
};

/** A layered panel surface for premium hero/preview treatments (distinct from the flatter `.card`). */
export default function Surface({ as: Tag = 'div', tone = 'elevated', className = '', children, ...props }: SurfaceProps) {
  const classes = ['surface', `surface-${tone}`, className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
