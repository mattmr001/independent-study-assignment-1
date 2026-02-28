# Phase 4: Co-Design Pipeline Application Design

## Context

Phases 1-3 proved Qwen3-VL-2B runs on-device via llama.rn on iPhone, handles camera capture, and returns structured JSON in ~12 seconds. Phase 4 builds a real application on top of that foundation using the tracer bullet pattern — one thin end-to-end slice through the whole system, starting with Go Wish cards.

The spike code is preserved in `qwen-spike-mobile/` with a git tag `spike-complete`. Phase 4 lives in `phase4/`.

## Core Architecture: Processing Pipeline with Pluggable Strategies

The application follows a fixed pipeline that generalizes across co-design contexts:

```
Instrument → Participant → Session → Capture → Process → Store → Display
```

Each co-design context (Go Wish, sticky notes, etc.) provides its own configuration for what the instrument is, what participant data to collect, how to process captures, and what results look like. The pipeline stays the same.

### Domain Model

Two structural decisions shape the model:

1. **Protocol separated from Study** (config vs runtime). A Protocol is a static, reusable configuration. A Study is a runtime container that references a Protocol and accumulates data.

2. **Decoupled analysis.** Captures are raw and immutable. Analysis is a separate, repeatable operation. This allows reprocessing captures with improved prompts or strategies without re-photographing.

```
Protocol (static, reusable)
├── Instrument(s) — reference material for the activity
├── Participant Schema — what demographics to collect
├── Available Strategies — how captures can be processed
├── Result Schema — what the output looks like

Study (runtime)
├── uses → Protocol
├── has many → Participants (coded IDs: P001, P002)
├── has many → Sessions
│                 ├── links → Participant
│                 ├── has many → Captures (raw, immutable)
│                 └── has many → Analyses
│                                  ├── uses → Strategy
│                                  ├── references → Capture (one per analysis)
│                                  └── produces → Results
```

### Why This Shape

**Pipeline with pluggable strategies** rather than a monolithic app. The overall flow is fixed. Strategy points at Capture, Process, and Analyze allow different algorithms per co-design context. This is Template Method + Strategy in practice.

**Protocol vs Study separation** prevents the Study from becoming a god object that holds both configuration and runtime data. Protocols can be templated and reused.

**Decoupled analysis** is critical because the CV pipeline is actively being iterated. Prompt changes and model updates dramatically affect output quality (proven in Phase 3 — image resizing alone changed results from garbage to 100% accuracy). Being able to reprocess old captures is a research necessity, not a nice-to-have.

## Tech Stack

| Component | Choice | Rationale |
|---|---|---|
| Framework | Expo + React Native | Continuity from spike |
| Architecture | React layered (Presentation/Domain/Data) | Testable, separates concerns |
| State | Redux Toolkit + RTK Query | Predictable state for complex domain |
| Styling | NativeWind (Tailwind) | Greyscale palette, proof of concept |
| Components | Storybook | Visual smoke tests, minimal stories |
| Typography | Custom font | TBD |
| Inference | llama.rn | Carried from spike |
| Storage | On-device only | Privacy compliance |

## Privacy & Compliance

All data stays on-device. Ontario health privacy compliance (PHIPA/PIPEDA):

- Local-only storage, UUIDs for all entities
- No network sync, no cloud
- Data export via cable only
- Participants are coded (P001, P002), no names or identifying information beyond protocol-defined demographics

## Redux Slices

Seven domain slices mapping to the pipeline:

```
protocols/       — static config (instrument, schemas, strategies)
studies/         — runtime container, references a protocol
participants/    — scoped to a study, coded IDs
sessions/        — scoped to a study, links participant
captures/        — scoped to a session, raw + immutable
analyses/        — scoped to a session, repeatable, references one capture
results/         — scoped to an analysis
```

## Directory Structure

