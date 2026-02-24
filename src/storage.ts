import type { AppState } from './types';

const STORAGE_KEY = 'sports-points-data';
const CURRENT_VERSION = 3;

const DEFAULT_COLORS = ['#1a73e8', '#d93025', '#e91e8c', '#1e8e3e', '#f9ab00', '#ffffff'];

interface PersistedState {
  version: number;
  data: AppState;
}

export const DEFAULT_STATE: AppState = {
  teams: [],
  events: [],
  pointValues: [1, 3],
  presetColors: DEFAULT_COLORS,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed: PersistedState = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  const persisted: PersistedState = {
    version: CURRENT_VERSION,
    data: state,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function migrate(persisted: PersistedState): AppState {
  const data = persisted.data;

  // v1 -> v2: add color to teams
  if (persisted.version < 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.teams = data.teams.map((t: any) => ({
      ...t,
      color: t.color || '#1a73e8',
    }));
  }

  // v2 -> v3: add preset colors
  if (persisted.version < 3) {
    data.presetColors = DEFAULT_COLORS;
  }

  return data;
}
