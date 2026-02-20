# Design: On-Device Co-Design Element Detection — Spike

**Date:** 2026-02-20
**Status:** Approved

---

## The Problem

Co-design sessions in healthcare settings produce physical artifacts — cards, sticky notes, 3D objects, drawings arranged on tables. Researchers currently have no systematic way to extract structured data from photographs of these sessions. Manual transcription is slow, error-prone, and doesn't scale.

The independent study asks: can a privacy-preserving, on-device computer vision system photograph a co-design session and produce structured data describing what elements are present, what text they contain, and how they're spatially grouped?

## Forces Shaping the Architecture

### Privacy
This system operates in healthcare contexts (end-of-life care). Patient data cannot leave the device via cloud APIs. The architectural solution: all inference runs on-device. Photos are captured with anonymous session IDs only — the linkage between session ID and patient identity lives in the institution's existing research data system (REDCap, etc.), never on the phone. Photos are de-identified at the point of creation, not anonymized after the fact. Under PHIPA and TCPS 2, de-identified data has minimal restrictions, which sidesteps transfer compliance concerns entirely.

### Compute
iPhone 17 Pro (A19 Pro, 12GB RAM) is the target device. iOS limits app memory to ~6-8GB. This rules out large VLMs (Llama 3.2 Vision 11B needs ~10-12GB). Viable on-device VLMs include Qwen3-VL-2B (~3GB runtime), Moondream 2B (~2.4GB), and SmolVLM (<1GB). The spike tests Qwen3-VL-2B based on its strong OCR benchmarks and dynamic resolution handling.

### UX / Session Flow
Four behavioral scenarios (documented in the brainstorm session) establish that the person conducting the co-design session needs near-zero-friction capture. The facilitator may be mid-conversation, out of the room, managing multiple participants, or physically placing cards on behalf of a bed-bound patient. The capture device must be simple enough for any of these contexts.

### Generalization
The first test case (Go Wish card game: 36 printed cards, 3 spatial piles) is constrained and well-defined. The real goal is a reusable component library that handles unstructured co-design sessions — handwritten sticky notes, 3D objects, drawings, unknown element types. The architecture must not be coupled to Go Wish.

## Component Library Architecture (Target State)

The system decomposes into capability interfaces, not model-specific implementations:

```
Capture (phone camera)
    │
    ▼
extractText(image) → [{text, boundingBox}]
detectElements(image) → [{type, boundingBox}]
mapSpatialGroups(elements) → [{group, elements}]
    │
    ▼
De-identified structured JSON output
```

Each capability can have multiple providers:
- **Qwen3-VL-2B** — general VLM, handles all three capabilities, best generalization
- **Apple Vision framework** — built-in OCR (printed + handwritten), fast, free
- **Dedicated models** — YOLO for detection, specialized OCR models, etc.

The spike tests one provider (Qwen3-VL-2B) on the constrained case to establish a baseline before building any abstractions.

## Three Architectural Approaches (Ranked)

These emerged from research and are documented for context. The spike tests Approach 2.

### 1. Apple Vision + text LLM hybrid (recommended for production)
Apple Vision OCR + rectangle detection handles perception. A small text-only LLM structures the output. ~95% expected accuracy on Go Wish, ~2GB memory. Strongest for known element types with printed text.

### 2. Single VLM (best generalization) — **spike target**
Qwen3-VL-2B processes the raw photo end-to-end. Handles unknown artifact types without per-element-type training. ~60-80% expected end-to-end accuracy, ~3GB memory. This is the approach the spike validates.

### 3. YOLO + OCR + LLM pipeline (highest accuracy, no generalization)
Fine-tuned object detection, only works for trained artifact types. Highest accuracy on known elements, zero capability on unknown ones. Not suitable for the general co-design use case.

**Biggest cross-cutting risk:** Handwritten text on sticky notes. No on-device model handles messy handwriting reliably. The plan is human-in-the-loop correction regardless of approach.

## The Spike: Desktop Model Test

### What it answers

1. Can Qwen3-VL-2B read the text on Go Wish cards from a table-distance photograph?
2. Can it return spatially-aware structured JSON (card text + approximate positions)?
3. Where does it fail — what can't it see or gets wrong?

Question 4 (on-device latency) is deferred to Phase 2, which only happens if Phase 1 passes.

### Setup

- **Model:** Qwen3-VL-2B via llama-mtmd-cli (already installed)
- **Files:** `Qwen3VL-2B-Instruct-Q4_K_M.gguf` + `mmproj-Qwen3VL-2B-Instruct-F16.gguf` from `Qwen/Qwen3-VL-2B-Instruct-GGUF` on HuggingFace (~2.1GB total)
- **Test image:** A photograph of Go Wish cards laid out on a table (Jesse to provide)
- **Location:** `courses/independent-study-1/assignment-1/_code.nosync/`

### Test prompts

**Run 1 — Card reading + spatial grouping:**
> Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON.

Schema:
```json
{
  "piles": [
    {
      "label": "string (left/center/right or descriptive)",
      "cards": ["card text 1", "card text 2"]
    }
  ]
}
```

**Run 2 — Spatial coordinates:**
> Detect every card visible in this photo. For each card, return the text content and bounding box coordinates (x_min, y_min, x_max, y_max as 0-1 normalized). Return JSON.

### Evaluation criteria

- How many cards correctly read? (out of total visible)
- Does it correctly group cards by spatial pile?
- Does it hallucinate cards that aren't there?
- Does it return valid JSON?

### What we don't build

- No React Native app
- No component abstractions
- No JSON schema validation
- No test harness

## What's Next (After the Spike)

### If the spike passes (model reads cards, returns usable spatial JSON)

**Phase 2: On-device validation**
Minimal Expo + llama.rn app on iPhone 17 Pro. One screen, one button. Answers the latency question and tests with real camera photos (varying angles, lighting, distances).

**Phase 3: Component interface design**
Define the three capability interfaces (`extractText`, `detectElements`, `mapSpatialGroups`). Implement Qwen3-VL-2B as the first provider. Design the interfaces so Apple Vision and other providers can be plugged in later without rewiring.

**Phase 4: Expand beyond Go Wish**
Test with unstructured co-design artifacts — sticky notes, mixed media, handwritten text. This is where the model's limits become real and the hybrid approach (Apple Vision for OCR + VLM for scene understanding) likely becomes necessary.

**Phase 5: Session management + aggregation**
Multi-participant session tracking, per-participant data grouping, cross-participant aggregation. De-identified session IDs linked to institutional research systems.

### If the spike fails (model can't read cards reliably)

Pivot to Approach 1 (Apple Vision + text LLM hybrid) for Go Wish specifically. Use Apple Vision's OCR for text extraction and rectangle detection for card localization. Small text-only LLM (Qwen3 0.6B or similar) structures the output into JSON. Re-evaluate the single-VLM approach as on-device models improve.

### Month-level mapping (independent study timeline)

| Month | Focus | Spike relevance |
|---|---|---|
| **Month 1** (current) | Technical setup, model evaluation | The spike is the core Month 1 deliverable |
| **Month 2** | Element library development | Phases 3-4: capability interfaces, expand beyond Go Wish |
| **Month 3** | Validation & case study | Phase 5: session management, end-to-end test with co-design scenario |
