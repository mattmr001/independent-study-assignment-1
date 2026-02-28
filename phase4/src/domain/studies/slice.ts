// ABOUTME: Studies Redux slice — manages runtime study containers
// ABOUTME: Uses createEntityAdapter for normalized CRUD operations

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Study } from './types';

const adapter = createEntityAdapter<Study>();

const slice = createSlice({
  name: 'studies',
  initialState: adapter.getInitialState(),
  reducers: {
    addStudy: adapter.addOne,
  },
});

export const { addStudy } = slice.actions;
export const studySelectors = adapter.getSelectors();
export default slice.reducer;
