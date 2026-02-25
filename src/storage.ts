import type { AppState } from './types';

const STORAGE_KEY = 'sports-points-data';
const CURRENT_VERSION = 6;

const PRESET_TEAMS = [
  { name: 'Blue', color: '#1a73e8' },
  { name: 'Red', color: '#d93025' },
  { name: 'Pink', color: '#e91e8c' },
  { name: 'Green', color: '#1e8e3e' },
  { name: 'Yellow', color: '#f9ab00' },
  { name: 'White', color: '#ffffff' },
];

interface PersistedState {
  version: number;
  data: AppState;
}

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

export const DEFAULT_STATE: AppState = {
  teams: PRESET_TEAMS.map((t) => ({ id: generateId(), ...t })),
  events: [],
  pointValues: [1, 3],
  autoSort: false,
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

  // v3 -> v4: add preset teams (only ones that don't already exist by name)
  if (persisted.version < 4) {
    const existingNames = new Set(data.teams.map((t) => t.name.toLowerCase()));
    const newTeams = PRESET_TEAMS
      .filter((pt) => !existingNames.has(pt.name.toLowerCase()))
      .map((pt) => ({ id: generateId(), ...pt }));
    data.teams = [...data.teams, ...newTeams];
  }

  // v4 -> v5: add autoSort preference
  if (persisted.version < 5) {
    data.autoSort = false;
  }

  // v5 -> v6: remove presetColors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (data as any).presetColors;

  return data;
}
