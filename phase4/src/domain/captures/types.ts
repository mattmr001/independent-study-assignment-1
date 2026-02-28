// ABOUTME: Capture domain types — immutable raw photo capture
// ABOUTME: Scoped to a session, never modified after creation

export interface Capture {
  id: string;
  sessionId: string;
  imagePath: string;
  createdAt: string;
}
