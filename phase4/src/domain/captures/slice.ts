// ABOUTME: Captures Redux slice — manages immutable photo captures
// ABOUTME: Scoped to sessions via selectCapturesBySessionId selector

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Capture } from './types';

const adapter = createEntityAdapter<Capture>();

const slice = createSlice({
  name: 'captures',
  initialState: adapter.getInitialState(),
  reducers: {
    addCapture: adapter.addOne,
  },
});

export const { addCapture } = slice.actions;
export const captureSelectors = adapter.getSelectors();

export function selectCapturesBySessionId(
  state: ReturnType<typeof slice.reducer>,
  sessionId: string,
): Capture[] {
  return captureSelectors.selectAll(state).filter(c => c.sessionId === sessionId);
}

export default slice.reducer;
