// ABOUTME: Tests for studies Redux slice
// ABOUTME: Verifies CRUD operations on study entities

import reducer, { addStudy, studySelectors } from './slice';
import { Study } from './types';

const mockStudy: Study = {
  id: 'study-1',
  name: 'ED Pilot',
  protocolId: 'proto-1',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('studies slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(studySelectors.selectAll(state)).toEqual([]);
  });

  it('adds a study', () => {
    const state = reducer(undefined, addStudy(mockStudy));
    expect(studySelectors.selectById(state, 'study-1')).toEqual(mockStudy);
  });
});
