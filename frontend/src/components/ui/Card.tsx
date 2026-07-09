import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  subtle?: boolean;
  children: ReactNode;
};

export default function Card({ as: Tag = 'div', subtle = false, className = '', children, ...props }: CardProps) {
  const classes = ['card', subtle ? 'subtle' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
