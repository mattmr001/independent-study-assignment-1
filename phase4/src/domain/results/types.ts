// ABOUTME: Result domain types — output of an analysis
// ABOUTME: Contains matched instrument items and unmatched extractions for review

export interface MatchedItem {
  referenceText: string;
  extractedText: string;
}

export interface Result {
  id: string;
  analysisId: string;
  matched: MatchedItem[];
  unmatched: string[];
  rawOutput: string;
  createdAt: string;
}
