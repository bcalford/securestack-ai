import type { ReactNode } from 'react';

export default function ErrorState({ children }: { children: ReactNode }) {
  return (
    <p className="error" role="alert">
      {children}
    </p>
  );
}
