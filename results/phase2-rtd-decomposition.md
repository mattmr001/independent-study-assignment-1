# RtD Decomposition: Phase 2 — On-Device Mobile Spike

**Framework:** Zimmerman, Forlizzi, & Evenson (2007)
**Date:** 2026-02-21
**Artifact:** Qwen3-VL-2B running via llama.rn on iPhone 17

---

## Wicked Problem Framing

### Current State (what's broken)

Healthcare co-design sessions generate physical artifacts — Go Wish cards arranged in piles, sticky notes clustered on walls, hand-drawn journey maps. Currently, facilitators must manually transcribe these arrangements during or after sessions. This creates friction: real-time transcription diverts attention from participants; post-hoc transcription introduces recall errors and loses spatial context. Existing mobile OCR tools (Google Lens, Apple Live Text) can read individual text elements but cannot interpret *arrangements* — which pile a card belongs to, how sticky notes cluster into themes.

### Preferred State (what should the world look like)

A facilitator photographs physical artifacts mid-session. On-device inference interprets both the text *and* spatial arrangement — "these 5 cards form a pile near the top-left; these 3 cards cluster together." The facilitator gets structured data without breaking flow. No cloud upload (HIPAA-relevant), no specialized hardware, no technical expertise required beyond taking a photo.

### What Makes This Wicked

1. **Conflicting stakeholder needs:** Facilitators want minimal disruption; researchers want rich data capture; participants want their preferences accurately represented. Optimizing for one risks degrading another.

2. **Under-constrained accuracy thresholds:** What error rate is acceptable? A misread card preference in end-of-life care planning is not equivalent to a misread shopping list item. No established benchmarks exist.

3. **Context-dependent performance:** Healthcare settings vary wildly — fluorescent lighting vs. natural light, cramped hospital rooms vs. conference spaces, rushed sessions vs. unhurried workshops. Performance validated in one context may not transfer.

4. **Privacy/capability tradeoff:** On-device inference preserves privacy but constrains model size. Cloud inference enables larger models but introduces HIPAA complexity. Neither is obviously correct.

---

## Process Lens

### What Methods Are Described

The design document describes a **progressive de-risking spike process**:

1. **Phase 1 (desktop):** Validate accuracy in controlled conditions using command-line tools (llama-mtmd-cli), systematic prompts, and ground-truth test images
2. **Phase 2 (mobile):** Validate feasibility on target hardware (iPhone) without conflating accuracy and platform questions

This separation is methodologically sound — it isolates variables. If Phase 2 fails, the researcher knows the model works (Phase 1 proved it) and the problem is platform integration.

**Process artifacts produced:**
- Evaluation framework with pass criteria (80% accuracy, zero hallucinations)
- Error taxonomy (OCR, MISS, SPATIAL, HALLUC, FORMAT, PARTIAL)
- Structured test prompts (sanity check, spatial grouping, bounding boxes)
- Timing metrics (prompt eval, generation, total time, token counts)

### Gaps

**Gap P1:** The error taxonomy is invented for this project. No citation or derivation from established OCR or VLM evaluation literature. Another researcher could apply it, but couldn't assess whether it captures the right failure modes.

**Gap P2:** Test image selection is ad hoc. Why these two images (printed cards, handwritten notes)? What variations would stress-test the system? The rationale for image selection isn't documented.

**Gap P3:** The "80% accuracy" threshold appears without justification. Why 80% and not 70% or 90%? What stakeholder input or prior work informed this number?

**Gap P4:** Prompt engineering choices aren't documented. "Describe this image" was used for Phase 2 — but the spatial grouping and bounding box prompts from Phase 1 weren't validated on-device. Will they work?

### Tasks

| Task | Addresses Gap |
|------|---------------|
| P-1. Literature review of VLM evaluation taxonomies (POPE, CHAIR, object hallucination metrics) and map to proposed error taxonomy | P1 |
| P-2. Document test image selection criteria and create a test image matrix (lighting × angle × artifact type × text style) | P2 |
| P-3. Interview 2-3 co-design facilitators about acceptable error rates; document rationale for accuracy threshold | P3 |
| P-4. Re-run Phase 1 structured prompts (spatial grouping, bounding boxes) on-device and compare to desktop results | P4 |

### Reflection Checkpoint

Before proceeding: Can I explain to another researcher *why* I chose this evaluation approach over alternatives? If I can't articulate the rationale, the process isn't reproducible — only the steps are.

---

## Invention Lens

### What Is the Novel Integration

The work integrates:

1. **Theory:** Co-design methodology (Sanders, Stappers) + physical arrangement as meaning-carrier (affinity diagramming literature)
2. **Technology:** Quantized VLMs (Qwen3-VL-2B, Q4_K_M) + on-device inference runtime (llama.rn) + mobile hardware (iPhone Metal GPU)
3. **User Need:** Facilitators need artifact capture without session disruption
4. **Context:** Healthcare co-design where privacy matters and infrastructure can't be assumed

The novel claim: *Multimodal VLMs can now run on commodity phones at sufficient accuracy to interpret co-design artifacts, enabling a new class of in-situ design research tools.*

