// ABOUTME: Tests for study detail screen
// ABOUTME: Verifies participant list, session list, and navigation

import { renderWithStore } from '../../../src/test-utils';
import StudyDetailScreen from './index';

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ studyId: 'study-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('StudyDetailScreen', () => {
  const preloadedState = {
    studies: {
      ids: ['study-1'],
      entities: { 'study-1': { id: 'study-1', name: 'Test Study', protocolId: 'go-wish', createdAt: '2026-01-01T00:00:00Z' } },
    },
    participants: { ids: [], entities: {} },
    sessions: { ids: [], entities: {} },
  };

  it('shows study name', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('Test Study')).toBeTruthy();
  });

  it('shows Add Participant button', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('Add Participant')).toBeTruthy();
  });

  it('shows New Session button', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('New Session')).toBeTruthy();
  });

  it('lists participants when they exist', () => {
    const stateWithParticipant = {
      ...preloadedState,
      participants: {
        ids: ['p-1'],
        entities: {
          'p-1': { id: 'p-1', studyId: 'study-1', codedId: 'P001', demographics: {}, createdAt: '2026-01-01T00:00:00Z' },
        },
      },
    };
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState: stateWithParticipant });
    expect(getByText('P001')).toBeTruthy();
  });
});
