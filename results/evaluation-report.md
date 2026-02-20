# Qwen3-VL-2B Spike Evaluation Report

**Date:** 2026-02-20
**Model:** Qwen3-VL-2B-Instruct, Q4_K_M quantization (1.03 GiB)
**Vision projector:** mmproj-Qwen3VL-2B-Instruct-F16 (781 MiB)
**Runtime:** llama-mtmd-cli (llama.cpp build 8110)
**Hardware:** Apple M3 Max, 48 GB unified memory

## Summary

**PASS.** Qwen3-VL-2B reads both printed Go Wish card text and handwritten sticky note text with 100% accuracy across two test images. Zero hallucinations across all 6 runs. Inference completes in 4–10 seconds on desktop. Spatial grouping works when items have clear visual separation. The model handles handwritten text as well as printed text — a stronger result than expected for a 2B-parameter model.

## Results: 01-controlled.jpg (printed Go Wish cards, top-down, well-lit, 10 cards in 2×5 grid)

### Run 0: Sanity Check (free-form description)

Model correctly identified: 10 cards in 2 rows of 5, white cards with purple borders on a wooden surface, Wild Card with leaf design. Listed all 10 card texts accurately in prose.

### Run 1: Spatial Grouping Prompt

| Metric | Result |
|---|---|
| Cards read correctly | 10/10 (100%) |
| Cards grouped correctly | 0/10 (each card became its own "pile") |
| Hallucinated cards | 0 |
| Valid JSON | Yes |

**Error breakdown:**

| Error code | Count | Notes |
|---|---|---|
| OCR | 0 | |
| MISS | 0 | |
| SPATIAL | 10 | Model created 1 pile per card instead of grouping by row |
| HALLUC | 0 | |
| FORMAT | 0 | |
| PARTIAL | 0 | |

### Run 2: Bounding Box Prompt

| Metric | Result |
|---|---|
| Cards read correctly | 10/10 (100%) |
| Hallucinated cards | 0 |
| Valid JSON | Yes |
| Bounding boxes plausible | Partially — pixel coords instead of normalized 0-1 |

**Error breakdown:**

| Error code | Count | Notes |
|---|---|---|
| OCR | 0 | |
| MISS | 0 | |
| SPATIAL | 0 | Bounding box positions correctly encode left-to-right, top-to-bottom card ordering |
| HALLUC | 0 | |
| FORMAT | 1 | Coordinates are pixel values, not normalized 0-1 as requested |
| PARTIAL | 0 | |

### Performance (01-controlled.jpg)

| Metric | Sanity Check | Spatial Grouping | Bounding Boxes |
|---|---|---|---|
| Prompt eval | 1.18 ms/tok (849 tok/s) | 0.92 ms/tok (1092 tok/s) | 0.91 ms/tok (1102 tok/s) |
| Generation | 5.69 ms/tok (176 tok/s) | 5.80 ms/tok (172 tok/s) | 5.85 ms/tok (171 tok/s) |
| Total time | 3.96s | 4.12s | 6.43s |
| Image tokens | 1921 | 1993 | 2005 |

## Results: 02-angled.jpg (handwritten sticky notes on wall, 8 notes in 2×4 grid)

This image tests handwritten text recognition: yellow sticky notes with marker text on a gray wall. Significantly harder than printed cards.

### Run 3: Sanity Check (free-form description)

Model correctly identified: 8 yellow sticky notes on a light gray surface, arranged in two rows of 4, with handwritten phrases. Correctly read example texts.

### Run 4: Spatial Grouping Prompt

| Metric | Result |
|---|---|
| Cards read correctly | 8/8 (100%) |
| Cards grouped correctly | 8/8 (left/center/right columns) |
| Hallucinated cards | 0 |
| Valid JSON | Yes |

Grouping detail:
- Left: "To die at home", "To have human touch" — column 1 ✓
- Center: "To be free of pain", "To keep my sense of humour", "To be free from anxiety", "To be kept clean" — columns 2+3 merged ✓
- Right: "Wild card", "To be mentally aware" — column 4 ✓

**Error breakdown:**

| Error code | Count | Notes |
|---|---|---|
| OCR | 0 | |
| MISS | 0 | |
| SPATIAL | 0 | All 8 cards assigned to correct column groups |
| HALLUC | 0 | |
| FORMAT | 0 | |
| PARTIAL | 0 | |

### Run 5: Bounding Box Prompt

| Metric | Result |
|---|---|
| Cards read correctly | 8/8 (100%) |
| Hallucinated cards | 0 |
| Valid JSON | Yes |
| Bounding boxes plausible | Yes — pixel coords, correct 4×2 grid layout |

