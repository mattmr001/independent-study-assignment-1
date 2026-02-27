// ABOUTME: Session domain types — one data collection session
// ABOUTME: Links a participant to a study at a point in time

export interface Session {
  id: string;
  studyId: string;
  participantId: string;
  createdAt: string;
}
