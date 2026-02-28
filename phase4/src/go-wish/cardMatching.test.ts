// ABOUTME: Tests for card matching logic
// ABOUTME: Verifies text extraction matching against 36-card reference set

import { matchCards } from './cardMatching';

const REFERENCE_CARDS = [
  'To be free from pain',
  'To be mentally aware',
  'To keep my sense of humor',
  'Wild Card',
];

describe('matchCards', () => {
  it('matches exact text', () => {
    const extracted = ['To be free from pain', 'Wild Card'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(2);
    expect(result.matched[0].referenceText).toBe('To be free from pain');
    expect(result.matched[0].extractedText).toBe('To be free from pain');
    expect(result.unmatched).toHaveLength(0);
  });

  it('matches case-insensitively with normalized whitespace', () => {
    const extracted = ['to be free from pain', 'TO KEEP MY  SENSE OF HUMOR'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(0);
  });

  it('returns unmatched extractions separately', () => {
    const extracted = ['To be free from pain', 'Something the model hallucinated'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toEqual(['Something the model hallucinated']);
  });

  it('matches when extracted text contains the reference (OCR artifacts)', () => {
    const extracted = ['To be free from pain.', '"To keep my sense of humor"'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(2);
  });

  it('handles empty extraction list', () => {
    const result = matchCards([], REFERENCE_CARDS);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(0);
  });

  it('does not match the same reference card twice', () => {
    const extracted = ['To be free from pain', 'to be free from pain'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(1);
  });
});