Bounding box analysis:
- Top row: y_min=282, y_max=370 (consistent)
- Bottom row: y_min=522, y_max=601 (consistent)
- x values: ~37, ~291, ~504, ~717 for each column (consistent spacing)

**Error breakdown:**

| Error code | Count | Notes |
|---|---|---|
| OCR | 0 | |
| MISS | 0 | |
| SPATIAL | 0 | 4-column, 2-row layout perfectly encoded |
| HALLUC | 0 | |
| FORMAT | 1 | Coordinates are pixel values, not normalized 0-1 |
| PARTIAL | 0 | |

### Performance (02-angled.jpg)

| Metric | Sanity Check | Spatial Grouping | Bounding Boxes |
|---|---|---|---|
| Prompt eval | 1.38 ms/tok (724 tok/s) | 1.34 ms/tok (747 tok/s) | 1.34 ms/tok (748 tok/s) |
| Generation | 6.69 ms/tok (149 tok/s) | 6.47 ms/tok (155 tok/s) | 6.29 ms/tok (159 tok/s) |
| Total time | 6.79s | 6.66s | 9.49s |
| Image tokens | 4036 | 4108 | 4120 |

## Cross-Image Comparison

| Metric | 01-controlled (printed) | 02-angled (handwritten) |
|---|---|---|
| Card text accuracy | 10/10 (100%) | 8/8 (100%) |
| Hallucinations | 0 | 0 |
| Spatial grouping | Failed (1 pile per card) | Passed (left/center/right) |
| Bounding box ordering | Correct | Correct |
| Valid JSON | 3/3 runs | 3/3 runs |
| Image tokens | ~2000 | ~4100 |
| Total inference time | 4–6s | 7–10s |

## Key Findings

1. **Card text reading is flawless across both conditions.** 100% accuracy on printed cards AND handwritten sticky notes — well above the 80% pass threshold. Every text is an exact match with no OCR errors, partial reads, or missed items.

2. **Handwritten text reading works as well as printed.** This was not assumed going in. The model correctly reads marker-on-sticky-note handwriting, which broadens the potential use beyond Go Wish cards to general co-design artifacts (affinity diagrams, sticky note exercises, etc.).

3. **Zero hallucinations across all runs.** The model never fabricated a card or note that wasn't in the photo.

4. **Spatial grouping depends on visual separation.** Failed on the tightly-packed 2×5 printed card grid but succeeded on the more visually separated sticky notes. The model can group spatially when items have clear gaps between clusters.

5. **Bounding box output shows consistent spatial awareness.** Both images produce correctly ordered coordinates with consistent row/column structure. Coordinates are pixel values rather than normalized 0–1, but the spatial information is accurate.

6. **JSON output is reliable.** All 6 runs produced valid, parseable JSON. The only format deviation is bounding box normalization.

7. **Performance scales with image complexity.** The handwritten image produces ~2× more tokens (4100 vs 2000) and takes proportionally longer (7–10s vs 4–6s). Generation speed stays consistent at ~150–175 tokens/second.

## Limitations of This Evaluation

- **Two images tested.** Accuracy under low-light, heavy overlap, extreme angles, or very distant shots is unknown.
- **No pile separation in either test.** Neither image tests discrete separated piles, which is the Go Wish facilitator use case.
- **Desktop only.** Performance and accuracy on mobile (iPhone via llama.rn) are untested. Memory constraints on-device may require further quantization.
- **Clean handwriting only.** The sticky note text was written clearly. Rushed or messy handwriting was not tested.

## Go/No-Go Decision

**Decision: PASS — proceed to Phase 2 (on-device validation)**

**Rationale:** Card text reading (100% across both images) exceeds the 80% threshold. Hallucination count (0) meets the zero-tolerance threshold. Per the evaluation framework, these are the two primary pass criteria. The handwritten text result significantly strengthens the case — the model can handle co-design artifacts beyond printed Go Wish cards.

**Next steps for Phase 2:**
- Test with Expo + llama.rn on iPhone 17 Pro
- Measure latency and memory under iOS constraints
- Test with phone camera photos (varying angle, distance, lighting)
- Test pile-separated card layouts for spatial grouping
- Test messier handwriting and mixed artifacts

**Risks for Phase 2:**
- Q4_K_M quantization may be too large for on-device memory; may need Q3_K or IQ2 quantization with unknown accuracy impact
- Phone camera photos will differ from these test conditions
- llama.rn may not support Qwen3-VL's vision projector architecture yet
- Inference time (~7–10s for complex images) may be too slow for real-time facilitator use
