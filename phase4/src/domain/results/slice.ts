// ABOUTME: Results Redux slice — manages analysis output
// ABOUTME: Scoped to analyses via selectResultByAnalysisId selector

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Result } from './types';

const adapter = createEntityAdapter<Result>();

const slice = createSlice({
  name: 'results',
  initialState: adapter.getInitialState(),
  reducers: {
    addResult: adapter.addOne,
  },
});

export const { addResult } = slice.actions;
export const resultSelectors = adapter.getSelectors();

export function selectResultByAnalysisId(
  state: ReturnType<typeof slice.reducer>,
  analysisId: string,
): Result | undefined {
  return resultSelectors.selectAll(state).find(r => r.analysisId === analysisId);
}

export default slice.reducer;
