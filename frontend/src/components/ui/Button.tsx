import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  const variantClass = variant === 'secondary' ? 'btn secondary' : 'btn';
  return <button type={type} className={[variantClass, className].filter(Boolean).join(' ')} {...props} />;
}
