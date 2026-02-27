// ABOUTME: Tests for participants Redux slice
// ABOUTME: Verifies CRUD and study-scoped selection

import reducer, { addParticipant, participantSelectors, selectParticipantsByStudyId } from './slice';
import { Participant } from './types';

const mockParticipant: Participant = {
  id: 'part-1',
  studyId: 'study-1',
  codedId: 'P001',
  demographics: { age: '65', race: 'White' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('participants slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(participantSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a participant', () => {
    const state = reducer(undefined, addParticipant(mockParticipant));
    expect(participantSelectors.selectById(state, 'part-1')).toEqual(mockParticipant);
  });

  it('selects participants by study ID', () => {
    let state = reducer(undefined, addParticipant(mockParticipant));
    state = reducer(state, addParticipant({
      ...mockParticipant,
      id: 'part-2',
      studyId: 'study-2',
      codedId: 'P001',
    }));
    const filtered = selectParticipantsByStudyId(state, 'study-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('part-1');
  });
});
