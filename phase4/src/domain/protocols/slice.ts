// ABOUTME: Protocols Redux slice — manages static protocol configurations
// ABOUTME: Uses createEntityAdapter for normalized CRUD operations

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Protocol } from './types';

const adapter = createEntityAdapter<Protocol>();

const slice = createSlice({
  name: 'protocols',
  initialState: adapter.getInitialState(),
  reducers: {
    addProtocol: adapter.addOne,
  },
});

export const { addProtocol } = slice.actions;
export const protocolSelectors = adapter.getSelectors();
export default slice.reducer;
