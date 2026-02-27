// ABOUTME: Sessions Redux slice — manages data collection sessions
// ABOUTME: Scoped to studies via selectSessionsByStudyId selector

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Session } from './types';

const adapter = createEntityAdapter<Session>();

const slice = createSlice({
  name: 'sessions',
  initialState: adapter.getInitialState(),
  reducers: {
    addSession: adapter.addOne,
  },
});

export const { addSession } = slice.actions;
export const sessionSelectors = adapter.getSelectors();

export function selectSessionsByStudyId(
  state: ReturnType<typeof slice.reducer>,
  studyId: string,
): Session[] {
  return sessionSelectors.selectAll(state).filter(s => s.studyId === studyId);
}

export default slice.reducer;
