// ABOUTME: Participants domain slice — manages coded research participants
// ABOUTME: Placeholder — will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'participants',
  initialState: { ids: [] as string[], entities: {} as Record<string, unknown> },
  reducers: {},
});

export default slice.reducer;
