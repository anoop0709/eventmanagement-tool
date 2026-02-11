import { useAuth } from '@/context/AuthContext';
import './TopBar.css';

export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-title-mobile">
        <svg
          className="topbar-logo-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="#d60909"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#d60909"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#d60909"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#d60909"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="topbar-actions">
        <span className="topbar-username topbar-mobile-hide">Hi, {user?.name || 'Guest'}</span>

        <button onClick={logout} className="topbar-logout-btn topbar-mobile-hide">
          Logout
        </button>
      </div>
    </header>
  );
}
