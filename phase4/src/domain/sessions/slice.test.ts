// ABOUTME: Tests for sessions Redux slice
// ABOUTME: Verifies CRUD and study-scoped selection

import reducer, { addSession, sessionSelectors, selectSessionsByStudyId } from './slice';
import { Session } from './types';

const mockSession: Session = {
  id: 'sess-1',
  studyId: 'study-1',
  participantId: 'part-1',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('sessions slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(sessionSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a session', () => {
    const state = reducer(undefined, addSession(mockSession));
    expect(sessionSelectors.selectById(state, 'sess-1')).toEqual(mockSession);
  });

  it('selects sessions by study ID', () => {
    let state = reducer(undefined, addSession(mockSession));
    state = reducer(state, addSession({
      ...mockSession,
      id: 'sess-2',
      studyId: 'study-2',
    }));
    const filtered = selectSessionsByStudyId(state, 'study-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('sess-1');
  });
});