**Prior work this builds on:**
- llama.cpp and GGUF quantization (Gerganov, 2023+)
- Qwen-VL architecture (Bai et al., 2023)
- Co-design facilitation tools (various, limited digital tool literature)

**Departure from prior work:**
- Prior VLM-for-design work assumes cloud deployment
- Prior mobile OCR work reads text but not spatial arrangement
- Prior co-design capture tools (Miro, FigJam) require real-time digital input, not physical artifact interpretation

### Gaps

**Gap I1:** The claim "this enables a new class of tools" isn't demonstrated — only feasibility is proven. No tool was built; no facilitator used it.

**Gap I2:** Comparison to alternatives is missing. How does this compare to: (a) taking a photo and using GPT-4V via API, (b) training a custom lightweight model, (c) cloud-deployed Qwen3-VL with edge caching? The invention's advantages aren't argued against alternatives.

**Gap I3:** The vision projector (mmproj) adds 781MB — nearly as large as the model. Is this the only way to get multimodal capability? Are there smaller projectors or distilled alternatives?

### Tasks

| Task | Addresses Gap |
|------|---------------|
| I-1. Build a functional prototype that a facilitator can use in a real (or simulated) session | I1 |
| I-2. Create comparison table: on-device Qwen3-VL vs. cloud GPT-4V vs. Apple Vision framework — latency, cost, privacy, accuracy | I2 |
| I-3. Search for alternative vision projectors or distilled multimodal adapters; document size/accuracy tradeoffs | I3 |

### Reflection Checkpoint

Before proceeding: Is this actually novel, or am I describing obvious engineering? The integration must be non-trivial and produce new knowledge — not just "I got it to run." What did I learn that wasn't knowable before building this?

---

## Relevance Lens

### Is the Preferred State Articulated

Partially. The design document articulates the immediate goal (model runs on iPhone) but doesn't connect it to the preferred state (facilitators capture artifacts without disruption).

**Grounding in real-world data:**
- Go Wish cards are a real co-design tool used in end-of-life care planning
- The test images (printed cards, handwritten sticky notes) represent real artifact types
- iPhone 17 is a realistic facilitator device

**Missing grounding:**
- No facilitator has been observed or interviewed
- No actual co-design session has been observed
- Pass/fail criteria are researcher-defined, not stakeholder-validated

### Gaps

**Gap R1:** No field exposure. The work is entirely lab-validated. Real co-design sessions have interruptions, overlapping artifacts, poor lighting, time pressure — none of which are tested.

**Gap R2:** The "facilitator" persona is assumed, not researched. What devices do facilitators actually use? What's their technical comfort level? Would they trust on-device AI interpretation?

**Gap R3:** Handwriting in Phase 1 was "clean marker text." Real sticky notes have rushed handwriting, abbreviations, arrows, cross-outs. The relevance claim (handles co-design artifacts) outpaces the evidence.

**Gap R4:** The ~12-second inference time is reported but not evaluated. Is this fast enough? Too slow? Depends on workflow context that hasn't been studied.

### Tasks

| Task | Addresses Gap |
|------|---------------|
| R-1. Observe 1-2 real co-design sessions (any domain); photograph artifacts under real conditions | R1 |
| R-2. Interview 2-3 facilitators about current artifact capture practices, pain points, device preferences | R2 |
| R-3. Collect "messy" artifact images: rushed handwriting, overlapping cards, partially obscured text | R3 |
| R-4. With a facilitator, walk through the 12-second inference time in simulated workflow; assess fit | R4 |

### Reflection Checkpoint

Before proceeding: If a facilitator watched me use this prototype, would they say "yes, this solves my problem"? If I can't answer that question, I haven't established relevance — only technical feasibility.

---

## Extensibility Lens

### Can Others Build On This Work

