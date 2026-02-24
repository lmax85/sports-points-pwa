import { Link } from 'react-router-dom';
import type { SportEvent, Team } from '../types';

interface EventCardProps {
  event: SportEvent;
  teams: Team[];
}

export function EventCard({ event, teams }: EventCardProps) {
  const eventTeams = event.teamIds
    .map((id) => teams.find((t) => t.id === id))
    .filter(Boolean) as Team[];

  const totalPoints = event.entries.reduce((sum, e) => sum + e.points, 0);

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-header">
        <span className="event-label">{event.label || 'Untitled'}</span>
        <span className="event-date">{event.date}</span>
      </div>
      <div className="event-card-body">
        <span className="event-teams">
          {eventTeams.map((t) => (
            <span key={t.id} className="team-dot-label">
              <span
                className="team-dot"
                style={{ background: t.color || '#1a73e8' }}
              />
              {t.name}
            </span>
          ))}
        </span>
        <span className="event-points">{totalPoints} pts</span>
      </div>
    </Link>
  );
}
