import type { ReactNode } from 'react';
import NavBar from './NavBar';
export default function AppLayout({ children }: { children: ReactNode }) { return <><NavBar />{children}</>; }