**Process reproducibility:**
- The evaluation framework (error taxonomy, metrics) is documented and reusable
- The implementation plan is step-by-step with exact commands
- Technical issues encountered (Metro bundling limit, file:// path format, expo-file-system deprecation) are documented in the evaluation report

**Artifact documentation:**
- Code is committed to git with ABOUTME headers
- Model versions and quantization are specified
- Performance metrics are recorded

**Knowledge transfer potential:**
- Other researchers could adapt this for different artifact types (journey maps, card sorts, service blueprints)
- The llama.rn integration pattern could transfer to other VLMs
- The evaluation framework could become a standard for co-design artifact interpretation

### Gaps

**Gap E1:** No design pattern is extracted. The work produces a working spike but not transferable design knowledge. What's the "design space" here? What are the key parameters others should consider?

**Gap E2:** The code is a spike, not a template. No README explaining how to adapt for other models, other artifact types, or other devices.

**Gap E3:** The evaluation framework isn't published or citable. It exists only in this project's markdown files.

**Gap E4:** No failure case documentation. What prompts *don't* work? What image conditions cause failures? Negative knowledge is as valuable as positive.

### Tasks

| Task | Addresses Gap |
|------|---------------|
| E-1. Extract design pattern: "On-Device VLM for Physical Artifact Interpretation" with parameters (model size, quantization, context length, prompt strategy) | E1 |
| E-2. Write README with adaptation guide: how to swap models, change artifact types, target different devices | E2 |
| E-3. Format evaluation framework as standalone methodology document suitable for citation | E3 |
| E-4. Systematically test failure cases and document what breaks the system (image conditions, text styles, prompts) | E4 |

### Reflection Checkpoint

Before proceeding: If another researcher at a different university wanted to build a similar tool for *their* co-design context, what would they need to know? Have I documented that, or is the knowledge trapped in my head and commit history?

---

## Implementation Phases

### Phase 3A: Grounding (Relevance + Process)

**Tasks:**
- R-1. Observe 1-2 real co-design sessions
- R-2. Interview 2-3 facilitators
- P-3. Document rationale for accuracy threshold based on facilitator input

**Knowledge produced:**
- Empirical understanding of current artifact capture practices and pain points
- Stakeholder-validated accuracy requirements
- Real-world image conditions for testing

**Knowledge consumed:**
- Phase 1-2 technical feasibility (true)
- Co-design facilitation literature (how)
- Prior co-design tool adoption studies (real)

**Feeds back to:**
- Design practitioners: What problems actually need solving?
- Behavioral scientists: What workflow interruptions do facilitators experience?

**Reflection checkpoint:** Do facilitators actually want this? Or am I solving a problem that only looks important from a researcher's desk?

---

### Phase 3B: Stress Testing (Process + Relevance)

**Tasks:**
- P-2. Create test image matrix (lighting × angle × artifact type × text style)
- R-3. Collect "messy" artifact images
- P-4. Run structured prompts on-device
- E-4. Document failure cases

**Knowledge produced:**
- Boundary conditions for system reliability
- Negative knowledge (what breaks it)
- Accuracy under realistic conditions

**Knowledge consumed:**
- Phase 2 baseline performance metrics
- Real artifact images from Phase 3A
- Facilitator feedback on acceptable failure modes

**Feeds back to:**
- Engineers: What image preprocessing would help? What quantization tradeoffs matter?
- Design practitioners: What artifacts work, and what's out of scope?

**Reflection checkpoint:** Have I found the boundaries of this system, or am I only showing its successes?

---

### Phase 3C: Alternative Analysis (Invention)

**Tasks:**
- I-2. Compare on-device vs. cloud vs. hybrid approaches
- I-3. Explore alternative vision projectors
- P-1. Map error taxonomy to established VLM evaluation literature

**Knowledge produced:**
- Justified technology selection (why on-device, why this model, why this quantization)
- Positioning against state of the art
- Validated evaluation methodology

**Knowledge consumed:**
- VLM evaluation literature (POPE, CHAIR, etc.)
- Cloud API pricing and latency data
- Alternative model/projector options

**Feeds back to:**
- Research community: Reproducible evaluation methodology
- Engineers: Model selection guidance for similar applications

**Reflection checkpoint:** Can I defend my technology choices to a skeptical reviewer? Or did I just pick what I found first?

---

### Phase 3D: Functional Prototype (Invention + Extensibility)

**Tasks:**
- I-1. Build facilitator-usable prototype with camera capture
- R-4. Evaluate 12-second latency in simulated workflow
- E-2. Write adaptation README

**Knowledge produced:**
- Design exemplar (working prototype as research artifact)
- Workflow integration knowledge
- Reusable codebase for other researchers

**Knowledge consumed:**
- All prior phases
- Facilitator workflow requirements from Phase 3A
- Boundary conditions from Phase 3B

**Feeds back to:**
- Design practitioners: A tool they might actually use
- Engineers: Validated integration pattern
- Research community: Replicable prototype

**Reflection checkpoint:** Would a facilitator use this prototype unprompted, or only because I'm watching?

---

### Phase 3E: Pattern Extraction (Extensibility)

**Tasks:**
- E-1. Extract "On-Device VLM for Physical Artifact Interpretation" design pattern
- E-3. Format evaluation framework as citable methodology

**Knowledge produced:**
- Transferable design pattern
- Citable evaluation methodology
- Contribution to HCI design pattern literature

**Knowledge consumed:**
- All Phase 3 findings
- Design pattern literature (Gamma et al. style, or HCI pre-patterns per Zimmerman)

**Feeds back to:**
- Research community: Building blocks for future work
- Design practitioners: Pattern they can apply in their contexts

**Reflection checkpoint:** In 5 years, will anyone cite this work? What would they cite it for?

---

## Summary: What Phase 2 Proved and What Remains

**Phase 2 established:**
- ✅ Qwen3-VL-2B runs on iPhone 17 via llama.rn
- ✅ Model loads in <1 second
- ✅ Inference completes in ~12 seconds
- ✅ Metal GPU acceleration works
- ✅ The model interprets image content meaningfully

**Phase 2 did NOT establish:**
- ❓ Whether 12 seconds fits facilitator workflow
- ❓ Whether accuracy holds on real session images
- ❓ Whether facilitators want this tool
- ❓ Whether this approach is better than alternatives
- ❓ What conditions cause failures
- ❓ How to transfer this work to other researchers

The spike succeeded as a spike. The research-through-design contribution requires Phases 3A-3E.