```
phase4/
├── src/
│   ├── domain/                    # Domain layer — Redux slices + types
│   │   ├── protocols/
│   │   │   ├── slice.ts
│   │   │   └── types.ts
│   │   ├── studies/
│   │   ├── participants/
│   │   ├── sessions/
│   │   ├── captures/
│   │   ├── analyses/
│   │   └── results/
│   │
│   ├── data/                      # Data layer — persistence + services
│   │   ├── store.ts
│   │   ├── persistence/           # On-device storage
│   │   └── inference/             # llama.rn service
│   │
│   ├── presentation/              # Presentation layer — screens + components
│   │   ├── screens/
│   │   │   ├── StudyScreen/
│   │   │   │   ├── index.tsx
│   │   │   │   └── StudyScreen.stories.tsx
│   │   │   ├── SessionScreen/
│   │   │   ├── CaptureScreen/
│   │   │   └── ResultsScreen/
│   │   ├── components/
│   │   │   ├── ParticipantForm/
│   │   │   │   ├── index.tsx
│   │   │   │   └── ParticipantForm.stories.tsx
│   │   │   ├── CapturePreview/
│   │   │   └── ResultCard/
│   │   └── theme/
│   │       ├── fonts.ts
│   │       └── colors.ts          # Greyscale tokens
│   │
│   └── go-wish/                   # Go Wish tracer bullet config
│       ├── protocol.ts            # 36 cards, Sanders demographics, strategies
│       └── cardMatchingStrategy.ts
│
├── .storybook/
├── app.json
├── package.json
└── tsconfig.json
```

`src/go-wish/` is the only Go Wish-specific code. A future co-design context adds a sibling directory (e.g., `src/sticky-notes/`) with its own protocol and strategy.

## Tracer Bullet: Go Wish End-to-End

The thinnest path through the pipeline:

1. App loads Go Wish protocol (36 cards, Sanders demographics)
2. Create a study (Go Wish protocol hardcoded, only one exists)
3. Add a coded participant (P001) with dynamic form from protocol's participant schema + "add field" button
4. Start a session linking participant to study
5. Capture — camera takes one photo of Go Wish cards, saved as immutable capture
6. Analyze — card-matching strategy extracts text via llama.rn, matches against 36-card reference set
7. View results — checklist of which cards were selected, unmatched extractions shown for manual review

### Explicitly deferred

- Weight/frequency/provider-focus/patient-focus computation
- Cross-session aggregation (viewing results across all participants)
- Protocol creation UI (Go Wish is hardcoded)
- Multiple analyses comparison UI
- Multi-instrument sessions
- Color beyond greyscale
- Data sync or network features

## BDD Scenarios

### Scenario 1: Facilitator sets up a new study

```
GIVEN I open the app
WHEN I tap "New Study"
THEN I see the Go Wish protocol pre-selected
AND I can name my study
AND a study is created with a UUID, stored on-device
```

### Scenario 2: Facilitator registers a coded participant

```
GIVEN I have a study open
WHEN I tap "Add Participant"
THEN I see a form with fields from the Go Wish protocol
  (age, race, medical conditions, education, household income, self-assessed health)
AND the participant is assigned a coded ID (P001, P002, ...)
AND each field renders as the correct input type (number, select, multiselect)
WHEN I tap "Add Field"
THEN I can define a custom field name and type
WHEN I submit the form
THEN the participant is saved to this study
```

### Scenario 3: Facilitator runs a session

```
GIVEN I have a study with at least one participant
WHEN I tap "New Session"
THEN I select a participant from the study's participant list
AND a session is created with a timestamp
AND I'm taken to the capture screen
```

### Scenario 4: Facilitator captures Go Wish cards

```
GIVEN I'm on the capture screen
WHEN I tap "Take Photo"
THEN the camera opens
WHEN I take a photo
THEN the photo is saved as an immutable capture
AND I see a thumbnail preview
AND I can retake if the photo is unclear
```

One capture per analysis. Facilitator picks the best photo. If cards don't fit in one frame, multiple analyses per session is the future upgrade path (data model already supports it).

### Scenario 5: Facilitator runs analysis

```
GIVEN I have a session with a capture
WHEN I tap "Analyze"
THEN a generic progress indicator displays (~12 seconds)
AND the card-matching strategy runs against the capture
AND extracted texts are matched to the 36-card reference set
AND results are saved to the analysis
```

Unmatched extractions are shown in results for manual review. No algorithmic duplicate detection — researcher's responsibility.

### Scenario 6: Facilitator views results

```
GIVEN an analysis has completed
WHEN I view the results
THEN I see a checklist of matched Go Wish cards
AND I see any unmatched extractions flagged for review
```

## Storybook Approach

Each component in its own folder with a `.stories.tsx` file. Minimal stories — default state plus any obvious alternate states. Visual smoke test, not a test suite.

## Future Evolution

- **Second co-design context** → add `src/{context}/` with protocol + strategy, validates the abstraction
- **Multi-instrument sessions** → protocol supports multiple instruments, session selects which one
- **Protocol versioning** → when you need to update a protocol without breaking existing studies
- **Cross-session aggregation** → weight, frequency, focus computation across all participants
- **Cable export** → structured data export for analysis tools
