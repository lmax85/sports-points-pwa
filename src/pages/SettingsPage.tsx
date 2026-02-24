import { useRef, useState, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';

function PresetColorsList() {
  const { state, dispatch } = useAppState();
  const pickerRef = useRef<HTMLInputElement>(null);

  const handlePickerChange = useCallback(() => {
    if (pickerRef.current) {
      dispatch({ type: 'ADD_PRESET_COLOR', color: pickerRef.current.value });
    }
  }, [dispatch]);

  const attachPicker = useCallback((el: HTMLInputElement | null) => {
    // Detach from previous element
    if (pickerRef.current) {
      pickerRef.current.removeEventListener('change', handlePickerChange);
    }
    pickerRef.current = el;
    // Attach native change event (fires only on close, unlike React's onChange)
    if (el) {
      el.addEventListener('change', handlePickerChange);
    }
  }, [handlePickerChange]);

  return (
    <div className="preset-colors-list">
      {state.presetColors.map((color) => (
        <div key={color} className="preset-color-item">
          <span className="preset-color-swatch" style={{ background: color }} />
          <button
            className="btn-icon-sm btn-danger-sm"
            onClick={() => dispatch({ type: 'REMOVE_PRESET_COLOR', color })}
            disabled={state.presetColors.length <= 1}
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        className="preset-color-add"
        onClick={() => pickerRef.current?.click()}
        title="Add color"
      >
        +
      </button>
      <input
        ref={attachPicker}
        type="color"
        className="color-native-input"
      />
    </div>
  );
}

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

      <h3>Preset Colors</h3>
      <p className="hint">Quick-pick colors shown in the team color picker.</p>

      <PresetColorsList />
    </div>
  );
}
