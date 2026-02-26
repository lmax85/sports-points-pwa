import { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, Action } from '../types';
import { loadState, saveState } from '../storage';

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Fallback for older browsers / non-HTTPS contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TEAM': {
      const exists = state.teams.some(
        (t) => t.name.toLowerCase() === action.name.toLowerCase()
      );
      if (exists) return state;
      const colorMatch: Record<string, string> = {
        blue: '#1a73e8', red: '#d93025', pink: '#e91e8c',
        green: '#1e8e3e', yellow: '#f9ab00', white: '#ffffff',
      };
      const color = colorMatch[action.name.toLowerCase()] || '#1a73e8';
      return {
        ...state,
        teams: [...state.teams, { id: uuid(), name: action.name, color }],
      };
    }

    case 'RENAME_TEAM': {
      const exists = state.teams.some(
        (t) => t.id !== action.teamId && t.name.toLowerCase() === action.name.toLowerCase()
      );
      if (exists) return state;
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId ? { ...t, name: action.name } : t
        ),
      };
    }

    case 'SET_TEAM_COLOR':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.teamId ? { ...t, color: action.color } : t
        ),
      };

    case 'CREATE_EVENT': {
      const event = {
        id: action.id,
        label: action.label,
        date: action.date,
        teamIds: action.teamIds,
        entries: [],
        createdAt: Date.now(),
      };
      return { ...state, events: [event, ...state.events] };
    }

    case 'EDIT_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? { ...e, label: action.label, date: action.date }
            : e
        ),
      };

    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter((e) => e.id !== action.eventId),
      };

    case 'ADD_TEAM_TO_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId && !e.teamIds.includes(action.teamId)
            ? { ...e, teamIds: [...e.teamIds, action.teamId] }
            : e
        ),
      };

    case 'REMOVE_TEAM_FROM_EVENT':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? {
                ...e,
                teamIds: e.teamIds.filter((id) => id !== action.teamId),
                entries: e.entries.filter((en) => en.teamId !== action.teamId),
              }
            : e
        ),
      };

    case 'ADD_SCORE': {
      const entry = {
        id: uuid(),
        teamId: action.teamId,
        points: action.points,
        timestamp: Date.now(),
      };
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? { ...e, entries: [...e.entries, entry] }
            : e
        ),
      };
    }

    case 'UNDO_SCORE':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.eventId
            ? { ...e, entries: e.entries.slice(0, -1) }
            : e
        ),
      };

    case 'ADD_POINT_VALUE': {
      if (state.pointValues.includes(action.value)) return state;
      const values = [...state.pointValues, action.value].sort((a, b) => a - b);
      return { ...state, pointValues: values };
    }

    case 'REMOVE_POINT_VALUE': {
      if (state.pointValues.length <= 1) return state;
      return {
        ...state,
        pointValues: state.pointValues.filter((v) => v !== action.value),
      };
    }

    case 'TOGGLE_AUTO_SORT':
      return { ...state, autoSort: !state.autoSort };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
