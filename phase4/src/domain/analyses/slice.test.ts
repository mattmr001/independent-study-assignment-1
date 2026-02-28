// ABOUTME: Tests for analyses Redux slice
// ABOUTME: Verifies CRUD, status transitions, and session-scoped selection

import reducer, { addAnalysis, updateAnalysis, analysisSelectors, selectAnalysesBySessionId } from './slice';
import { Analysis } from './types';

const mockAnalysis: Analysis = {
  id: 'analysis-1',
  sessionId: 'session-1',
  captureId: 'capture-1',
  strategyId: 'strat-1',
  status: 'pending',
  resultId: null,
  error: null,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('analyses slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(analysisSelectors.selectAll(state)).toEqual([]);
  });

  it('adds an analysis', () => {
    const state = reducer(undefined, addAnalysis(mockAnalysis));
    expect(analysisSelectors.selectById(state, 'analysis-1')?.status).toBe('pending');
  });

  it('updates analysis status', () => {
    let state = reducer(undefined, addAnalysis(mockAnalysis));
    state = reducer(state, updateAnalysis({
      id: 'analysis-1',
      changes: { status: 'complete', resultId: 'result-1' },
    }));
    const analysis = analysisSelectors.selectById(state, 'analysis-1');
    expect(analysis?.status).toBe('complete');
    expect(analysis?.resultId).toBe('result-1');
  });

  it('selects analyses by session ID', () => {
    let state = reducer(undefined, addAnalysis(mockAnalysis));
    state = reducer(state, addAnalysis({
      ...mockAnalysis,
      id: 'analysis-2',
      sessionId: 'session-2',
    }));
    const filtered = selectAnalysesBySessionId(state, 'session-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('analysis-1');
  });
});
