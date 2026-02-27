// ABOUTME: Studies domain slice — manages runtime study containers
// ABOUTME: Placeholder — will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'studies',
  initialState: { ids: [] as string[], entities: {} as Record<string, unknown> },
  reducers: {},
});

export default slice.reducer;
