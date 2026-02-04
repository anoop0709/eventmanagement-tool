import { Link } from 'react-router-dom';
import './SidebarNav.css';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/newevent', label: 'Create Event' },
  { href: '/events', label: 'Events' },
  { href: '/catalog/decorations', label: 'Catalogs' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/settings', label: 'Settings' },
];

export function SidebarNav() {
  return (
    <aside className="sidebar-nav">
      <div className="sidebar-header">
        <div className="sidebar-title">Event Tool</div>
        <div className="sidebar-subtitle">Operations Dashboard</div>
      </div>

      <nav className="sidebar-menu">
        {nav.map((item) => (
          <Link key={item.href} to={item.href} className="sidebar-link">
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
