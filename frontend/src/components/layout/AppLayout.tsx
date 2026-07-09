import type { ReactNode } from 'react';
import NavBar from './NavBar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <NavBar />
      <div id="main-content">{children}</div>
    </div>
  );
}

