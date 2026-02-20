# Spike Evaluation Framework

## Pass/Fail Thresholds (T-P1)

| Criterion | Pass threshold | Measurement |
|---|---|---|
| Card text reading | ≥80% of visible cards correctly read | Exact or near-exact text match against ground truth |
| Spatial grouping | ≥70% of cards assigned to correct pile | Compare model's pile assignment to actual pile |
| Hallucination | Zero fabricated cards | Any card text not present in the photo = hallucination |
| Valid JSON | Valid JSON in ≥2 of 3 runs per prompt | Parseable with `jq` or `python -m json.tool` |

**Overall pass:** Card text reading AND hallucination thresholds met. Spatial grouping and JSON validity are secondary signals.

**Overall fail:** <60% card text reading OR any hallucinated cards across multiple runs.

**Ambiguous zone:** 60-79% card text reading — warrants prompt iteration before declaring pass/fail.

## Failure Taxonomy (T-P5)

Every error in model output is classified into exactly one category:

| Code | Category | Definition | Example |
|---|---|---|---|
| OCR | Text recognition error | Card detected but text wrong | "To be free from pan" instead of "To be free from pain" |
| MISS | Detection miss | Card visible in photo but not in output | Card clearly visible, model doesn't mention it |
| SPATIAL | Spatial grouping error | Card found with correct text but assigned to wrong pile | Card in left pile reported as center pile |
| HALLUC | Hallucination | Card in output that doesn't exist in photo | Model reports a card not visible in the image |
| FORMAT | Format error | Output is not valid JSON or doesn't match schema | Missing closing brace, wrong field names |
| PARTIAL | Partial read | Card detected, text partially correct | "To have my financial" instead of "To have my financial affairs in order" |

## Scoring Procedure

For each run (1 prompt × 1 image):
1. Parse model output (or note FORMAT error if unparseable)
2. Match each model-reported card to a ground truth card (exact or fuzzy text match)
3. Classify unmatched model cards as HALLUC
4. Classify unmatched ground truth cards as MISS
5. For matched cards, check text accuracy (OCR/PARTIAL) and pile assignment (SPATIAL)
6. Calculate: cards_correct / cards_visible = accuracy %
