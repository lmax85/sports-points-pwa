import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';

export function SettingsPage() {
  const { state, dispatch } = useAppState();
  const [newValue, setNewValue] = useState('');

  function handleAdd() {
    const num = parseInt(newValue, 10);
    if (isNaN(num) || num <= 0) return;
    dispatch({ type: 'ADD_POINT_VALUE', value: num });
    setNewValue('');
  }

  function handleRemove(value: number) {
    dispatch({ type: 'REMOVE_POINT_VALUE', value });
  }

  return (
    <div className="page">
      <h2>Settings</h2>

      <h3>Point Values</h3>
      <p className="hint">These buttons appear on the score table.</p>

      <div className="point-values-list">
        {state.pointValues.map((pv) => (
          <div key={pv} className="point-value-row">
            <span>+{pv}</span>
            <button
              className="btn-icon btn-danger"
              onClick={() => handleRemove(pv)}
              disabled={state.pointValues.length <= 1}
              title="Remove"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="add-point-row">
        <input
          type="number"
          min="1"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="e.g. 5"
          className="form-input point-input"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn-primary" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
}
