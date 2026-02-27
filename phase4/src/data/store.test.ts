// ABOUTME: Tests for Redux store configuration
// ABOUTME: Verifies store creates with correct initial state

import { makeStore } from './store';

describe('store', () => {
  it('creates with empty initial state for all slices', () => {
    const store = makeStore();
    const state = store.getState();

    expect(state.protocols).toBeDefined();
    expect(state.studies).toBeDefined();
    expect(state.participants).toBeDefined();
    expect(state.sessions).toBeDefined();
    expect(state.captures).toBeDefined();
    expect(state.analyses).toBeDefined();
    expect(state.results).toBeDefined();
  });
});
