// ABOUTME: Generates sequential coded participant IDs (P001, P002, ...)
// ABOUTME: Takes current participant count, returns next ID string

export function generateCodedId(existingCount: number): string {
  return `P${String(existingCount + 1).padStart(3, '0')}`;
}
