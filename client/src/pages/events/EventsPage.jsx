import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/appshell/AppShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { eventAPI } from '@/services/api';
import { CalendarView } from '@/components/calendar/CalendarView';
import { useAuth } from '@/context/AuthContext';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog/ConfirmationDialog';
import './EventsPage.css';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, draft, pending, confirmed, completed, cancelled
  const [viewMode, setViewMode] = useState('list'); // list or calendar
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, eventId: null, eventName: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAllEvents();
      // Backend returns events array directly, not wrapped in {events: [...]}
      const eventsArray = Array.isArray(response) ? response : response.events || [];

      setEvents(eventsArray);
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (eventId) => {
    // Navigate to create event page with edit mode
    navigate(`/newevent?edit=${eventId}`);
  };

  const handleDeleteClick = (eventId, eventName) => {
    setDeleteDialog({ isOpen: true, eventId, eventName });
  };

  const handleDeleteConfirm = async () => {
    try {
      await eventAPI.deleteEvent(deleteDialog.eventId);
      setDeleteDialog({ isOpen: false, eventId: null, eventName: '' });
      // Refresh the events list
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event. Please try again.');
      setDeleteDialog({ isOpen: false, eventId: null, eventName: '' });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, eventId: null, eventName: '' });
  };

  const canDeleteEvent = (event) => {
    // Draft or pending: any user can delete
    if (event.status === 'draft' || event.status === 'pending') {
      return true;
    }
    // Confirmed: only admins can delete
    if (event.status === 'confirmed' && user?.role === 'admin') {
      return true;
    }
    return false;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'badge-draft',
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return statusColors[status] || 'badge-draft';
  };

  const filteredEvents = events.filter((event) => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="events-page">
          <div className="events-header">
            <h1>All Events</h1>
            <div className="header-actions">
              <button
                className="view-toggle-btn"
                onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              >
                <span className="toggle-icon">{viewMode === 'list' ? '📅' : '📋'}</span>
                <span className="toggle-text">
                  {viewMode === 'list' ? 'Calendar View' : 'List View'}
                </span>
              </button>
              <button className="btn-primary" onClick={() => navigate('/newevent')}>
                Create New Event
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="events-filters">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({events.length})
            </button>
            <button
              className={`filter-tab ${filter === 'draft' ? 'active' : ''}`}
              onClick={() => setFilter('draft')}
            >
              Draft ({events.filter((e) => e.status === 'draft').length})
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({events.filter((e) => e.status === 'pending').length})
            </button>
            <button
              className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
              onClick={() => setFilter('confirmed')}
            >
              Confirmed ({events.filter((e) => e.status === 'confirmed').length})
            </button>
            <button
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({events.filter((e) => e.status === 'completed').length})
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="events-error">
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {/* Events List or Calendar */}
          {loading ? (
            <div className="events-loading">Loading events...</div>
          ) : filteredEvents.length === 0 ? (
            <div className="events-empty">
              <p>No events found.</p>
              <button className="btn-primary" onClick={() => navigate('/newevent')}>
                Create Your First Event
              </button>
            </div>
          ) : viewMode === 'calendar' ? (
            <CalendarView events={filteredEvents} />
          ) : (
            <div className="events-grid">
              {filteredEvents.map((event) => {
                // Get first event from events array if it exists
                const firstEvent = event.events?.[0] || {};
                const clientDetails = event.clientDetails || {};

                return (
                  <div key={event._id} className="event-card">
                    <div className="event-card-header">
                      <h3>{firstEvent.eventName || 'Untitled Event'}</h3>
                      <span className={`event-badge ${getStatusBadge(event.status)}`}>
                        {event.status}
                      </span>
                    </div>

                    <div className="event-card-body">
                      <div className="event-info">
                        <span className="info-label">Client:</span>
                        <span className="info-value">{clientDetails.clientName || 'N/A'}</span>
                      </div>

                      <div className="event-info">
                        <span className="info-label">Event Type:</span>
                        <span className="info-value">{firstEvent.eventType || 'N/A'}</span>
                      </div>

                      <div className="event-info">
                        <span className="info-label">Date:</span>
                        <span className="info-value">
                          {firstEvent.eventDate
                            ? new Date(firstEvent.eventDate).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>

                      <div className="event-info">
                        <span className="info-label">Venue:</span>
                        <span className="info-value">{firstEvent.venue || 'N/A'}</span>
                      </div>

                      <div className="event-info">
                        <span className="info-label">Guests:</span>
                        <span className="info-value">{firstEvent.guestCount || 'N/A'}</span>
                      </div>

                      {event.totalBudget && (
                        <div className="event-info">
                          <span className="info-label">Budget:</span>
                          <span className="info-value">£{event.totalBudget}</span>
                        </div>
                      )}
                    </div>

                    <div className="event-card-footer">
                      <button className="btn-edit" onClick={() => handleEditEvent(event._id)}>
                        Edit Event
                      </button>
                      <button
                        className="btn-view"
                        onClick={() => navigate(`/events/view/${event._id}`)}
                      >
                        View Details
                      </button>
                      {canDeleteEvent(event) && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClick(event._id, firstEvent.eventName || 'Untitled Event')}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Delete Event"
          message={`Are you sure you want to delete "${deleteDialog.eventName}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
        />
      </AppShell>
    </ProtectedRoute>
  );
}
