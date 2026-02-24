import { useRef, useState, useCallback, useEffect } from 'react';

interface PointButtonProps {
  value: number;
  onClick: () => void;
}

const HOLD_DURATION = 500;

export function PointButton({ value, onClick }: PointButtonProps) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const firedRef = useRef(false);

  const stop = useCallback(() => {
    setHolding(false);
    setProgress(0);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / HOLD_DURATION, 1);
    setProgress(pct);
    if (pct >= 1) {
      if (!firedRef.current) {
        firedRef.current = true;
        onClick();
      }
      stop();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [onClick, stop]);

  function start() {
    firedRef.current = false;
    startRef.current = Date.now();
    setHolding(true);
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
  }

  // Cleanup on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return (
    <button
      className={`point-btn ${holding ? 'point-btn--holding' : ''}`}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {holding && (
        <span
          className="point-btn-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      )}
      <span className="point-btn-label">+{value}</span>
    </button>
  );
}
