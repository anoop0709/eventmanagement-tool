import { Badge } from '@/components/ui/badge/Badge';
import './EventRow.css';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function EventRow({ item }) {
  return (
    <div className="event-row">
      <div className="event-row-content">
        <div className="event-row-header">
          <div className="event-row-name">{item.name}</div>
          <Badge status={item.status} />
        </div>
        <div className="event-row-details">
          {formatDate(item.dateISO)} • {item.type} • {item.guestCount} guests
        </div>
        <div className="event-row-venue">{item.venue}</div>
      </div>

      <a href={`/events/${item.id}`} className="event-row-link">
        Open
      </a>
    </div>
  );
}
