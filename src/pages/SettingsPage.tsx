import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function SettingsPage() {
  const { state, dispatch } = useAppState();
  const [newValue, setNewValue] = useState('');
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

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
      {isInstalled && (
        <p className="install-note">App is installed on your device.</p>
      )}

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
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
