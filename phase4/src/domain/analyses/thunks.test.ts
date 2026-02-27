// ABOUTME: Tests for analysis orchestration thunk
// ABOUTME: Verifies end-to-end flow: inference → card matching → result storage

import { makeStore, ThunkExtra } from '../../data/store';
import { addCapture } from '../captures/slice';
import { addAnalysis, analysisSelectors } from './slice';
import { runAnalysis } from './thunks';

const mockInferenceService: ThunkExtra['inferenceService'] = {
  run: jest.fn().mockResolvedValue({
    output: JSON.stringify({ cards: [{ text: 'To be free from pain' }, { text: 'Wild Card' }] }),
  }),
};

const MOCK_REFERENCE_CARDS = ['To be free from pain', 'Wild Card', 'To pray'];

describe('runAnalysis thunk', () => {
  it('runs inference and produces results', async () => {
    const store = makeStore(undefined, { inferenceService: mockInferenceService });

    store.dispatch(addCapture({
      id: 'cap-1',
      sessionId: 'sess-1',
      imagePath: '/path/to/image.jpg',
      createdAt: '2026-01-01T00:00:00Z',
    }));

    await store.dispatch(runAnalysis({
      captureId: 'cap-1',
      sessionId: 'sess-1',
      referenceCards: MOCK_REFERENCE_CARDS,
      strategyId: 'card-matching',
      prompt: 'Extract cards',
    }));

    const state = store.getState();
    const analyses = analysisSelectors.selectAll(state.analyses);
    expect(analyses).toHaveLength(1);
    expect(analyses[0].status).toBe('complete');
    expect(analyses[0].resultId).toBeTruthy();

    const results = state.results.ids;
    expect(results).toHaveLength(1);
  });

  it('marks analysis as failed when inference errors', async () => {
    const failingService: ThunkExtra['inferenceService'] = {
      run: jest.fn().mockRejectedValue(new Error('Model not loaded')),
    };
    const store = makeStore(undefined, { inferenceService: failingService });

    store.dispatch(addCapture({
      id: 'cap-1', sessionId: 'sess-1', imagePath: '/img.jpg', createdAt: '2026-01-01T00:00:00Z',
    }));

    await store.dispatch(runAnalysis({
      captureId: 'cap-1', sessionId: 'sess-1', referenceCards: [],
      strategyId: 'card-matching', prompt: 'Extract cards',
    }));

    const analyses = analysisSelectors.selectAll(store.getState().analyses);
    expect(analyses[0].status).toBe('failed');
    expect(analyses[0].error).toBe('Model not loaded');
  });
});
