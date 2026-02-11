import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './SidebarNav.css';

const nav = [
  { href: '/', label: 'Dashboard' },
  { href: '/newevent', label: 'Create Event' },
  { href: '/events', label: 'Events' },
  { href: '/catalog', label: 'Catalogs' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/quotes', label: 'Quotes' },
  { href: '/settings', label: 'Settings' },
];

export function SidebarNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      {!isOpen && (
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle menu">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Overlay - Mobile Only */}
      {isOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}

      {/* Sidebar */}
      <aside className={`sidebar-nav ${isOpen ? 'open' : ''}`}>
        {/* Close Button - Mobile Only */}
        <button className="close-btn" onClick={closeMenu} aria-label="Close menu">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="sidebar-header">
          <div className="sidebar-title">Event Tool</div>
          <div className="sidebar-subtitle">Operations Dashboard</div>
        </div>

        {/* User Info - Mobile Only */}
        {user && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-details">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
          </div>
        )}

        <nav className="sidebar-menu">
          {nav
            .filter((item) => {
              // Hide Dashboard link for non-admin users
              if (item.href === '/' && !user?.isAdmin) {
                return false;
              }
              return true;
            })
            .map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={closeMenu}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* Logout Button - Mobile Only */}
        <button
          className="sidebar-logout-btn"
          onClick={() => {
            logout();
            closeMenu();
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </aside>
    </>
  );
}
