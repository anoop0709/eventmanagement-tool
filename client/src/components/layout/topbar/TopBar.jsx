import { useAuth } from '@/context/AuthContext';
import './TopBar.css';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title-mobile">Event Tool</div>

      <div className="topbar-search-container">
        <input className="topbar-search" placeholder="Search events / customers…" />
      </div>

      <div className="topbar-actions">
        <span className="topbar-username">Hi, {user?.name || 'Guest'}</span>

        <button onClick={logout} className="topbar-logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
}
