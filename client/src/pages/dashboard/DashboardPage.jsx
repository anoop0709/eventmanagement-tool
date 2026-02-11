import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { StatCard } from '@/components/dashboard/status-card/StatCard';
import { EventList } from '@/components/dashboard/event-list/EventList';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { Button } from '@/components/ui/button/Button';
import { eventAPI } from '@/services/api';
import './DashboardPage.css';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          eventAPI.getDashboardStats(),
          eventAPI.getUpcomingEvents(),
        ]);
        setStats(statsData);
        setUpcomingEvents(eventsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminRoute>
        <AppShell>
          <div className="dashboard-header">
            <h1 className="dashboard-title">Loading...</h1>
          </div>
        </AppShell>
      </AdminRoute>
    );
  }
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
          <StatCard title="Total Events" value={stats?.totalEvents || 0} subtitle="All time" />
          <StatCard
            title="Upcoming Events"
            value={stats?.upcomingEvents || 0}
            subtitle="Not cancelled"
          />
          <StatCard
            title="Pending"
            value={stats?.pendingEvents || 0}
            subtitle="Awaiting approval"
          />
          <StatCard title="Confirmed" value={stats?.confirmedEvents || 0} subtitle="Ready to go" />
        </div>

        <div className="dashboard-content">
          <section className="dashboard-events">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Upcoming events</h2>
              <Link className="dashboard-view-all" to="/events">
                View all
              </Link>
            </div>
            <EventList items={upcomingEvents} />
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
