// ABOUTME: Matches extracted card text against a reference set
// ABOUTME: Normalizes text for comparison, returns matched and unmatched lists

export interface CardMatchResult {
  matched: { referenceText: string; extractedText: string }[];
  unmatched: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function matchCards(
  extracted: string[],
  referenceCards: string[],
): CardMatchResult {
  const matched: CardMatchResult['matched'] = [];
  const unmatched: string[] = [];
  const usedRefs = new Set<string>();

  const availableRefs = () => referenceCards.filter(r => !usedRefs.has(r));

  for (const text of extracted) {
    const normalizedExtracted = normalize(text);

    // Try exact match first
    let match = availableRefs().find(
      ref => normalize(ref) === normalizedExtracted,
    );

    // Try containment match (handles OCR artifacts like quotes, periods)
    if (!match) {
      match = availableRefs().find(ref => {
        const normalizedRef = normalize(ref);
        return normalizedExtracted.includes(normalizedRef)
          || normalizedRef.includes(normalizedExtracted);
      });
    }

    if (match) {
      usedRefs.add(match);
      matched.push({ referenceText: match, extractedText: text });
    } else {
      unmatched.push(text);
    }
  }

  return { matched, unmatched };
}
