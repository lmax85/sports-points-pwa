import { useState, useMemo } from 'react';
import type { Team, Id } from '../types';

interface TeamPickerProps {
  teams: Team[];
  selectedTeamIds: Id[];
  onChange: (teamIds: Id[]) => void;
  onAddTeam: (name: string) => void;
}

export function TeamPicker({ teams, selectedTeamIds, onChange, onAddTeam }: TeamPickerProps) {
  const [query, setQuery] = useState('');

  const selectedTeams = teams.filter((t) => selectedTeamIds.includes(t.id));

  const availableTeams = useMemo(() => {
    const unselected = teams.filter((t) => !selectedTeamIds.includes(t.id));
    if (!query.trim()) return unselected;
    const lower = query.toLowerCase();
    return unselected.filter((t) => t.name.toLowerCase().includes(lower));
  }, [query, teams, selectedTeamIds]);

  const exactMatch = teams.some(
    (t) => t.name.toLowerCase() === query.trim().toLowerCase()
  );

  function selectTeam(teamId: Id) {
    onChange([...selectedTeamIds, teamId]);
    setQuery('');
  }

  function removeTeam(teamId: Id) {
    onChange(selectedTeamIds.filter((id) => id !== teamId));
  }

  function handleAddNew() {
    const name = query.trim();
    if (!name) return;
    onAddTeam(name);
    setQuery('');
  }

  return (
    <div className="team-picker">
      <div className="selected-teams">
        {selectedTeams.map((t) => (
          <span key={t.id} className="team-chip" style={{ borderLeft: `3px solid ${t.color || '#1a73e8'}` }}>
            {t.name}
            <button onClick={() => removeTeam(t.id)} className="chip-remove">&times;</button>
          </span>
        ))}
      </div>

      {availableTeams.length > 0 && (
        <div className="team-quick-list">
          {availableTeams.map((t) => (
            <button
              key={t.id}
              className="team-quick-btn"
              onClick={() => selectTeam(t.id)}
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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search or add new team..."
          className="team-input"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim() && !exactMatch) handleAddNew();
          }}
        />
        {query.trim() && !exactMatch && (
          <button className="btn-primary btn-add-team" onClick={handleAddNew}>
            + Add
          </button>
        )}
      </div>
    </div>
  );
}
