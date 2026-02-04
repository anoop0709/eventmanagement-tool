import { EventRow } from '../event-row/EventRow';
import './EventList.css';

export function EventList({ items }) {
  return (
    <div className="event-list">
      {items.map((e) => (
        <EventRow key={e.id} item={e} />
      ))}
    </div>
  );
}
