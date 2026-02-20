# RtD Decomposition: On-Device Co-Design Element Detection — Spike

## Wicked Problem Framing

### Current state
Co-design sessions in healthcare produce physical artifacts that encode participant knowledge — card sorts, sticky note clusters, spatial arrangements on tables. This knowledge is currently lost or severely reduced when researchers manually transcribe results. In end-of-life care contexts, the sensitivity of the content and Canadian privacy law (PHIPA, TCPS 2) prohibit cloud-based CV tools, trapping researchers between rich physical data and inadequate digital capture.

### Preferred state
A system that makes the implicit knowledge encoded in physical co-design arrangements computationally accessible — structured, queryable, aggregatable — without sacrificing the qualities that make physical artifacts valuable (tangibility, spatial expressiveness, participant ownership of the arrangement) and without compromising patient privacy.

### What makes this wicked

**Privacy vs. capability.** The strongest vision models cannot run on a phone. The models that can run on a phone may not be accurate enough. The constraint is non-negotiable (healthcare privacy) but the technology is immature.

**Constrained vs. general.** Go Wish is well-defined: 36 known cards, 3 categories, printed text. Real co-design is messy, emergent, undefined. A system optimized for Go Wish may teach nothing about the general case — but the general case is too unconstrained to start with.

**Capture vs. facilitation.** The person in the room is having a sensitive conversation about end-of-life values. Any capture mechanism competes for emotional and cognitive attention. The four behavioral scenarios (guided sort, private sort, ward round, bed-bound) each frame this tension differently.

**Structured data vs. rich context.** A JSON output of card values loses the emotional context — which cards prompted stories, which caused hesitation, which were placed quickly. Is structured data actually what researchers need, or is it a proxy for something deeper?

**Participant agency.** Sanders frames co-design participants as "experts of their experience." A CV system that silently watches and extracts data could shift the power dynamic back toward researcher-as-observer — exactly the misfit Sanders diagnoses. The system itself has not been co-designed with the people it serves.

---

## Process Lens

### What's described
The design document specifies a technical spike: download a quantized VLM (Qwen3-VL-2B), run it via llama-mtmd-cli on a Mac, feed it a photograph of Go Wish cards, evaluate the JSON output against four criteria (card reading accuracy, spatial grouping, hallucination, valid JSON). Two test prompts are defined with specified JSON schemas. A go/no-go decision gates whether to proceed to on-device testing.

### Gaps

**P1: No pass/fail threshold.** The evaluation asks "how many cards correctly read?" but defines no threshold. Is 50% a pass? 80%? 100%? Without a threshold, the spike produces an observation, not a decision. The go/no-go gate is subjective.

**P2: Single test image, no variation protocol.** One photograph does not test for the conditions that matter: varying lighting, camera angle, number of visible cards, card overlap, table surface texture, distance from table. The spike could pass on a favorable image and fail under real-world conditions.

**P3: No prompt iteration protocol.** Two prompts are defined, but no rationale for these specific phrasings. No plan for what happens if the first prompts produce poor results — is prompt engineering in scope? How many iterations before declaring failure?

**P4: Model selection rationale is incomplete for reproduction.** Qwen3-VL-2B was selected based on OCR benchmarks and dynamic resolution, but the design doc doesn't document what alternatives were evaluated or why they were rejected. The brainstorm session explored Moondream 2B, SmolVLM, Llama 3.2 Vision 11B (rejected for memory), and Apple Vision. This evaluation chain is undocumented.

**P5: No failure diagnosis protocol.** "Where does it fail?" is a question, not a method. If a card is misread, is it a text recognition failure, a spatial reasoning failure, a prompt comprehension failure, or a quantization artifact? Without diagnostic categories, failures produce "it didn't work" rather than actionable knowledge.

**P6: Behavioral scenarios are disconnected from test design.** Four interaction scenarios were developed (guided sort, private sort, ward round, bed-bound). None of them are reflected in the spike's test conditions. The spike tests controlled desktop inference — a best-case scenario that no real session will match.

### Tasks

