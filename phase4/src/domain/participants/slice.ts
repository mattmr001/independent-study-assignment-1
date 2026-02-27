// ABOUTME: Participants Redux slice — manages coded research participants
// ABOUTME: Scoped to studies via selectParticipantsByStudyId selector

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Participant } from './types';

const adapter = createEntityAdapter<Participant>();

const slice = createSlice({
  name: 'participants',
  initialState: adapter.getInitialState(),
  reducers: {
    addParticipant: adapter.addOne,
  },
});

export const { addParticipant } = slice.actions;
export const participantSelectors = adapter.getSelectors();

export function selectParticipantsByStudyId(
  state: ReturnType<typeof slice.reducer>,
  studyId: string,
): Participant[] {
  return participantSelectors.selectAll(state).filter(p => p.studyId === studyId);
}

export default slice.reducer;
