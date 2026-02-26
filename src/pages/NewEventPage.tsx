import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { TeamPicker } from '../components/TeamPicker';
import type { Id } from '../types';

export function NewEventPage() {
  const { state, dispatch } = useAppState();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  function defaultLabel(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const day = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
    return day;
  }

  const [label, setLabel] = useState(() => defaultLabel(today));
  const [date, setDate] = useState(today);
  const [selectedTeamIds, setSelectedTeamIds] = useState<Id[]>([]);
  const [pendingTeamName, setPendingTeamName] = useState<string | null>(null);

  function handleAddTeam(name: string) {
    dispatch({ type: 'ADD_TEAM', name });
    setPendingTeamName(name.toLowerCase());
  }

  // After ADD_TEAM dispatch, the team appears in state.teams on re-render.
  // Auto-select it.
  useEffect(() => {
    if (pendingTeamName) {
      const newTeam = state.teams.find(
        (t) => t.name.toLowerCase() === pendingTeamName && !selectedTeamIds.includes(t.id)
      );
      if (newTeam) {
        setSelectedTeamIds((prev) => [...prev, newTeam.id]);
        setPendingTeamName(null);
      }
    }
  }, [state.teams, pendingTeamName, selectedTeamIds]);

  function handleCreate() {
    const id = crypto.randomUUID();
    dispatch({ type: 'CREATE_EVENT', id, label, date, teamIds: selectedTeamIds });
    navigate(`/event/${id}`);
  }

  return (
    <div className="page">
      <h2>New Event</h2>

      <div className="form-group">
        <label htmlFor="event-label">Label</label>
        <input
          id="event-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Monday Training"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="event-date">Date</label>
        <input
          id="event-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Teams</label>
        <TeamPicker
          teams={state.teams}
          selectedTeamIds={selectedTeamIds}
          onChange={setSelectedTeamIds}
          onAddTeam={handleAddTeam}
        />
      </div>

      <button
        className="btn-primary"
        onClick={handleCreate}
        disabled={!date}
      >
        Create Event
      </button>
    </div>
  );
}
