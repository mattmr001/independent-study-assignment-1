// ABOUTME: Analyses Redux slice — manages repeatable capture processing
// ABOUTME: Tracks analysis status and links to results

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Analysis } from './types';

const adapter = createEntityAdapter<Analysis>();

const slice = createSlice({
  name: 'analyses',
  initialState: adapter.getInitialState(),
  reducers: {
    addAnalysis: adapter.addOne,
    updateAnalysis: adapter.updateOne,
  },
});

export const { addAnalysis, updateAnalysis } = slice.actions;
export const analysisSelectors = adapter.getSelectors();

export function selectAnalysesBySessionId(
  state: ReturnType<typeof slice.reducer>,
  sessionId: string,
): Analysis[] {
  return analysisSelectors.selectAll(state).filter(a => a.sessionId === sessionId);
}

export default slice.reducer;
