import { AppShell } from '@/components/layout/appshell/AppShell';
import { StatCard } from '@/components/dashboard/status-card/StatCard';
import { EventList } from '@/components/dashboard/event-list/EventList';
import { mockEvents } from '@/data/mockEvents';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { Button } from '@/components/ui/button/Button';
import './DashboardPage.css';

export default function DashboardPage() {
  return (
    <AdminRoute>
      <AppShell>
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Overview of events, quotes, and follow-ups.</p>
          </div>
          <Button as="link" href="/newevent" className="dashboard-create-btn">
            + Create Event
          </Button>
        </div>

        <div className="dashboard-stats">
          <StatCard title="Upcoming events (7 days)" value={2} subtitle="Next: Birthday Party" />
          <StatCard title="Pending quotes" value={1} subtitle="Needs customer approval" />
          <StatCard title="Confirmed events" value={1} subtitle="This month" />
          <StatCard title="Payments due" value="₹ 45,000" subtitle="2 milestones pending" />
        </div>

        <div className="dashboard-content">
          <section className="dashboard-events">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Upcoming events</h2>
              <a className="dashboard-view-all" href="/events">
                View all
              </a>
            </div>
            <EventList items={mockEvents} />
          </section>

          <section className="dashboard-quick-create">
            <h2 className="dashboard-section-title">Quick create</h2>
            <p className="dashboard-quick-create-subtitle">
              Create a draft event and continue setup.
            </p>

            <div className="dashboard-quick-create-form">
              <input className="dashboard-input" placeholder="Event name" />
              <div className="dashboard-input-row">
                <input className="dashboard-input" placeholder="Date" />
                <input className="dashboard-input" placeholder="Guest count" />
              </div>
              <button className="dashboard-quick-create-btn">Create Draft</button>
            </div>
          </section>
        </div>
      </AppShell>
    </AdminRoute>
  );
}
