// ABOUTME: Sessions domain slice — manages data collection sessions
// ABOUTME: Placeholder — will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'sessions',
  initialState: { ids: [] as string[], entities: {} as Record<string, unknown> },
  reducers: {},
});

export default slice.reducer;
