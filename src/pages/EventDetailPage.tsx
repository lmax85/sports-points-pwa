import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { TeamRow } from '../components/TeamRow';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();

  const [addQuery, setAddQuery] = useState('');
  const [pendingTeamName, setPendingTeamName] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editLabel, setEditLabel] = useState('');
  const [editDate, setEditDate] = useState('');
  const [copied, setCopied] = useState(false);

  const event = state.events.find((e) => e.id === id);

  // Auto-add newly created team to event
  useEffect(() => {
    if (pendingTeamName && event) {
      const newTeam = state.teams.find(
        (t) => t.name.toLowerCase() === pendingTeamName && !event.teamIds.includes(t.id)
      );
      if (newTeam) {
        dispatch({ type: 'ADD_TEAM_TO_EVENT', eventId: event.id, teamId: newTeam.id });
        setPendingTeamName(null);
        setAddQuery('');
      }
    }
  }, [state.teams, pendingTeamName, event, dispatch]);

  if (!event) {
    return (
      <div className="page">
        <p>Event not found.</p>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    );
  }

  function handleSaveLabel() {
    dispatch({ type: 'EDIT_EVENT', eventId: event!.id, label: editLabel, date: event!.date });
    setEditingLabel(false);
  }

  function handleSaveDate() {
    if (editDate) {
      dispatch({ type: 'EDIT_EVENT', eventId: event!.id, label: event!.label, date: editDate });
    }
    setEditingDate(false);
  }

  function handleAddPoints(teamId: string, points: number) {
    dispatch({ type: 'ADD_SCORE', eventId: event!.id, teamId, points });
  }

  function handleUndo() {
    dispatch({ type: 'UNDO_SCORE', eventId: event!.id });
  }

  function handleDelete() {
    if (confirm('Delete this event?')) {
      dispatch({ type: 'DELETE_EVENT', eventId: event!.id });
      navigate('/');
    }
  }

  async function handleShare() {
    const teamTotals = teams
      .map((team) => ({
        name: team.name,
        total: event!.entries
          .filter((e) => e.teamId === team.id)
          .reduce((sum, e) => sum + e.points, 0),
      }))
      .sort((a, b) => b.total - a.total);

    const lines = [
      `${event!.label || 'Untitled'}`,
      event!.date,
      '',
      ...teamTotals.map((t) => `${t.name} — ${t.total} pts`),
    ];
    const text = lines.join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // user cancelled share sheet
      }
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRename(teamId: string, name: string) {
    dispatch({ type: 'RENAME_TEAM', teamId, name });
  }

  function handleColorChange(teamId: string, color: string) {
    dispatch({ type: 'SET_TEAM_COLOR', teamId, color });
  }

  function handleRemoveTeam(teamId: string) {
    const teamEntries = event!.entries.filter((e) => e.teamId === teamId);
    if (teamEntries.length > 0 && !confirm('This team has points recorded. Remove anyway?')) {
      return;
    }
    dispatch({ type: 'REMOVE_TEAM_FROM_EVENT', eventId: event!.id, teamId });
  }

  // Available teams not already in this event, filtered by search
  const availableTeams = addQuery.trim()
    ? state.teams
        .filter((t) => !event.teamIds.includes(t.id))
        .filter((t) => t.name.toLowerCase().includes(addQuery.toLowerCase()))
    : state.teams.filter((t) => !event.teamIds.includes(t.id));

  const exactMatch = state.teams.some(
    (t) => t.name.toLowerCase() === addQuery.trim().toLowerCase()
  );

  function handleSelectTeam(teamId: string) {
    dispatch({ type: 'ADD_TEAM_TO_EVENT', eventId: event!.id, teamId });
    setAddQuery('');
  }

  function handleAddNewTeam() {
    const name = addQuery.trim();
    if (!name) return;
    dispatch({ type: 'ADD_TEAM', name });
    setPendingTeamName(name.toLowerCase());
  }

  const teamsInOrder = event.teamIds
    .map((tid) => state.teams.find((t) => t.id === tid))
    .filter(Boolean) as typeof state.teams;

  const teams = state.autoSort
    ? [...teamsInOrder].sort((a, b) => {
        const totalA = event.entries.filter((e) => e.teamId === a.id).reduce((s, e) => s + e.points, 0);
        const totalB = event.entries.filter((e) => e.teamId === b.id).reduce((s, e) => s + e.points, 0);
        return totalB - totalA;
      })
    : teamsInOrder;

  return (
    <div className="page">
      <div className="event-header">
        <div className="event-header-info">
          {editingLabel ? (
            <input
              className="event-edit-input event-edit-label"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleSaveLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveLabel();
                if (e.key === 'Escape') setEditingLabel(false);
              }}
              autoFocus
            />
          ) : (
            <h2
              className="event-label-editable"
              onClick={() => { setEditLabel(event.label); setEditingLabel(true); }}
              title="Tap to edit"
            >
              {event.label || 'Untitled'}
            </h2>
          )}
          {editingDate ? (
            <input
              type="date"
              className="event-edit-input event-edit-date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              onBlur={handleSaveDate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveDate();
                if (e.key === 'Escape') setEditingDate(false);
              }}
              autoFocus
            />
          ) : (
            <span
              className="event-date-detail event-date-editable"
              onClick={() => { setEditDate(event.date); setEditingDate(true); }}
              title="Tap to edit"
            >
              {event.date}
            </span>
          )}
        </div>
        <div className="event-actions">
          <button
            className="btn-icon"
            onClick={handleShare}
            title="Share results"
          >
            {copied ? '✓' : '↗'}
          </button>
          <button
            className="btn-icon"
            onClick={handleUndo}
            disabled={event.entries.length === 0}
            title="Undo last"
          >
            ↩
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={handleDelete}
            title="Delete event"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="auto-sort-row">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={state.autoSort}
            onChange={() => dispatch({ type: 'TOGGLE_AUTO_SORT' })}
          />
          <span className="toggle-slider" />
        </label>
        <span className="auto-sort-label">Auto sort</span>
      </div>

      <div className="table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th>Team</th>
              {state.pointValues.map((pv) => (
                <th key={pv}>+{pv}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <TeamRow
                key={team.id}
                team={team}
                entries={event.entries.filter((e) => e.teamId === team.id)}
                pointValues={state.pointValues}
                onAddPoints={handleAddPoints}
                onRename={handleRename}
                onRemove={handleRemoveTeam}
                onColorChange={handleColorChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-team-section">
        {availableTeams.length > 0 && (
          <div className="team-quick-list">
            {availableTeams.map((t) => (
              <button
                key={t.id}
                className="team-quick-btn"
                onClick={() => handleSelectTeam(t.id)}
              >
                <span className="team-dot" style={{ background: t.color || '#1a73e8' }} />
                {t.name}
              </button>
            ))}
          </div>
        )}
        <div className="team-add-row">
          <input
            type="text"
            className="form-input"
            value={addQuery}
            onChange={(e) => setAddQuery(e.target.value)}
            placeholder="Search or add new team..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && addQuery.trim() && !exactMatch) handleAddNewTeam();
            }}
          />
          {addQuery.trim() && !exactMatch && (
            <button className="btn-primary btn-add-team" onClick={handleAddNewTeam}>
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
