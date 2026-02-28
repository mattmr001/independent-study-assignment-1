// ABOUTME: Tests for captures Redux slice
// ABOUTME: Verifies CRUD and session-scoped selection

import reducer, { addCapture, captureSelectors, selectCapturesBySessionId } from './slice';
import { Capture } from './types';

const mockCapture: Capture = {
  id: 'cap-1',
  sessionId: 'sess-1',
  imagePath: '/path/to/image.jpg',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('captures slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(captureSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a capture', () => {
    const state = reducer(undefined, addCapture(mockCapture));
    expect(captureSelectors.selectById(state, 'cap-1')).toEqual(mockCapture);
  });

  it('selects captures by session ID', () => {
    let state = reducer(undefined, addCapture(mockCapture));
    state = reducer(state, addCapture({
      ...mockCapture,
      id: 'cap-2',
      sessionId: 'sess-2',
    }));
    const filtered = selectCapturesBySessionId(state, 'sess-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('cap-1');
  });
});
