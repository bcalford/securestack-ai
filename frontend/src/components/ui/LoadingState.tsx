import type { ReactNode } from 'react';

export default function LoadingState({ children }: { children: ReactNode }) {
  return (
    <p className="helper" role="status">
      {children}
    </p>
  );
}
