// ABOUTME: Protocols domain slice — manages static protocol configurations
// ABOUTME: Placeholder — will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'protocols',
  initialState: { ids: [] as string[], entities: {} as Record<string, unknown> },
  reducers: {},
});

export default slice.reducer;
