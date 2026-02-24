export type Id = string;

export interface Team {
  id: Id;
  name: string;
  color: string;
}

export interface ScoreEntry {
  id: Id;
  teamId: Id;
  points: number;
  timestamp: number;
}

export interface SportEvent {
  id: Id;
  label: string;
  date: string;
  teamIds: Id[];
  entries: ScoreEntry[];
  createdAt: number;
}

export interface AppState {
  teams: Team[];
  events: SportEvent[];
  pointValues: number[];
  presetColors: string[];
}

export type Action =
  | { type: 'ADD_TEAM'; name: string }
  | { type: 'RENAME_TEAM'; teamId: Id; name: string }
  | { type: 'SET_TEAM_COLOR'; teamId: Id; color: string }
  | { type: 'CREATE_EVENT'; label: string; date: string; teamIds: Id[] }
  | { type: 'EDIT_EVENT'; eventId: Id; label: string; date: string }
  | { type: 'DELETE_EVENT'; eventId: Id }
  | { type: 'ADD_TEAM_TO_EVENT'; eventId: Id; teamId: Id }
  | { type: 'REMOVE_TEAM_FROM_EVENT'; eventId: Id; teamId: Id }
  | { type: 'ADD_SCORE'; eventId: Id; teamId: Id; points: number }
  | { type: 'UNDO_SCORE'; eventId: Id }
  | { type: 'ADD_POINT_VALUE'; value: number }
  | { type: 'REMOVE_POINT_VALUE'; value: number }
  | { type: 'ADD_PRESET_COLOR'; color: string }
  | { type: 'REMOVE_PRESET_COLOR'; color: string };
