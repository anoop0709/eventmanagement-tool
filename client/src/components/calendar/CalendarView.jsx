import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './CalendarView.css';

export function CalendarView({ events }) {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Get first day of month and number of days
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = monthStart.getDay();
  const daysInMonth = monthEnd.getDate();

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    events.forEach((event) => {
      // Get first event from events array
      const firstEvent = event.events?.[0];
      if (firstEvent?.eventDate) {
        const date = new Date(firstEvent.eventDate);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push({
          ...event,
          eventName: firstEvent.eventName,
          eventType: firstEvent.eventType,
          eventDate: firstEvent.eventDate,
        });
      }
    });
    return grouped;
  }, [events]);

  const getEventsForDate = (day) => {
    const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`;
    return eventsByDate[dateKey] || [];
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate.getDate()) : [];

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(day);
    const hasEvents = dayEvents.length > 0;

    calendarDays.push(
      <div
        key={day}
        className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <div className="day-number">{day}</div>
        {hasEvents && (
          <div className="event-indicators">
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div key={idx} className={`event-dot ${event.status}`} title={event.eventName} />
            ))}
            {dayEvents.length > 3 && <span className="more-events">+{dayEvents.length - 3}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="calendar-view-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>
          ‹
        </button>
        <h2 className="calendar-title">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays}
      </div>

      {/* Selected date events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="selected-date-events">
          <h3 className="selected-date-title">
            Events on{' '}
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
          <div className="event-list">
            {selectedDateEvents.map((event, idx) => (
              <div key={idx} className="calendar-event-card">
                <div className="event-card-header">
                  <h4>{event.eventName}</h4>
                  <span className={`event-status-badge ${event.status}`}>{event.status}</span>
                </div>
                <div className="event-card-details">
                  <span className="event-type">
                    {event.eventType} - {event.clientDetails?.clientName}
                  </span>
                  <div className="event-card-actions">
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/events/view/${event._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/events/edit/${event._id}`)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
