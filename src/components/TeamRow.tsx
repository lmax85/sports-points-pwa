import { useState, useRef, useEffect } from 'react';
import type { Team, ScoreEntry } from '../types';
import { PointButton } from './PointButton';
import { colorToEmoji, EMOJI_COLORS } from '../colorEmoji';

interface TeamRowProps {
  team: Team;
  entries: ScoreEntry[];
  pointValues: number[];
  onAddPoints: (teamId: string, points: number) => void;
  onRename: (teamId: string, name: string) => void;
  onRemove: (teamId: string) => void;
  onColorChange: (teamId: string, color: string) => void;
}

export function TeamRow({ team, entries, pointValues, onAddPoints, onRename, onRemove, onColorChange }: TeamRowProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [colorOpen, setColorOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const colorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLButtonElement>(null);

  function openColorPicker() {
    if (dotRef.current) {
      const rect = dotRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    }
    setColorOpen((prev) => !prev);
  }

  useEffect(() => {
    if (!colorOpen) return;
    function handleClick(e: MouseEvent) {
      if (colorRef.current && !colorRef.current.contains(e.target as Node) &&
          dotRef.current && !dotRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
    }
    document.addEventListener('pointerdown', handleClick);
    return () => document.removeEventListener('pointerdown', handleClick);
  }, [colorOpen]);
  const total = entries.reduce((sum, e) => sum + e.points, 0);

  function handleSave() {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== team.name) {
      onRename(team.id, trimmed);
    }
    setEditing(false);
  }

  return (
    <tr>
      <td className="team-name">
        {editing ? (
          <div className="team-edit-inline">
            <input
              className="team-edit-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') { setEditName(team.name); setEditing(false); }
              }}
              autoFocus
            />
          </div>
        ) : (
          <div className="team-name-row">
            <div className="color-picker-wrapper">
              <button
                ref={dotRef}
                className="color-picker-dot color-picker-emoji"
                onClick={openColorPicker}
                title="Pick team color"
              >
                {colorToEmoji(team.color || '#1a73e8')}
              </button>
              {colorOpen && (
                <div
                  ref={colorRef}
                  className="color-picker-dropdown"
                  style={{ top: dropdownPos.top, left: dropdownPos.left }}
                >
                  {EMOJI_COLORS.map(({ emoji, hex }) => (
                    <button
                      key={hex}
                      className={`color-emoji-btn ${(team.color || '#1a73e8') === hex ? 'color-emoji-btn--active' : ''}`}
                      onClick={() => { onColorChange(team.id, hex); setColorOpen(false); }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span
              className="team-name-text"
              onClick={() => { setEditName(team.name); setEditing(true); }}
              title="Tap to rename"
            >
              {team.name}
            </span>
            <button
              className="btn-icon-sm btn-danger-sm"
              onClick={() => onRemove(team.id)}
              title="Remove from event"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
      </td>
      {pointValues.map((pv) => (
        <td key={pv} className="point-cell">
          <PointButton value={pv} onClick={() => onAddPoints(team.id, pv)} />
        </td>
      ))}
      <td className="total-cell">{total}</td>
    </tr>
  );
}
