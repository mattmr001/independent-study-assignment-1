// ABOUTME: Tests for results screen
// ABOUTME: Verifies analysis progress and matched card display

import { renderWithStore } from '../../../../../src/test-utils';
import ResultsScreen from './results';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ studyId: 'study-1', sessionId: 'session-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('ResultsScreen', () => {
  it('shows progress indicator during analysis', () => {
    const preloadedState = {
      studies: {
        ids: ['study-1'],
        entities: { 'study-1': { id: 'study-1', name: 'Test Study', protocolId: 'go-wish', createdAt: '2026-01-01T00:00:00Z' } },
      },
      protocols: {
        ids: ['go-wish'],
        entities: { 'go-wish': { id: 'go-wish', name: 'Go Wish', description: '', instruments: [{ id: 'cards', name: 'Cards', referenceItems: [] }], participantSchema: [], strategies: [{ id: 'card-matching', name: 'Card Matching', prompt: 'test' }] } },
      },
      sessions: {
        ids: ['session-1'],
        entities: { 'session-1': { id: 'session-1', studyId: 'study-1', participantId: 'p-1', createdAt: '2026-01-01T00:00:00Z' } },
      },
      captures: {
        ids: ['cap-1'],
        entities: { 'cap-1': { id: 'cap-1', sessionId: 'session-1', imagePath: '/img.jpg', createdAt: '2026-01-01T00:00:00Z' } },
      },
      analyses: {
        ids: ['analysis-1'],
        entities: { 'analysis-1': { id: 'analysis-1', captureId: 'cap-1', sessionId: 'session-1', strategyId: 'card-matching', status: 'running', createdAt: '2026-01-01T00:00:00Z' } },
      },
      results: { ids: [], entities: {} },
    };
    const { getByText } = renderWithStore(<ResultsScreen />, { preloadedState });
    expect(getByText(/analyzing/i)).toBeTruthy();
  });

  it('displays matched cards from completed analysis', () => {
    const preloadedState = {
      studies: {
        ids: ['study-1'],
        entities: { 'study-1': { id: 'study-1', name: 'Test Study', protocolId: 'go-wish', createdAt: '2026-01-01T00:00:00Z' } },
      },
      protocols: {
        ids: ['go-wish'],
        entities: { 'go-wish': { id: 'go-wish', name: 'Go Wish', description: '', instruments: [{ id: 'cards', name: 'Cards', referenceItems: [] }], participantSchema: [], strategies: [{ id: 'card-matching', name: 'Card Matching', prompt: 'test' }] } },
      },
      sessions: {
        ids: ['session-1'],
        entities: { 'session-1': { id: 'session-1', studyId: 'study-1', participantId: 'p-1', createdAt: '2026-01-01T00:00:00Z' } },
      },
      captures: {
        ids: ['cap-1'],
        entities: { 'cap-1': { id: 'cap-1', sessionId: 'session-1', imagePath: '/img.jpg', createdAt: '2026-01-01T00:00:00Z' } },
      },
      analyses: {
        ids: ['analysis-1'],
        entities: { 'analysis-1': { id: 'analysis-1', captureId: 'cap-1', sessionId: 'session-1', strategyId: 'card-matching', status: 'complete', resultId: 'result-1', createdAt: '2026-01-01T00:00:00Z' } },
      },
      results: {
        ids: ['result-1'],
        entities: {
          'result-1': {
            id: 'result-1', analysisId: 'analysis-1',
            matched: [{ referenceText: 'To be free from pain', extractedText: 'To be free from pain' }],
            unmatched: ['garbled text'],
            rawOutput: '{}',
            createdAt: '2026-01-01T00:00:00Z',
          },
        },
      },
    };
    const { getByText } = renderWithStore(<ResultsScreen />, { preloadedState });
    expect(getByText('To be free from pain')).toBeTruthy();
    expect(getByText('[!] garbled text')).toBeTruthy();
  });
});
