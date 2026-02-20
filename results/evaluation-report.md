# Qwen3-VL-2B Spike Evaluation Report

**Date:** 2026-02-20
**Model:** Qwen3-VL-2B-Instruct, Q4_K_M quantization (1.03 GiB)
**Vision projector:** mmproj-Qwen3VL-2B-Instruct-F16 (781 MiB)
**Runtime:** llama-mtmd-cli (llama.cpp build 8110)
**Hardware:** Apple M3 Max, 48 GB unified memory

## Summary

**PASS.** Qwen3-VL-2B reads Go Wish card text with 100% accuracy on a controlled top-down photograph. Zero hallucinations across all runs. Inference completes in 4–6 seconds on desktop. The primary research question — can a 2B-parameter VLM read printed card text from a photograph? — is answered affirmatively. Spatial grouping into piles was not demonstrated, but this is a prompt/image design issue rather than a model capability gap, given that bounding box output shows correct spatial ordering.

## Results: 01-controlled.jpg (top-down, well-lit, 10 cards in 2×5 grid)

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

### Performance

| Metric | Sanity Check | Spatial Grouping | Bounding Boxes |
|---|---|---|---|
| Prompt eval | 1.18 ms/tok (849 tok/s) | 0.92 ms/tok (1092 tok/s) | 0.91 ms/tok (1102 tok/s) |
| Generation | 5.69 ms/tok (176 tok/s) | 5.80 ms/tok (172 tok/s) | 5.85 ms/tok (171 tok/s) |
| Total time | 3.96s | 4.12s | 6.43s |

## Key Findings

1. **Card text reading is flawless under controlled conditions.** 100% accuracy across 3 different prompts — well above the 80% pass threshold. Every card text is an exact match with no OCR errors, partial reads, or missed cards.

2. **Zero hallucinations.** The model never fabricated a card that wasn't in the photo. This meets the "zero fabricated cards" threshold.

3. **Spatial awareness exists but needs prompt engineering.** The "pile grouping" prompt failed — the model listed each card individually. However, the bounding box prompt produced coordinates that correctly encode card positions relative to each other (consistent x-progression within rows, distinct y-ranges between rows). The model understands where cards are; it just didn't group them as requested.

4. **JSON output is reliable.** All 3 runs produced valid, parseable JSON. Schemas were followed except for the bounding box normalization detail.

5. **Performance is practical for desktop use.** 4–6 seconds per image on M3 Max. Generation speed is ~172 tokens/second. Model loads in ~2 seconds after first run.

## Limitations of This Evaluation

- **Single image tested.** Only the controlled top-down photo was evaluated. Accuracy under angled, low-light, or arm's-length conditions is unknown.
- **Printed text only.** Go Wish cards have clean printed text. Handwritten text (sticky notes, whiteboard) was not tested.
- **No pile separation in test image.** The 2×5 grid layout doesn't test the model's ability to distinguish between discrete piles of cards, which is the actual facilitator use case.
- **Desktop only.** Performance and accuracy on mobile (iPhone via llama.rn) are untested. Memory constraints on-device may require further quantization.

## Go/No-Go Decision

**Decision: PASS — proceed to Phase 2 (on-device validation)**

**Rationale:** Card text reading (100%) exceeds the 80% threshold. Hallucination count (0) meets the zero-tolerance threshold. Per the evaluation framework, these are the two primary pass criteria. JSON validity is confirmed. Spatial grouping failed on this prompt/image combination but bounding box evidence suggests the underlying capability exists.

**Next steps for Phase 2:**
- Test with Expo + llama.rn on iPhone 17 Pro
- Measure latency and memory under iOS constraints
- Test with angled/realistic photographs taken by phone camera
- Test pile-separated card layouts to evaluate spatial grouping
- Evaluate handwritten text if extending beyond Go Wish cards

**Risks for Phase 2:**
- Q4_K_M quantization may be too large for on-device memory; may need Q3_K or IQ2 quantization with unknown accuracy impact
- Phone camera photos will be lower quality / different perspective than this controlled test
- llama.rn may not support Qwen3-VL's vision projector architecture yet
