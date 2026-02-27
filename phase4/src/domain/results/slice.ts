// ABOUTME: Results domain slice — manages analysis output
// ABOUTME: Placeholder — will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'results',
  initialState: { ids: [] as string[], entities: {} as Record<string, unknown> },
  reducers: {},
});

export default slice.reducer;
