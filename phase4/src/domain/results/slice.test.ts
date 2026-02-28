// ABOUTME: Tests for results Redux slice
// ABOUTME: Verifies CRUD and analysis-scoped selection

import reducer, { addResult, resultSelectors, selectResultByAnalysisId } from './slice';
import { Result } from './types';

const mockResult: Result = {
  id: 'result-1',
  analysisId: 'analysis-1',
  matched: [{ referenceText: 'To be free from pain', extractedText: 'To be free from pain' }],
  unmatched: ['garbled text'],
  rawOutput: '{"cards": []}',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('results slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(resultSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a result', () => {
    const state = reducer(undefined, addResult(mockResult));
    expect(resultSelectors.selectById(state, 'result-1')).toEqual(mockResult);
  });

  it('selects result by analysis ID', () => {
    let state = reducer(undefined, addResult(mockResult));
    state = reducer(state, addResult({
      ...mockResult,
      id: 'result-2',
      analysisId: 'analysis-2',
    }));
    const found = selectResultByAnalysisId(state, 'analysis-1');
    expect(found?.id).toBe('result-1');
  });

  it('returns undefined for unknown analysis ID', () => {
    const state = reducer(undefined, addResult(mockResult));
    const found = selectResultByAnalysisId(state, 'nonexistent');
    expect(found).toBeUndefined();
  });
});
