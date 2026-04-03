import { Link } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { EventCard } from '../components/EventCard';

export function EventListPage() {
  const { state } = useAppState();
  const { canInstall, isInstalled, promptInstall, showIOSGuide } = useInstallPrompt();

  const sortedEvents = [...state.events].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return (
    <div className="page">
      {canInstall && (
        <button className="btn-install" onClick={promptInstall}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Add to Home Screen
        </button>
      )}
      {showIOSGuide && (
        <div className="ios-install-guide">
          <p className="ios-install-title">Install this app on your iPhone</p>
          <ol className="ios-install-steps">
            <li>Tap the <strong>three dots</strong> <span className="ios-icon">···</span> at the bottom right corner</li>
            <li>Tap the <strong>Share</strong> button <svg className="ios-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></li>
            <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
            <li>Tap <strong>"Add"</strong> to confirm</li>
          </ol>
        </div>
      )}
      {isInstalled && (
        <p className="install-note">App is installed on your device.</p>
      )}

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

      <Link to="/new-event" className="fab fab-fixed">
        + New Event
      </Link>
    </div>
  );
}
