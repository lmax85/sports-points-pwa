import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Team, ScoreEntry } from '../types';
import { PointButton } from './PointButton';
import { colorToEmoji, EMOJI_COLORS } from '../colorEmoji';

const HOLD_DURATION = 500;

interface TeamRowProps {
  team: Team;
  entries: ScoreEntry[];
  pointValues: number[];
  onAddPoints: (teamId: string, points: number) => void;
  onRename: (teamId: string, name: string) => void;
  onRemove: (teamId: string) => void;
  onColorChange: (teamId: string, color: string) => void;
  onEditTotal: (teamId: string, total: number) => void;
}

export function TeamRow({ team, entries, pointValues, onAddPoints, onRename, onRemove, onColorChange, onEditTotal }: TeamRowProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [colorOpen, setColorOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const colorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLButtonElement>(null);

  // Long-press to edit total
  const [editingTotal, setEditingTotal] = useState(false);
  const [editTotalValue, setEditTotalValue] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdingTotal, setHoldingTotal] = useState(false);
  const holdStartRef = useRef(0);
  const holdRafRef = useRef(0);
  const holdFiredRef = useRef(false);

  const stopHold = useCallback(() => {
    setHoldingTotal(false);
    setHoldProgress(0);
    cancelAnimationFrame(holdRafRef.current);
  }, []);

  const total = entries.reduce((sum, e) => sum + e.points, 0);

  const tickHold = useCallback(() => {
    const elapsed = Date.now() - holdStartRef.current;
    const pct = Math.min(elapsed / HOLD_DURATION, 1);
    setHoldProgress(pct);
    if (pct >= 1) {
      if (!holdFiredRef.current) {
        holdFiredRef.current = true;
        setEditTotalValue(String(total));
        setEditingTotal(true);
      }
      stopHold();
      return;
    }
    holdRafRef.current = requestAnimationFrame(tickHold);
  }, [stopHold, total]);

  function startHold() {
    holdFiredRef.current = false;
    holdStartRef.current = Date.now();
    setHoldingTotal(true);
    setHoldProgress(0);
    holdRafRef.current = requestAnimationFrame(tickHold);
  }

  useEffect(() => () => cancelAnimationFrame(holdRafRef.current), []);

  function handleSaveTotal() {
    const num = parseInt(editTotalValue, 10);
    if (!isNaN(num) && num !== total) {
      onEditTotal(team.id, num);
    }
    setEditingTotal(false);
  }

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
      <td className="total-cell">
        {editingTotal ? (
          <input
            className="total-edit-input"
            type="number"
            value={editTotalValue}
            onChange={(e) => setEditTotalValue(e.target.value)}
            onBlur={handleSaveTotal}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTotal();
              if (e.key === 'Escape') setEditingTotal(false);
            }}
            autoFocus
          />
        ) : (
          <span
            className={`total-value ${holdingTotal ? 'total-value--holding' : ''}`}
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onPointerCancel={stopHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            {total}
          </span>
        )}
        {holdingTotal && createPortal(
          <div className="hold-progress-bar">
            <div
              className="hold-progress-fill"
              style={{ transform: `scaleX(${holdProgress})` }}
            />
          </div>,
          document.body
        )}
      </td>
    </tr>
  );
}
