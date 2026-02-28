// ABOUTME: Tests for protocols Redux slice
// ABOUTME: Verifies CRUD operations on protocol entities

import reducer, { addProtocol, protocolSelectors } from './slice';
import { Protocol } from './types';

const mockProtocol: Protocol = {
  id: 'proto-1',
  name: 'Go Wish',
  description: 'End-of-life care card sorting',
  instruments: [{
    id: 'inst-1',
    name: 'Go Wish Cards',
    referenceItems: ['To be free from pain'],
  }],
  participantSchema: [{
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
  }],
  strategies: [{
    id: 'strat-1',
    name: 'Card Matching',
    prompt: 'Extract all Go Wish cards visible in this image.',
  }],
};

describe('protocols slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(protocolSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a protocol', () => {
    const state = reducer(undefined, addProtocol(mockProtocol));
    expect(protocolSelectors.selectById(state, 'proto-1')).toEqual(mockProtocol);
  });

  it('selects all protocols', () => {
    const state = reducer(undefined, addProtocol(mockProtocol));
    expect(protocolSelectors.selectAll(state)).toHaveLength(1);
  });
});
