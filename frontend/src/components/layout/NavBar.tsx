import { Link, NavLink } from 'react-router-dom';
import ProductLogo from '../ui/ProductLogo';
import ThemeToggle from '../ui/ThemeToggle';

const links = [
  { to: '/scans', label: 'History' },
  { to: '/rules', label: 'Rules' },
  { to: '/sample-report', label: 'Sample Report' },
  { to: '/about', label: 'About' },
];

function navLinkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? 'app-nav-link active' : 'app-nav-link';
}

export default function NavBar() {
  return (
    <nav className="app-nav" aria-label="Primary">
      <div className="app-nav-inner">
        <NavLink to="/" className="app-brand" end>
          <ProductLogo />
          SecureStack AI
        </NavLink>
        <ul className="app-nav-links">
          {links.map(link => (
            <li key={link.to}>
              <NavLink to={link.to} className={navLinkClassName}>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="app-nav-actions">
          <ThemeToggle />
          <Link className="btn" to="/scans/new">New review</Link>
        </div>
      </div>
    </nav>
  );
}