- **T-P1:** Define pass/fail thresholds for each evaluation criterion before running the spike. Propose: ≥80% of visible cards correctly read, ≥70% correctly grouped by pile, zero hallucinated cards, valid JSON in ≥2 of 3 runs. [Addresses P1]
- **T-P2:** Collect or create a minimum of 3 test images with controlled variation: (a) well-lit, top-down, cards clearly separated; (b) angled shot, some partial occlusion; (c) lower lighting or busy table surface. Document the conditions of each. [Addresses P2]
- **T-P3:** After running the two defined prompts, allow up to 3 prompt variations per run if initial results are poor. Document each variation and its effect. Declare failure only after 5 total prompt attempts per image. [Addresses P3]
- **T-P4:** Add a "Model Selection" section to the spike results documenting models considered, evaluation criteria, and reasons for selection/rejection. Reference the brainstorm session research. [Addresses P4]
- **T-P5:** Create a failure taxonomy before running the spike: (a) OCR error — wrong text; (b) detection miss — card not found; (c) spatial error — card assigned to wrong group; (d) hallucination — card fabricated; (e) format error — invalid JSON. Classify every error against this taxonomy. [Addresses P5]
- **T-P6:** After the controlled desktop test, run at least one test with a photo taken from a realistic angle and distance (arm's length, slight angle, as if a facilitator snapped it quickly). Note how results differ from the controlled test. [Addresses P6]

### Reflection checkpoint
Before running the spike: Am I testing the model's capability, or am I testing my ability to create favorable conditions for the model? If the spike only passes under controlled conditions, what does that tell me about real-world viability?

---

## Invention Lens

### What's novel
The design proposes a specific integration:

- **Theory:** Sanders & Stappers' co-design framework — participants as experts of their experience, producing visual artifacts that encode knowledge extractable only from the artifacts themselves (not from interviews alone)
- **Technology:** On-device VLMs (Qwen3-VL-2B via llama.cpp) capable of general scene understanding without per-element-type training
- **User need:** Facilitators in sensitive healthcare contexts need zero-friction capture; researchers need structured, analyzable data
- **Context:** Canadian healthcare privacy law requires on-device processing; end-of-life care contexts demand particular sensitivity

The core novelty claim: a VLM's general scene understanding can process co-design artifacts WITHOUT pre-training on specific element types, enabling a system that generalizes across co-design contexts rather than requiring a custom model per toolkit. This is the distinction between Approach 2 (spike target) and Approach 3 (YOLO pipeline).

A secondary novelty: the de-identification-by-design privacy architecture — photos are de-identified at creation, not anonymized after the fact — as a reusable pattern for health research capture tools.

### Gaps

**I1: No prior work survey.** The design doc assumes no existing CV tools for co-design sessions. Is this true? Adjacent systems exist: whiteboard transcription (Miro, Microsoft Whiteboard OCR), sticky note digitization (Post-it App, Stattys), meeting capture tools. Are there published systems for co-design specifically? Without positioning, the novelty claim is unsupported.

**I2: The capability decomposition is asserted, not derived.** extractText, detectElements, and mapSpatialGroups are reasonable CV task categories, but were they derived from analysis of what co-design artifacts actually look like? Sanders' generative tools produce collages, layered compositions, 3D arrangements, and drawn annotations. Does a three-function decomposition capture the full range, or is it biased toward the card-sorting case?

**I3: The generalization claim isn't tested by the spike.** The spike tests Go Wish — known cards, printed text, three piles. This tests OCR and basic spatial reasoning, not the novel claim that a VLM can handle unknown element types. The core invention is deferred to Phase 4.

**I4: De-identification-by-design is a contribution but isn't framed as one.** The insight that session photos should never contain PHI in the first place (rather than collecting PHI and stripping it) is a genuine design pattern for health research tools. The design doc treats it as an implementation detail rather than a knowledge contribution.

### Tasks

- **T-I1:** Conduct a brief prior work search: (a) CV tools for co-design or participatory design sessions; (b) sticky note / card digitization tools and their limitations; (c) on-device CV for health research contexts. Document findings as a "Related Work" section. Aim for 5-10 relevant references. [Addresses I1]
- **T-I2:** After the spike, analyze whether the three capability interfaces (extractText, detectElements, mapSpatialGroups) are sufficient by listing 5 co-design artifact types from Sanders Figures 4-6 and checking whether each can be decomposed into these three operations. Document gaps where the decomposition fails. [Addresses I2]
- **T-I3:** Include one non-Go-Wish test image in the spike — even a crude one (sticky notes on a table, handwritten text). This gives early signal on generalization without deferring the core question entirely. [Addresses I3]
- **T-I4:** Document the de-identification-by-design pattern as a standalone design decision note: the problem it solves, the alternatives considered (collect-then-anonymize, on-device anonymization), and why creation-time de-identification is preferable under PHIPA/TCPS 2. [Addresses I4]

### Reflection checkpoint
Before claiming novelty: Is the VLM-as-generalizer actually novel, or is it the obvious application of a general-purpose model to a specific domain? The novelty may lie not in the technology choice but in the integration — the privacy architecture, the capability decomposition, the connection to co-design theory. Where exactly is the contribution?

---

## Relevance Lens

### What's grounded
The system addresses a real domain (end-of-life care co-design), is constrained by real regulations (PHIPA, TCPS 2), and uses a validated real-world tool as its first test case (Go Wish, Lankarani-Fard et al. 2010). The four behavioral scenarios ground the UX design in plausible clinical interactions.

### Gaps

**R1: No stakeholder input beyond the advisor.** Dr. Sellen defined the project scope and assigned readings. But the design doc does not reference conversations with co-design facilitators, palliative care clinicians, health research ethics officers, or patients about whether this system addresses a real pain point. The preferred state is the designer's projection, not a documented need.

**R2: "Structured JSON" is the researcher's need, not the facilitator's.** The behavioral scenarios focus on the facilitator's experience (near-zero-friction capture). The spike's output (JSON) serves the researcher's analysis need. The facilitator gets nothing from the system during the session — no feedback, no confirmation, no value. There is an unexamined gap between the capture experience (facilitator's domain) and the analysis output (researcher's domain).

**R3: No argument against simpler alternatives.** Why not a spreadsheet? Why not the existing Go Wish Online digital version (which already produces structured output)? Why not audio recording + manual coding? The design doc doesn't argue that the CV approach is preferable to these alternatives — it assumes the approach is worth pursuing because it was assigned.

**R4: The privacy architecture is reasoned but unvalidated.** The PHIPA/TCPS 2 analysis is sound in principle. But has a real REB (Research Ethics Board) reviewed this architecture? REBs often raise concerns that designers don't anticipate — especially around photographic data in clinical settings, even de-identified.

**R5: The preferred state doesn't address what happens to the data.** Structured JSON is produced. Then what? Who uses it? How does it feed back into the co-design process or into clinical practice? The system captures and extracts but the design doc doesn't trace the data through to impact.

### Tasks

- **T-R1:** Before Phase 2, conduct 1-2 informal conversations with co-design facilitators or palliative care researchers. Ask: How do you currently capture session data? What do you lose? Would structured output from photos be useful? Document responses. [Addresses R1]
- **T-R2:** In the spike results, explicitly name who the output serves and who it doesn't. Acknowledge the facilitator gets no in-session value. Consider whether Phase 2 (on-device app) should include minimal facilitator feedback (e.g., "photo captured, N cards detected"). [Addresses R2]
- **T-R3:** Add a "Why not simpler alternatives?" section to the design doc. Argue specifically against: (a) Go Wish Online (already digital — but doesn't handle physical sessions or non-Go-Wish tools); (b) manual spreadsheet entry (slow, error-prone, but zero tech risk); (c) audio + manual coding (captures context but doesn't scale). [Addresses R3]
- **T-R4:** Before Phase 3 (component interfaces), consult with the university's REB or a privacy officer about the de-identification-by-design architecture. Document their feedback, even if informal. [Addresses R4]
- **T-R5:** In the spike results, sketch the data journey: photo → JSON → [what?]. Identify the first concrete research question that the structured data could answer, and frame Phase 5 (aggregation) around that question. [Addresses R5]

### Reflection checkpoint
Before building beyond the spike: Am I solving a problem that co-design researchers actually have, or am I solving a technically interesting problem and assuming it's relevant? What evidence do I have beyond the assignment brief?

---

## Extensibility Lens

### What's extensible
The capability interface design (extractText, detectElements, mapSpatialGroups with swappable providers) is explicitly built for extensibility. The three architectural approaches are documented with trade-offs, enabling future developers to choose based on their constraints. The privacy architecture (de-identification by design) is described generally enough to transfer to other health research tools.

### Gaps

**E1: The spike produces a signal, not transferable knowledge.** If the spike passes, the community learns "Qwen3-VL-2B can read printed cards." That's not a contribution. The failure modes, prompt engineering insights, accuracy data across conditions, and diagnostic analysis — those would be contributions. But the spike doesn't plan to capture them in a shareable format.

**E2: No prompt documentation plan.** Which prompts work for which artifact types? What phrasings cause hallucination? What context in the system prompt improves spatial reasoning? This is exactly the practical knowledge other researchers need. The spike defines two prompts but has no plan to document why they work or don't in a reusable format.

**E3: Capability interfaces are described but not formalized.** extractText, detectElements, mapSpatialGroups — what are the type signatures? What are the contracts? What does a provider need to implement? Without formalization, another developer cannot implement a new provider without reading the reference implementation.

**E4: Behavioral scenarios are undocumented as reusable patterns.** The four Go Wish interaction scenarios (guided sort, private sort, ward round, bed-bound) are design knowledge reusable by anyone building health research capture tools. They currently exist only in the brainstorm conversation transcript.

**E5: No plan for sharing integration findings.** If llama.rn + Qwen3-VL-2B has specific gotchas (the use_gpu: false iOS issue was already discovered), these findings help the llama.rn and Qwen communities. No plan to contribute them back.

### Tasks

- **T-E1:** Write spike results as a structured evaluation report, not just "it passed." Include: model, quantization, test conditions, per-image results, accuracy metrics, failure taxonomy breakdown, prompt variations tested. Format it so another researcher could replicate the evaluation with a different model. [Addresses E1]
- **T-E2:** Maintain a prompt log during the spike: every prompt attempted, the conditions, and the result quality. After the spike, distill this into a "prompt patterns" document — what works, what doesn't, hypotheses about why. [Addresses E2]
- **T-E3:** Before Phase 3, define capability interfaces as TypeScript types (since the target is React Native). Include input types, output types, error types, and a description of the contract each provider must satisfy. This is a 30-minute task that makes the architecture concrete. [Addresses E3]
- **T-E4:** Document the four behavioral scenarios as a standalone design artifact (concept note or appendix to the design doc) with the format: context, actors, trigger, flow, design tensions. These are reusable beyond this project. [Addresses E4]
- **T-E5:** If integration issues are discovered during Phase 2 (llama.rn + Qwen3-VL-2B on iOS), file issues or discussion posts on the relevant GitHub repos. [Addresses E5]

### Reflection checkpoint
Before moving past the spike: Am I producing knowledge that dies with this project, or knowledge that others can build on? What would a researcher starting a similar project in a different healthcare domain need from my work?

---

## Implementation Phases

### Phase 0: Spike Preparation
**Tasks:**
- T-P1: Define pass/fail thresholds [Process]
- T-P5: Create failure taxonomy [Process]
- T-P2: Collect 3 test images with controlled variation [Process]
- T-I3: Include one non-Go-Wish test image [Invention]

**Knowledge produced:** Evaluation framework — a reusable protocol for testing on-device VLMs against co-design capture tasks. This is methodological knowledge.

**Knowledge consumed:** Model capability research from the brainstorm session (benchmark data, memory constraints, quantization trade-offs). Go Wish card values from Lankarani-Fard et al. (2010) Table 2 as ground truth.

**Feeds back to:** Design practitioners (evaluation protocol for edge ML in research tools), engineers (which metrics matter for this task class).

**Reflection checkpoint:** Do my test images and thresholds reflect real-world conditions, or am I setting up the spike to pass?

---

### Phase 1: Desktop Spike Execution
**Tasks:**
- Run spike as designed (2 prompts × 3+ images)
- T-P3: Allow prompt iteration, document variations [Process]
- T-P6: Include one realistic-angle photo [Process]
- T-E1: Write structured evaluation report [Extensibility]
- T-E2: Maintain prompt log [Extensibility]

**Knowledge produced:** Empirical data on Qwen3-VL-2B's capabilities for co-design artifact detection. Failure taxonomy populated with real examples. Prompt patterns for spatial-aware structured extraction from tabletop photographs.

**Knowledge consumed:** Evaluation framework from Phase 0. Qwen3-VL-2B model via llama-mtmd-cli.

**Feeds back to:** Engineers (model selection data, prompt patterns), behavioral scientists (what information is capturable vs. lost in the photo→JSON pipeline), the llama.rn/Qwen community (model capability data on a novel task).

**Reflection checkpoint:** What did the failures teach me? Do they point to fundamental model limitations or addressable issues (better prompts, better photos, different quantization)?

---

### Phase 1.5: Positioning and Grounding
**Tasks:**
- T-I1: Prior work search [Invention]
- T-R3: "Why not simpler alternatives?" argument [Relevance]
- T-P4: Document model selection rationale [Process]
- T-I4: Document de-identification-by-design as a standalone pattern [Invention]
- T-E4: Document behavioral scenarios as reusable design patterns [Extensibility]
- T-R2: Name who the output serves vs. who it doesn't [Relevance]
- T-R5: Sketch the data journey beyond JSON output [Relevance]

**Knowledge produced:** Literature positioning — where this work sits relative to existing tools (Post-it App, Miro OCR, Go Wish Online) and why the on-device VLM approach addresses gaps they don't. A reusable privacy pattern. Reusable interaction scenarios for health research capture.

**Knowledge consumed:** Spike results from Phase 1. Sanders & Stappers (2008) and Lankarani-Fard (2010). Design brainstorm documentation.

**Feeds back to:** The research community (novel framing and literature positioning), design practitioners (behavioral scenarios as patterns, privacy pattern), the independent study report (arguments for relevance).

**Reflection checkpoint:** Can I now articulate — in two sentences — what this project contributes that didn't exist before? If not, what's missing?

---

### Phase 2: On-Device Validation (contingent on Phase 1 pass)
**Tasks:**
- Minimal Expo + llama.rn app on iPhone 17 Pro [from design doc]
- T-R1: 1-2 conversations with co-design facilitators or palliative care researchers [Relevance]
- T-E5: File integration issues on GitHub repos if discovered [Extensibility]
- Measure latency, evaluate with real camera photos [from design doc]

**Knowledge produced:** On-device feasibility data (latency, memory, thermal). Stakeholder input on whether the system addresses a real need. Integration knowledge for llama.rn + Qwen3-VL-2B on iOS.

**Knowledge consumed:** Spike results and prompt patterns from Phase 1. Known iOS gotchas (use_gpu: false).

**Feeds back to:** Engineers (on-device performance data, integration gotchas), design practitioners (stakeholder responses to the concept), the llama.rn community (real-world integration report).

**Reflection checkpoint:** Do the facilitators I spoke with recognize the problem I'm solving? Did latency on-device change what's feasible in the interaction scenarios?

---

### Phase 3: Component Interface Design (Month 2)
**Tasks:**
- T-E3: Define capability interfaces as TypeScript types [Extensibility]
- T-I2: Validate three-function decomposition against 5 co-design artifact types from Sanders [Invention]
- T-R4: Consult REB/privacy officer on de-identification architecture [Relevance]
- Implement Qwen3-VL-2B as first provider [from design doc]

**Knowledge produced:** A formalized, extensible interface design for co-design artifact detection — the core architectural contribution. Validation (or revision) of the capability decomposition against diverse artifact types. REB feedback on the privacy architecture.

**Knowledge consumed:** Phase 1 spike data (what the model can and can't do). Phase 1.5 literature positioning. Sanders Figures 4-6 as artifact type exemplars.

**Feeds back to:** Engineers (interface contracts for building new providers), design practitioners (a framework for thinking about co-design data capture), the research community (a formalised architecture for privacy-preserving participatory design tools).

**Reflection checkpoint:** Does the interface design accommodate the messiest co-design scenario I can imagine, or only the structured ones? What would Sanders say about reducing creative artifacts to three extraction functions?
