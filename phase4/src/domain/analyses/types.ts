// ABOUTME: Analysis domain types — repeatable processing of a capture
// ABOUTME: Uses a strategy to extract and match data from a capture image

export type AnalysisStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface Analysis {
  id: string;
  sessionId: string;
  captureId: string;
  strategyId: string;
  status: AnalysisStatus;
  resultId: string | null;
  error: string | null;
  createdAt: string;
}
