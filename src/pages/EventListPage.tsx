import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { EventCard } from '../components/EventCard';

export function EventListPage() {
  const { state } = useAppState();

  const sortedEvents = [...state.events].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return (
    <div className="page">
      {sortedEvents.length === 0 ? (
        <div className="empty-state">
          <p>No events yet.</p>
          <p>Create your first event to start tracking points!</p>
        </div>
      ) : (
        <div className="event-list">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} teams={state.teams} />
          ))}
        </div>
      )}

      <Link to="/new-event" className="fab">
        + New Event
      </Link>
    </div>
  );
}
