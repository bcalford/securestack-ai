import { Link } from 'react-router-dom';
export default function NavBar() { return <nav className="container nav"><b>SecureStack AI</b><span><Link to="/">Home</Link> · <Link to="/scans/new">New Scan</Link> · <Link to="/scans">Scans</Link> · <Link to="/about">About</Link></span></nav>; }
