import { SidebarNav } from '../sidebar/SidebarNav';
import { TopBar } from '../topbar/TopBar';
import './AppShell.css';

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <div className="app-shell-container">
        <SidebarNav />
        <div className="app-shell-content">
          <TopBar />
          <main className="app-shell-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
