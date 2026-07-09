import { NavLink } from 'react-router-dom';

const links = [
  { to: '/scans/new', label: 'Review' },
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
          <span className="app-brand-mark" aria-hidden="true">SS</span>
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
      </div>
    </nav>
  );
}
