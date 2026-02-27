// ABOUTME: Participant domain types — coded research participant
// ABOUTME: Scoped to a study, no identifying information beyond protocol demographics

export interface Participant {
  id: string;
  studyId: string;
  codedId: string;
  demographics: Record<string, string | string[]>;
  createdAt: string;
}
