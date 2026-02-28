# Phase 4: Co-Design Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working Go Wish card-sorting capture and analysis app — one thin end-to-end tracer bullet through the co-design processing pipeline.

**Architecture:** React layered architecture (Presentation/Domain/Data) with Redux Toolkit for state management. Fixed processing pipeline (Instrument → Participant → Session → Capture → Process → Store → Display) with pluggable strategies per co-design context. Protocol (static config) separated from Study (runtime data). Captures are immutable; analyses are repeatable.

**Tech Stack:** Expo 54, React Native 0.81, TypeScript (strict), Redux Toolkit (createEntityAdapter), Expo Router v4, llama.rn, redux-persist + AsyncStorage, Jest + React Native Testing Library

**Design doc:** `docs/plans/2026-02-26-phase4-co-design-pipeline-design.md`

**Spike reference:** `qwen-spike-mobile/` (tag: `spike-complete`)

---

## Corrections to Design Doc

1. **createEntityAdapter, not RTK Query.** RTK Query is a server-state caching layer for API calls. This app has zero network calls — all data is local. `createEntityAdapter` provides the same normalized CRUD operations and memoized selectors without the network abstraction overhead.

2. **Expo Router for navigation.** Design doc doesn't specify. Expo Router v4 (file-based routing) is standard for Expo 54. Route files live in `app/`; shared components in `src/presentation/components/`. Replaces `src/presentation/screens/` from design doc.

3. **redux-persist + AsyncStorage for persistence.** Design doc says "on-device only" but doesn't name a library. This is the standard Redux persistence approach for React Native.

4. **Jest + RNTL for testing.** Design doc only mentions Storybook. TDD requires a real test framework. Domain logic: plain Jest. Presentation: React Native Testing Library.

5. **StyleSheet.create, not NativeWind.** For a greyscale proof-of-concept, NativeWind adds setup overhead without proportional benefit. Plain StyleSheet with color tokens achieves the same result. NativeWind can be added later if the design system grows.

6. **Inference service injected via thunk middleware.** The domain layer calls inference through Redux Toolkit's `extra` thunk argument. This keeps domain → data dependency clean and makes thunks testable with mock services.

---

## Directory Structure

```
phase4/
├── app/                                 # Expo Router routes (thin presentation)
│   ├── _layout.tsx                      # Root: Redux Provider + PersistGate
│   ├── index.tsx                        # Home: create study
│   └── study/
│       └── [studyId]/
│           ├── _layout.tsx              # Study context
│           ├── index.tsx                # Study detail: participants + sessions
│           ├── add-participant.tsx       # Participant form
│           └── session/
│               └── [sessionId]/
│                   ├── capture.tsx       # Camera capture
│                   └── results.tsx       # Analysis + results
├── src/
│   ├── domain/                          # Redux slices + types + selectors
│   │   ├── protocols/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   └── slice.test.ts
│   │   ├── studies/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   └── slice.test.ts
│   │   ├── participants/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   └── slice.test.ts
│   │   ├── sessions/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   └── slice.test.ts
│   │   ├── captures/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   └── slice.test.ts
│   │   ├── analyses/
│   │   │   ├── types.ts
│   │   │   ├── slice.ts
│   │   │   ├── slice.test.ts
│   │   │   ├── thunks.ts
│   │   │   └── thunks.test.ts
│   │   └── results/
│   │       ├── types.ts
│   │       ├── slice.ts
│   │       └── slice.test.ts
│   ├── data/
│   │   ├── store.ts
│   │   ├── persistence.ts
│   │   └── inference/
│   │       └── service.ts               # Ported from spike
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── ParticipantForm/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── index.test.tsx
│   │   │   │   └── ParticipantForm.stories.tsx
│   │   │   ├── CapturePreview/
│   │   │   │   ├── index.tsx
│   │   │   │   └── CapturePreview.stories.tsx
│   │   │   └── ResultCard/
│   │   │       ├── index.tsx
│   │   │       ├── index.test.tsx
│   │   │       └── ResultCard.stories.tsx
│   │   └── theme/
│   │       └── colors.ts
│   ├── go-wish/
│   │   ├── protocol.ts                  # 36 cards + Sanders demographics
│   │   ├── protocol.test.ts
│   │   ├── cardMatching.ts              # Match extracted text to card reference
│   │   └── cardMatching.test.ts
│   └── test-utils.tsx                   # renderWithStore helper
├── .storybook/
├── app.json
├── babel.config.js
├── jest.config.js
├── package.json
└── tsconfig.json
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `phase4/` (entire project skeleton)

**Step 1: Create Expo project**

```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync
npx create-expo-app@latest phase4 --template blank-typescript
cd phase4
```

**Step 2: Install production dependencies**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install @reduxjs/toolkit react-redux
npx expo install redux-persist @react-native-async-storage/async-storage
npx expo install expo-image-picker expo-image-manipulator expo-file-system
npx expo install llama.rn
npx expo install expo-dev-client expo-asset
npx expo install react-native-safe-area-context react-native-screens expo-system-ui
```

**Step 3: Install dev dependencies**

```bash
npm install -D jest-expo @testing-library/react-native @testing-library/jest-native @types/react
```

**Step 4: Configure package.json entry point for Expo Router**

In `package.json`, change main:
```json
{
  "main": "expo-router/entry"
}
```

**Step 5: Configure app.json**

```json
{
  "expo": {
    "name": "Co-Design Capture",
    "slug": "co-design-capture",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "scheme": "codesign",
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.codesign.capture",
      "infoPlist": {
        "UIFileSharingEnabled": true,
        "LSSupportsOpeningDocumentsInPlace": true,
        "NSCameraUsageDescription": "This app uses the camera to photograph co-design artifacts for analysis."
      }
    },
    "plugins": [
      "expo-dev-client",
      "llama.rn",
      "expo-asset",
      "expo-image-picker",
      "expo-router"
    ]
  }
}
```

**Step 6: Configure Jest**

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|llama.rn)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
```

**Step 7: Configure TypeScript**

Ensure `tsconfig.json` has strict mode:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

**Step 8: Create directory skeleton**

```bash
mkdir -p src/domain/{protocols,studies,participants,sessions,captures,analyses,results}
mkdir -p src/data/inference
mkdir -p src/presentation/components/{ParticipantForm,CapturePreview,ResultCard}
mkdir -p src/presentation/theme
mkdir -p src/go-wish
mkdir -p app/study/\[studyId\]/session/\[sessionId\]
```

**Step 9: Create minimal app/_layout.tsx**

```tsx
// ABOUTME: Root layout — wraps app with Redux Provider
// ABOUTME: Entry point for Expo Router navigation

import { Slot } from 'expo-router';

export default function RootLayout() {
  return <Slot />;
}
```

**Step 10: Create minimal app/index.tsx**

```tsx
// ABOUTME: Home screen placeholder
// ABOUTME: Will show study list and "New Study" button

import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Co-Design Capture</Text>
    </View>
  );
}
```

**Step 11: Add .gitignore**

```
node_modules/
.expo/
dist/
ios/
android/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
.DS_Store
```

**Step 12: Verify app compiles**

Run: `npx expo start`
Expected: Metro bundler starts without errors.

**Step 13: Commit**

```bash
git add phase4/
git commit -m "feat: scaffold phase4 Expo project with deps and directory structure"
```

---

## Task 2: Redux Store + Persistence

**Files:**
- Create: `src/data/store.ts`, `src/data/persistence.ts`
- Modify: `app/_layout.tsx`

**Step 1: Write test for store creation**

Create `src/data/store.test.ts`:
```typescript
// ABOUTME: Tests for Redux store configuration
// ABOUTME: Verifies store creates with correct initial state

import { makeStore } from './store';

describe('store', () => {
  it('creates with empty initial state for all slices', () => {
    const store = makeStore();
    const state = store.getState();

    expect(state.protocols).toBeDefined();
    expect(state.studies).toBeDefined();
    expect(state.participants).toBeDefined();
    expect(state.sessions).toBeDefined();
    expect(state.captures).toBeDefined();
    expect(state.analyses).toBeDefined();
    expect(state.results).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx jest src/data/store.test.ts`
Expected: FAIL — `makeStore` not found.

**Step 3: Implement store**

Create `src/data/store.ts`:
```typescript
// ABOUTME: Redux store configuration with all domain slices
// ABOUTME: Exports makeStore for testing and store singleton for app

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import protocolsReducer from '../domain/protocols/slice';
import studiesReducer from '../domain/studies/slice';
import participantsReducer from '../domain/participants/slice';
import sessionsReducer from '../domain/sessions/slice';
import capturesReducer from '../domain/captures/slice';
import analysesReducer from '../domain/analyses/slice';
import resultsReducer from '../domain/results/slice';

export const rootReducer = combineReducers({
  protocols: protocolsReducer,
  studies: studiesReducer,
  participants: participantsReducer,
  sessions: sessionsReducer,
  captures: capturesReducer,
  analyses: analysesReducer,
  results: resultsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
```

Note: This will fail to compile until slices exist. That's expected — slices are created in Tasks 4-6. Create placeholder slices to unblock:

For each slice (`protocols`, `studies`, `participants`, `sessions`, `captures`, `analyses`, `results`), create a minimal `slice.ts`:

```typescript
// ABOUTME: [Entity] domain slice — placeholder
// ABOUTME: Will be implemented with createEntityAdapter

import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: '[sliceName]',
  initialState: { ids: [], entities: {} },
  reducers: {},
});

export default slice.reducer;
```

**Step 4: Run test to verify it passes**

Run: `npx jest src/data/store.test.ts`
Expected: PASS

**Step 5: Wire store into _layout.tsx**

Update `app/_layout.tsx`:
```tsx
// ABOUTME: Root layout — wraps app with Redux Provider and persistence
// ABOUTME: Entry point for Expo Router navigation

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { makeStore } from '../src/data/store';

const store = makeStore();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
```

Note: Persistence (redux-persist + PersistGate) will be wired in Task 10 after all slices are real. Keeping it simple here to avoid blocking on persistence config.

**Step 6: Commit**

```bash
git add phase4/src/data/ phase4/src/domain/ phase4/app/_layout.tsx
git commit -m "feat: add Redux store with placeholder slices"
```

---

## Task 3: Domain Types

Define TypeScript interfaces for all 7 domain entities. No tests needed — these are pure type definitions.

**Files:**
- Create: `src/domain/protocols/types.ts`, `src/domain/studies/types.ts`, `src/domain/participants/types.ts`, `src/domain/sessions/types.ts`, `src/domain/captures/types.ts`, `src/domain/analyses/types.ts`, `src/domain/results/types.ts`

**Step 1: Protocol types**

```typescript
// ABOUTME: Protocol domain types — static, reusable co-design configuration
// ABOUTME: Defines instruments, participant schemas, strategies, and result schemas

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect';
  options?: string[];        // For select/multiselect
  required: boolean;
}

export interface Instrument {
  id: string;
  name: string;
  referenceItems: string[];  // e.g., 36 Go Wish card texts
}

export interface StrategyDefinition {
  id: string;
  name: string;
  prompt: string;            // Inference prompt template
}

export interface Protocol {
  id: string;
  name: string;
  description: string;
  instruments: Instrument[];
  participantSchema: FieldDefinition[];
  strategies: StrategyDefinition[];
}
```

**Step 2: Study types**

```typescript
// ABOUTME: Study domain types — runtime container for a co-design study
// ABOUTME: References a Protocol and accumulates participants/sessions

export interface Study {
  id: string;
  name: string;
  protocolId: string;
  createdAt: string;         // ISO 8601
}
```

**Step 3: Participant types**

```typescript
// ABOUTME: Participant domain types — coded research participant
// ABOUTME: Scoped to a study, no identifying information beyond protocol demographics

export interface Participant {
  id: string;
  studyId: string;
  codedId: string;           // P001, P002, ...
  demographics: Record<string, string | string[]>;  // Dynamic from protocol schema
  createdAt: string;
}
```

**Step 4: Session types**

```typescript
// ABOUTME: Session domain types — one data collection session
// ABOUTME: Links a participant to a study at a point in time

export interface Session {
  id: string;
  studyId: string;
  participantId: string;
  createdAt: string;
}
```

**Step 5: Capture types**

```typescript
// ABOUTME: Capture domain types — immutable raw photo capture
// ABOUTME: Scoped to a session, never modified after creation

export interface Capture {
  id: string;
  sessionId: string;
  imagePath: string;         // On-device file path
  createdAt: string;
}
```

**Step 6: Analysis types**

```typescript
// ABOUTME: Analysis domain types — repeatable processing of a capture
// ABOUTME: Uses a strategy to extract and match data from a capture image

export type AnalysisStatus = 'pending' | 'running' | 'complete' | 'failed';

export interface Analysis {
  id: string;
  sessionId: string;
  captureId: string;
  strategyId: string;
  status: AnalysisStatus;
  resultId: string | null;
  error: string | null;
  createdAt: string;
}
```

**Step 7: Result types**

```typescript
// ABOUTME: Result domain types — output of an analysis
// ABOUTME: Contains matched instrument items and unmatched extractions for review

export interface MatchedItem {
  referenceText: string;     // The card text from the instrument
  extractedText: string;     // What the model extracted
}

export interface Result {
  id: string;
  analysisId: string;
  matched: MatchedItem[];
  unmatched: string[];       // Extractions that didn't match any reference item
  rawOutput: string;         // Full inference output for debugging
  createdAt: string;
}
```

**Step 8: Commit**

```bash
git add phase4/src/domain/
git commit -m "feat: define domain types for all 7 pipeline entities"
```

---

## Task 4: Protocol Slice (Pattern Exemplar)

This task establishes the createEntityAdapter pattern used by all subsequent slices.

**Files:**
- Modify: `src/domain/protocols/slice.ts`
- Create: `src/domain/protocols/slice.test.ts`

**Step 1: Write failing test**

```typescript
// ABOUTME: Tests for protocols Redux slice
// ABOUTME: Verifies CRUD operations on protocol entities

import reducer, { addProtocol, protocolSelectors } from './slice';
import { Protocol } from './types';

const mockProtocol: Protocol = {
  id: 'proto-1',
  name: 'Go Wish',
  description: 'End-of-life care card sorting',
  instruments: [{
    id: 'inst-1',
    name: 'Go Wish Cards',
    referenceItems: ['To be free from pain'],
  }],
  participantSchema: [{
    name: 'age',
    label: 'Age',
    type: 'number',
    required: true,
  }],
  strategies: [{
    id: 'strat-1',
    name: 'Card Matching',
    prompt: 'Extract all Go Wish cards visible in this image.',
  }],
};

describe('protocols slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(protocolSelectors.selectAll(state)).toEqual([]);
  });

  it('adds a protocol', () => {
    const state = reducer(undefined, addProtocol(mockProtocol));
    expect(protocolSelectors.selectById(state, 'proto-1')).toEqual(mockProtocol);
  });

  it('selects all protocols', () => {
    let state = reducer(undefined, addProtocol(mockProtocol));
    expect(protocolSelectors.selectAll(state)).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx jest src/domain/protocols/slice.test.ts`
Expected: FAIL — `addProtocol` and `protocolSelectors` not exported.

**Step 3: Implement protocol slice**

```typescript
// ABOUTME: Protocols Redux slice — manages static protocol configurations
// ABOUTME: Uses createEntityAdapter for normalized CRUD operations

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Protocol } from './types';

const adapter = createEntityAdapter<Protocol>();

const slice = createSlice({
  name: 'protocols',
  initialState: adapter.getInitialState(),
  reducers: {
    addProtocol: adapter.addOne,
  },
});

export const { addProtocol } = slice.actions;
export const protocolSelectors = adapter.getSelectors();
export default slice.reducer;
```

**Step 4: Run test to verify it passes**

Run: `npx jest src/domain/protocols/slice.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add phase4/src/domain/protocols/
git commit -m "feat: implement protocols slice with createEntityAdapter"
```

---

## Task 5: Study + Participant + Session Slices

Follow the exact pattern from Task 4. Each slice uses createEntityAdapter. Key additions: scoped selectors.

**Files:**
- Modify: `src/domain/studies/slice.ts`, `src/domain/participants/slice.ts`, `src/domain/sessions/slice.ts`
- Create: `src/domain/studies/slice.test.ts`, `src/domain/participants/slice.test.ts`, `src/domain/sessions/slice.test.ts`

**Step 1: Write failing tests for studies slice**

```typescript
// ABOUTME: Tests for studies Redux slice
// ABOUTME: Verifies CRUD and study creation with UUID

import reducer, { addStudy, studySelectors } from './slice';
import { Study } from './types';

const mockStudy: Study = {
  id: 'study-1',
  name: 'ED Pilot',
  protocolId: 'proto-1',
  createdAt: '2026-01-01T00:00:00Z',
};

describe('studies slice', () => {
  it('starts with empty state', () => {
    const state = reducer(undefined, { type: 'init' });
    expect(studySelectors.selectAll(state)).toEqual([]);
  });

  it('adds a study', () => {
    const state = reducer(undefined, addStudy(mockStudy));
    expect(studySelectors.selectById(state, 'study-1')).toEqual(mockStudy);
  });
});
```

**Step 2: Run test — expect FAIL**

Run: `npx jest src/domain/studies/slice.test.ts`

**Step 3: Implement studies slice**

Same pattern as protocols slice but with `Study` type. Export `addStudy`, `studySelectors`.

**Step 4: Run test — expect PASS**

**Step 5: Write failing tests for participants slice**

Key test: `selectByStudyId` custom selector.

```typescript
// ABOUTME: Tests for participants Redux slice
// ABOUTME: Verifies CRUD and study-scoped selection

import reducer, { addParticipant, participantSelectors, selectParticipantsByStudyId } from './slice';
import { Participant } from './types';

const mockParticipant: Participant = {
  id: 'part-1',
  studyId: 'study-1',
  codedId: 'P001',
  demographics: { age: '65', race: 'White' },
  createdAt: '2026-01-01T00:00:00Z',
};

describe('participants slice', () => {
  it('adds a participant', () => {
    const state = reducer(undefined, addParticipant(mockParticipant));
    expect(participantSelectors.selectById(state, 'part-1')).toEqual(mockParticipant);
  });

  it('selects participants by study ID', () => {
    let state = reducer(undefined, addParticipant(mockParticipant));
    state = reducer(state, addParticipant({
      ...mockParticipant,
      id: 'part-2',
      studyId: 'study-2',
      codedId: 'P001',
    }));
    const filtered = selectParticipantsByStudyId(state, 'study-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('part-1');
  });
});
```

**Step 6: Run test — expect FAIL**

**Step 7: Implement participants slice**

```typescript
// ABOUTME: Participants Redux slice — manages coded research participants
// ABOUTME: Scoped to studies via selectByStudyId selector

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Participant } from './types';

const adapter = createEntityAdapter<Participant>();

const slice = createSlice({
  name: 'participants',
  initialState: adapter.getInitialState(),
  reducers: {
    addParticipant: adapter.addOne,
  },
});

export const { addParticipant } = slice.actions;
export const participantSelectors = adapter.getSelectors();

export function selectParticipantsByStudyId(
  state: ReturnType<typeof slice.reducer>,
  studyId: string,
): Participant[] {
  return participantSelectors.selectAll(state).filter(p => p.studyId === studyId);
}

export default slice.reducer;
```

**Step 8: Run test — expect PASS**

**Step 9: Repeat pattern for sessions slice**

Sessions slice follows the same pattern. Key addition: `selectSessionsByStudyId(state, studyId)` selector. Test and implement same as participants.

**Step 10: Run all domain tests**

Run: `npx jest src/domain/`
Expected: ALL PASS

**Step 11: Commit**

```bash
git add phase4/src/domain/studies/ phase4/src/domain/participants/ phase4/src/domain/sessions/
git commit -m "feat: implement study, participant, and session slices"
```

---

## Task 6: Capture + Analysis + Result Slices

**Files:**
- Modify: `src/domain/captures/slice.ts`, `src/domain/analyses/slice.ts`, `src/domain/results/slice.ts`
- Create: corresponding `.test.ts` files

**Step 1: Write failing tests for captures slice**

Same createEntityAdapter pattern. Key selector: `selectCapturesBySessionId(state, sessionId)`.

**Step 2: Run test — expect FAIL**

**Step 3: Implement captures slice**

Same pattern as participants but with `Capture` type and session-scoped selector.

**Step 4: Run test — expect PASS**

**Step 5: Write failing tests for analyses slice**

Key difference: analysis has a `status` field and an `updateAnalysis` action for status transitions.

```typescript
// ABOUTME: Tests for analyses Redux slice
// ABOUTME: Verifies CRUD and status transitions

import reducer, { addAnalysis, updateAnalysis, analysisSelectors } from './slice';
import { Analysis } from './types';

const mockAnalysis: Analysis = {
  id: 'analysis-1',
  sessionId: 'session-1',
  captureId: 'capture-1',
  strategyId: 'strat-1',
  status: 'pending',
  resultId: null,
  error: null,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('analyses slice', () => {
  it('adds an analysis', () => {
    const state = reducer(undefined, addAnalysis(mockAnalysis));
    expect(analysisSelectors.selectById(state, 'analysis-1')?.status).toBe('pending');
  });

  it('updates analysis status', () => {
    let state = reducer(undefined, addAnalysis(mockAnalysis));
    state = reducer(state, updateAnalysis({
      id: 'analysis-1',
      changes: { status: 'complete', resultId: 'result-1' },
    }));
    const analysis = analysisSelectors.selectById(state, 'analysis-1');
    expect(analysis?.status).toBe('complete');
    expect(analysis?.resultId).toBe('result-1');
  });
});
```

**Step 6: Run test — expect FAIL**

**Step 7: Implement analyses slice**

```typescript
// ABOUTME: Analyses Redux slice — manages repeatable capture processing
// ABOUTME: Tracks analysis status and links to results

import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Analysis } from './types';

const adapter = createEntityAdapter<Analysis>();

const slice = createSlice({
  name: 'analyses',
  initialState: adapter.getInitialState(),
  reducers: {
    addAnalysis: adapter.addOne,
    updateAnalysis: adapter.updateOne,
  },
});

export const { addAnalysis, updateAnalysis } = slice.actions;
export const analysisSelectors = adapter.getSelectors();

export function selectAnalysesBySessionId(
  state: ReturnType<typeof slice.reducer>,
  sessionId: string,
): Analysis[] {
  return analysisSelectors.selectAll(state).filter(a => a.sessionId === sessionId);
}

export default slice.reducer;
```

**Step 8: Run test — expect PASS**

**Step 9: Implement results slice**

Same createEntityAdapter pattern with `Result` type. Selector: `selectResultByAnalysisId(state, analysisId)`.

**Step 10: Run all tests**

Run: `npx jest src/domain/`
Expected: ALL PASS

**Step 11: Update store.ts**

Remove placeholder slice imports and use the real ones. Verify store test still passes.

Run: `npx jest src/data/store.test.ts`
Expected: PASS

**Step 12: Commit**

```bash
git add phase4/src/domain/captures/ phase4/src/domain/analyses/ phase4/src/domain/results/ phase4/src/data/store.ts
git commit -m "feat: implement capture, analysis, and result slices"
```

---

## Task 7: Go Wish Protocol Definition

**Files:**
- Create: `src/go-wish/protocol.ts`, `src/go-wish/protocol.test.ts`

**Step 1: Write failing test**

```typescript
// ABOUTME: Tests for Go Wish protocol definition
// ABOUTME: Verifies 36 cards and Sanders demographic schema

import { GO_WISH_PROTOCOL } from './protocol';

describe('Go Wish protocol', () => {
  it('defines exactly 36 cards', () => {
    const cards = GO_WISH_PROTOCOL.instruments[0].referenceItems;
    expect(cards).toHaveLength(36);
  });

  it('includes the Wild Card', () => {
    const cards = GO_WISH_PROTOCOL.instruments[0].referenceItems;
    expect(cards).toContain('Wild Card');
  });

  it('defines Sanders demographic fields', () => {
    const fields = GO_WISH_PROTOCOL.participantSchema;
    const fieldNames = fields.map(f => f.name);
    expect(fieldNames).toContain('age');
    expect(fieldNames).toContain('race');
    expect(fieldNames).toContain('medicalConditions');
    expect(fieldNames).toContain('education');
    expect(fieldNames).toContain('householdIncome');
    expect(fieldNames).toContain('selfAssessedHealth');
  });

  it('has correct field types', () => {
    const fields = GO_WISH_PROTOCOL.participantSchema;
    const age = fields.find(f => f.name === 'age');
    const race = fields.find(f => f.name === 'race');
    const conditions = fields.find(f => f.name === 'medicalConditions');

    expect(age?.type).toBe('number');
    expect(race?.type).toBe('select');
    expect(conditions?.type).toBe('multiselect');
  });

  it('defines a card matching strategy', () => {
    expect(GO_WISH_PROTOCOL.strategies).toHaveLength(1);
    expect(GO_WISH_PROTOCOL.strategies[0].prompt).toBeTruthy();
  });
});
```

**Step 2: Run test — expect FAIL**

Run: `npx jest src/go-wish/protocol.test.ts`

**Step 3: Implement Go Wish protocol**

```typescript
// ABOUTME: Go Wish protocol configuration — 36 end-of-life care cards
// ABOUTME: Defines cards, Sanders demographics, and card matching strategy

import { Protocol } from '../domain/protocols/types';

export const GO_WISH_PROTOCOL: Protocol = {
  id: 'go-wish',
  name: 'Go Wish',
  description: 'End-of-life care priorities card sorting activity',
  instruments: [
    {
      id: 'go-wish-cards',
      name: 'Go Wish Cards',
      referenceItems: [
        'To be free from pain',
        'To be at peace with God',
        'To pray',
        'To be mentally aware',
        'Not being a burden to my family',
        'To keep my sense of humor',
        'Not being short of breath',
        'To trust my doctor',
        'To maintain my dignity',
        'To have my family with me',
        'Not being connected to machines',
        'To be treated the way I want',
        'To be kept clean',
        'To be able to help others',
        'To have a nurse I feel comfortable with',
        'To be free from anxiety',
        'To say goodbye to important people in my life',
        'To have a doctor who knows me as a whole person',
        'To have human touch',
        'To prevent arguments by making sure my family knows what I want',
        'To have my funeral arrangements made',
        'Wild Card',
        'To feel that my life is complete',
        'To have an advocate who knows my values and priorities',
        'To know how my body will change',
        'To have someone who will listen to me',
        'To be able to talk about what death means',
        'To have my financial affairs in order',
        'To have my family prepared for my death',
        'To remember personal accomplishments',
        'To meet with clergy or a chaplain',
        'To die at home',
        'Not dying alone',
        'To be able to talk about what scares me',
        'To take care of unfinished business with family and friends',
        'To have close friends near',
      ],
    },
  ],
  participantSchema: [
    { name: 'age', label: 'Age', type: 'number', required: true },
    {
      name: 'race',
      label: 'Race/Ethnicity',
      type: 'select',
      options: ['White', 'Black/African American', 'Hispanic/Latino', 'Asian', 'Native American', 'Pacific Islander', 'Other'],
      required: true,
    },
    {
      name: 'medicalConditions',
      label: 'Medical Conditions',
      type: 'multiselect',
      options: ['Cancer', 'Heart Disease', 'COPD', 'Diabetes', 'Kidney Disease', 'Dementia', 'Stroke', 'Other'],
      required: false,
    },
    {
      name: 'education',
      label: 'Education',
      type: 'select',
      options: ['Less than high school', 'High school/GED', 'Some college', 'Bachelor\'s degree', 'Graduate degree'],
      required: true,
    },
    {
      name: 'householdIncome',
      label: 'Household Income',
      type: 'select',
      options: ['Under $25,000', '$25,000-$49,999', '$50,000-$74,999', '$75,000-$99,999', '$100,000+'],
      required: true,
    },
    {
      name: 'selfAssessedHealth',
      label: 'Self-Assessed Health',
      type: 'select',
      options: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
      required: true,
    },
  ],
  strategies: [
    {
      id: 'card-matching',
      name: 'Card Matching',
      prompt: 'Extract all Go Wish cards visible in this image. Return JSON with format: {"cards": [{"text": "card text here"}]}. List every card you can read.',
    },
  ],
};
```

**Step 4: Run test — expect PASS**

Run: `npx jest src/go-wish/protocol.test.ts`

**Step 5: Commit**

```bash
git add phase4/src/go-wish/protocol.ts phase4/src/go-wish/protocol.test.ts
git commit -m "feat: define Go Wish protocol with 36 cards and Sanders demographics"
```

---

## Task 8: Card Matching Logic

Heavy TDD. This is the core domain logic for the Go Wish tracer bullet.

**Files:**
- Create: `src/go-wish/cardMatching.ts`, `src/go-wish/cardMatching.test.ts`

**Step 1: Write failing test — exact match**

```typescript
// ABOUTME: Tests for card matching logic
// ABOUTME: Verifies text extraction matching against 36-card reference set

import { matchCards, CardMatchResult } from './cardMatching';

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
});
```

**Step 2: Run test — expect FAIL**

Run: `npx jest src/go-wish/cardMatching.test.ts`

**Step 3: Implement basic matching**

```typescript
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

  for (const text of extracted) {
    const normalizedExtracted = normalize(text);
    const match = referenceCards.find(
      ref => normalize(ref) === normalizedExtracted,
    );

    if (match) {
      matched.push({ referenceText: match, extractedText: text });
    } else {
      unmatched.push(text);
    }
  }

  return { matched, unmatched };
}
```

**Step 4: Run test — expect PASS**

**Step 5: Write failing test — case-insensitive and whitespace tolerance**

```typescript
  it('matches case-insensitively with normalized whitespace', () => {
    const extracted = ['to be free from pain', 'TO KEEP MY  SENSE OF HUMOR'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(0);
  });
```

**Step 6: Run test — expect PASS** (already handled by normalize)

**Step 7: Write failing test — unmatched extractions**

```typescript
  it('returns unmatched extractions separately', () => {
    const extracted = ['To be free from pain', 'Something the model hallucinated'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toEqual(['Something the model hallucinated']);
  });
```

**Step 8: Run test — expect PASS** (already handled)

**Step 9: Write failing test — substring containment match**

```typescript
  it('matches when extracted text contains the reference (OCR artifacts)', () => {
    const extracted = ['To be free from pain.', '"To keep my sense of humor"'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(2);
  });
```

**Step 10: Run test — expect FAIL** (exact match won't catch trailing period or quotes)

**Step 11: Add containment matching**

Update `matchCards` to try containment after exact match fails:

```typescript
export function matchCards(
  extracted: string[],
  referenceCards: string[],
): CardMatchResult {
  const matched: CardMatchResult['matched'] = [];
  const unmatched: string[] = [];

  for (const text of extracted) {
    const normalizedExtracted = normalize(text);

    // Try exact match first
    let match = referenceCards.find(
      ref => normalize(ref) === normalizedExtracted,
    );

    // Try containment match (handles OCR artifacts like quotes, periods)
    if (!match) {
      match = referenceCards.find(ref => {
        const normalizedRef = normalize(ref);
        return normalizedExtracted.includes(normalizedRef)
          || normalizedRef.includes(normalizedExtracted);
      });
    }

    if (match) {
      matched.push({ referenceText: match, extractedText: text });
    } else {
      unmatched.push(text);
    }
  }

  return { matched, unmatched };
}
```

**Step 12: Run test — expect PASS**

**Step 13: Write test — empty input**

```typescript
  it('handles empty extraction list', () => {
    const result = matchCards([], REFERENCE_CARDS);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(0);
  });
```

**Step 14: Run test — expect PASS**

**Step 15: Write test — no duplicate matches**

```typescript
  it('does not match the same reference card twice', () => {
    const extracted = ['To be free from pain', 'to be free from pain'];
    const result = matchCards(extracted, REFERENCE_CARDS);

    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(1);
  });
```

**Step 16: Run test — expect FAIL** (current impl doesn't track used refs)

**Step 17: Add used-reference tracking**

Update `matchCards` to track which reference cards have been matched:

```typescript
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

    let match = availableRefs().find(
      ref => normalize(ref) === normalizedExtracted,
    );

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
```

**Step 18: Run all card matching tests — expect PASS**

Run: `npx jest src/go-wish/cardMatching.test.ts`

**Step 19: Commit**

```bash
git add phase4/src/go-wish/cardMatching.ts phase4/src/go-wish/cardMatching.test.ts
git commit -m "feat: implement card matching with normalization and dedup"
```

---

## Task 9: Analysis Orchestration Thunk

**Files:**
- Create: `src/domain/analyses/thunks.ts`, `src/domain/analyses/thunks.test.ts`

**Step 1: Define thunk extra argument type**

Add to `src/data/store.ts`:
```typescript
export interface ThunkExtra {
  inferenceService: {
    run(imagePath: string, prompt: string, onStatus: (s: string) => void): Promise<{ output: string }>;
  };
}
```

Update `makeStore` to accept extra:
```typescript
export function makeStore(preloadedState?: Partial<RootState>, extra?: ThunkExtra) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: { extraArgument: extra } }),
  });
}
```

**Step 2: Write failing test**

```typescript
// ABOUTME: Tests for analysis orchestration thunk
// ABOUTME: Verifies end-to-end flow: inference → card matching → result storage

import { makeStore, ThunkExtra } from '../../data/store';
import { addCapture } from '../captures/slice';
import { addAnalysis } from './slice';
import { runAnalysis } from './thunks';
import { analysisSelectors } from './slice';

const mockInferenceService: ThunkExtra['inferenceService'] = {
  run: jest.fn().mockResolvedValue({
    output: JSON.stringify({ cards: [{ text: 'To be free from pain' }, { text: 'Wild Card' }] }),
  }),
};

const MOCK_REFERENCE_CARDS = ['To be free from pain', 'Wild Card', 'To pray'];

describe('runAnalysis thunk', () => {
  it('runs inference and produces results', async () => {
    const store = makeStore(undefined, { inferenceService: mockInferenceService });

    // Set up prerequisite state
    store.dispatch(addCapture({
      id: 'cap-1',
      sessionId: 'sess-1',
      imagePath: '/path/to/image.jpg',
      createdAt: '2026-01-01T00:00:00Z',
    }));

    await store.dispatch(runAnalysis({
      captureId: 'cap-1',
      sessionId: 'sess-1',
      referenceCards: MOCK_REFERENCE_CARDS,
      strategyId: 'card-matching',
      prompt: 'Extract cards',
    }));

    const state = store.getState();
    const analyses = analysisSelectors.selectAll(state.analyses);
    expect(analyses).toHaveLength(1);
    expect(analyses[0].status).toBe('complete');
    expect(analyses[0].resultId).toBeTruthy();

    // Verify results were created
    const results = state.results.ids;
    expect(results).toHaveLength(1);
  });
});
```

**Step 3: Run test — expect FAIL**

Run: `npx jest src/domain/analyses/thunks.test.ts`

**Step 4: Implement thunk**

```typescript
// ABOUTME: Analysis orchestration — coordinates inference and card matching
// ABOUTME: Dispatches status updates as analysis progresses

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, ThunkExtra } from '../../data/store';
import { addAnalysis, updateAnalysis } from './slice';
import { addResult } from '../results/slice';
import { captureSelectors } from '../captures/slice';
import { matchCards } from '../../go-wish/cardMatching';

interface RunAnalysisArgs {
  captureId: string;
  sessionId: string;
  referenceCards: string[];
  strategyId: string;
  prompt: string;
}

export const runAnalysis = createAsyncThunk<
  void,
  RunAnalysisArgs,
  { state: RootState; extra: ThunkExtra }
>(
  'analyses/run',
  async ({ captureId, sessionId, referenceCards, strategyId, prompt }, { dispatch, getState, extra }) => {
    const analysisId = `analysis-${Date.now()}`;
    const resultId = `result-${Date.now()}`;

    dispatch(addAnalysis({
      id: analysisId,
      sessionId,
      captureId,
      strategyId,
      status: 'running',
      resultId: null,
      error: null,
      createdAt: new Date().toISOString(),
    }));

    try {
      const capture = captureSelectors.selectById(getState().captures, captureId);
      if (!capture) throw new Error(`Capture ${captureId} not found`);

      const { output } = await extra.inferenceService.run(
        capture.imagePath,
        prompt,
        () => {},  // Status callback — wired to UI in presentation layer
      );

      const parsed = JSON.parse(output);
      const extractedTexts: string[] = parsed.cards.map((c: { text: string }) => c.text);
      const matchResult = matchCards(extractedTexts, referenceCards);

      dispatch(addResult({
        id: resultId,
        analysisId,
        matched: matchResult.matched,
        unmatched: matchResult.unmatched,
        rawOutput: output,
        createdAt: new Date().toISOString(),
      }));

      dispatch(updateAnalysis({
        id: analysisId,
        changes: { status: 'complete', resultId },
      }));
    } catch (error) {
      dispatch(updateAnalysis({
        id: analysisId,
        changes: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  },
);
```

**Step 5: Run test — expect PASS**

Run: `npx jest src/domain/analyses/thunks.test.ts`

**Step 6: Write test — failure case**

```typescript
  it('marks analysis as failed when inference errors', async () => {
    const failingService: ThunkExtra['inferenceService'] = {
      run: jest.fn().mockRejectedValue(new Error('Model not loaded')),
    };
    const store = makeStore(undefined, { inferenceService: failingService });

    store.dispatch(addCapture({
      id: 'cap-1', sessionId: 'sess-1', imagePath: '/img.jpg', createdAt: '2026-01-01T00:00:00Z',
    }));

    await store.dispatch(runAnalysis({
      captureId: 'cap-1', sessionId: 'sess-1', referenceCards: [],
      strategyId: 'card-matching', prompt: 'Extract cards',
    }));

    const analyses = analysisSelectors.selectAll(store.getState().analyses);
    expect(analyses[0].status).toBe('failed');
    expect(analyses[0].error).toBe('Model not loaded');
  });
```

**Step 7: Run test — expect PASS** (error handling already implemented)

**Step 8: Commit**

```bash
git add phase4/src/domain/analyses/thunks.ts phase4/src/domain/analyses/thunks.test.ts phase4/src/data/store.ts
git commit -m "feat: implement analysis orchestration thunk with error handling"
```

---

## Task 10: Inference Service

Port from spike. Not TDD-able (requires device hardware). Type-safe interface + clean wrapper.

**Files:**
- Create: `src/data/inference/service.ts`

**Step 1: Implement inference service**

```typescript
// ABOUTME: On-device inference via llama.rn — ported from spike
// ABOUTME: Loads Qwen3-VL-2B and runs multimodal completion on captured images

import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_IMAGE_WIDTH = 512;
const MODEL_FILENAME = 'Qwen3VL-2B-Instruct-Q4_K_M.gguf';
const MMPROJ_FILENAME = 'mmproj-Qwen3VL-2B-Instruct-F16.gguf';

let context: LlamaContext | null = null;

function uriToPath(uri: string): string {
  if (uri.startsWith('file://')) {
    return decodeURIComponent(uri.replace('file://', ''));
  }
  return uri;
}

async function resizeImage(uri: string): Promise<string> {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: MAX_IMAGE_WIDTH } }],
    { format: SaveFormat.JPEG, compress: 0.8 },
  );
  return result.uri;
}

async function getModelPath(filename: string): Promise<string> {
  const docDir = FileSystem.documentDirectory;
  const docPath = `${docDir}models/${filename}`;
  const info = await FileSystem.getInfoAsync(docPath);
  if (info.exists) {
    return uriToPath(docPath);
  }
  throw new Error(`Model not found at ${docPath}. Copy ${filename} to Documents/models/.`);
}

export async function run(
  imagePath: string,
  prompt: string,
  onStatus: (status: string) => void,
): Promise<{ output: string }> {
  onStatus('Checking model files...');
  const modelPath = await getModelPath(MODEL_FILENAME);
  const mmprojPath = await getModelPath(MMPROJ_FILENAME);

  onStatus('Resizing image...');
  const resizedUri = await resizeImage(imagePath);
  const rawImagePath = uriToPath(resizedUri);

  onStatus('Loading model...');
  context = await initLlama({
    model: modelPath,
    n_ctx: 4096,
    n_gpu_layers: 99,
    ctx_shift: false,
  });

  onStatus('Initializing multimodal...');
  await context.initMultimodal({ path: mmprojPath });

  onStatus('Running inference...');
  const result = await context.completion({
    prompt,
    media_paths: [rawImagePath],
  });

  return { output: result.text };
}

export async function release(): Promise<void> {
  if (context) {
    await context.release();
    context = null;
  }
}
```

**Step 2: Update store to inject inference service**

In `app/_layout.tsx`, pass inference service as thunk extra:

```tsx
import * as inferenceService from '../src/data/inference/service';

const store = makeStore(undefined, { inferenceService });
```

**Step 3: Commit**

```bash
git add phase4/src/data/inference/ phase4/app/_layout.tsx
git commit -m "feat: port inference service from spike with configurable prompts"
```

---

## Task 11: Persistence + Navigation + Theme

**Files:**
- Create: `src/data/persistence.ts`, `src/presentation/theme/colors.ts`, `src/test-utils.tsx`
- Modify: `app/_layout.tsx`, all route files

**Step 1: Implement persistence config**

```typescript
// ABOUTME: Redux persistence configuration — stores state on-device
// ABOUTME: Uses AsyncStorage for PHIPA/PIPEDA-compliant local-only storage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { rootReducer } from './store';

const persistConfig = {
  key: 'co-design-capture',
  storage: AsyncStorage,
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
export { persistStore };
```

Update `store.ts` to use persisted reducer when persistence is enabled, and plain reducer for tests.

**Step 2: Implement greyscale theme tokens**

```typescript
// ABOUTME: Greyscale color tokens for proof-of-concept UI
// ABOUTME: Minimal palette — can be extended when design system grows

export const colors = {
  black: '#000000',
  grey900: '#1a1a1a',
  grey800: '#333333',
  grey700: '#4d4d4d',
  grey600: '#666666',
  grey500: '#808080',
  grey400: '#999999',
  grey300: '#b3b3b3',
  grey200: '#cccccc',
  grey100: '#e6e6e6',
  grey50: '#f5f5f5',
  white: '#ffffff',

  // Semantic aliases
  background: '#f5f5f5',
  surface: '#ffffff',
  textPrimary: '#1a1a1a',
  textSecondary: '#666666',
  border: '#cccccc',
  accent: '#333333',
  error: '#cc0000',
} as const;
```

**Step 3: Create test utility**

```tsx
// ABOUTME: Test helper — renders components with Redux store
// ABOUTME: Used by presentation layer tests

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { makeStore, RootState, ThunkExtra } from './data/store';

interface RenderOptions {
  preloadedState?: Partial<RootState>;
  extra?: ThunkExtra;
}

export function renderWithStore(
  ui: React.ReactElement,
  { preloadedState, extra }: RenderOptions = {},
) {
  const store = makeStore(preloadedState, extra);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { ...render(ui, { wrapper }), store };
}
```

**Step 4: Set up Expo Router route stubs**

Create stub files for all routes (each just renders a placeholder `<Text>` so navigation can be verified). Files:
- `app/index.tsx` — "Home"
- `app/study/[studyId]/_layout.tsx` — Slot wrapper
- `app/study/[studyId]/index.tsx` — "Study Detail"
- `app/study/[studyId]/add-participant.tsx` — "Add Participant"
- `app/study/[studyId]/session/[sessionId]/capture.tsx` — "Capture"
- `app/study/[studyId]/session/[sessionId]/results.tsx` — "Results"

**Step 5: Wire persistence + Provider into _layout.tsx**

```tsx
// ABOUTME: Root layout — Redux Provider with persistence and navigation
// ABOUTME: Entry point for all screens via Expo Router

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Text } from 'react-native';
import { makeStore } from '../src/data/store';
import { persistStore } from 'redux-persist';
import * as inferenceService from '../src/data/inference/service';

const store = makeStore(undefined, { inferenceService });
const persistor = persistStore(store);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}
```

Note: PersistGate integration depends on `persistedReducer` being wired into `makeStore`. The exact wiring should use a flag or separate factory to keep `makeStore` testable without persistence overhead. One approach: `makeStore` stays clean for tests, `_layout.tsx` creates the persisted version directly.

**Step 6: Verify navigation works**

Run: `npx expo start`
Verify: Home screen stub renders. Navigate between stubs if possible.

**Step 7: Commit**

```bash
git add phase4/src/data/persistence.ts phase4/src/presentation/theme/ phase4/src/test-utils.tsx phase4/app/
git commit -m "feat: add persistence, theme tokens, navigation stubs, and test utils"
```

---

## Task 12: Home Screen — Create Study (BDD Scenario 1)

**Files:**
- Modify: `app/index.tsx`

**Step 1: Write failing test**

Create `app/index.test.tsx`:
```tsx
// ABOUTME: Tests for home screen
// ABOUTME: Verifies study creation flow (BDD Scenario 1)

import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithStore } from '../src/test-utils';
import HomeScreen from './index';

describe('HomeScreen', () => {
  it('renders New Study button', () => {
    const { getByText } = renderWithStore(<HomeScreen />);
    expect(getByText('New Study')).toBeTruthy();
  });

  it('creates a study when New Study is tapped', () => {
    const { getByText, store } = renderWithStore(<HomeScreen />);
    fireEvent.press(getByText('New Study'));

    const studies = store.getState().studies.ids;
    expect(studies).toHaveLength(1);
  });
});
```

**Step 2: Run test — expect FAIL**

Run: `npx jest app/index.test.tsx`

**Step 3: Implement home screen**

```tsx
// ABOUTME: Home screen — displays studies and creates new ones
// ABOUTME: Go Wish protocol is pre-selected (only protocol available)

import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../src/data/store';
import { addStudy, studySelectors } from '../src/domain/studies/slice';
import { addProtocol } from '../src/domain/protocols/slice';
import { GO_WISH_PROTOCOL } from '../src/go-wish/protocol';
import { colors } from '../src/presentation/theme/colors';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const studies = useSelector((state: RootState) => studySelectors.selectAll(state.studies));
  const protocols = useSelector((state: RootState) => state.protocols);

  const handleNewStudy = () => {
    // Ensure Go Wish protocol is loaded
    if (!protocols.entities[GO_WISH_PROTOCOL.id]) {
      dispatch(addProtocol(GO_WISH_PROTOCOL));
    }

    const studyId = `study-${Date.now()}`;
    dispatch(addStudy({
      id: studyId,
      name: `Study ${studies.length + 1}`,
      protocolId: GO_WISH_PROTOCOL.id,
      createdAt: new Date().toISOString(),
    }));

    router.push(`/study/${studyId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Co-Design Capture</Text>
      <Text style={styles.subtitle}>Go Wish Protocol</Text>

      <FlatList
        data={studies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.studyCard}
            onPress={() => router.push(`/study/${item.id}`)}
          >
            <Text style={styles.studyName}>{item.name}</Text>
            <Text style={styles.studyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No studies yet. Tap "New Study" to begin.</Text>
        }
      />

      <Pressable style={styles.button} onPress={handleNewStudy}>
        <Text style={styles.buttonText}>New Study</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  studyCard: {
    backgroundColor: colors.surface, padding: 16, borderRadius: 8,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  studyName: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  studyDate: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 48 },
  button: {
    backgroundColor: colors.accent, padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
});
```

**Step 4: Run test — expect PASS**

Run: `npx jest app/index.test.tsx`

**Step 5: Commit**

```bash
git add phase4/app/index.tsx phase4/app/index.test.tsx
git commit -m "feat: implement home screen with study creation (BDD Scenario 1)"
```

---

## Task 13: Study Detail Screen (BDD Scenarios 2-3)

**Files:**
- Modify: `app/study/[studyId]/index.tsx`

**Step 1: Write failing test**

```tsx
// ABOUTME: Tests for study detail screen
// ABOUTME: Verifies participant list, session list, and navigation

import { fireEvent } from '@testing-library/react-native';
import { renderWithStore } from '../../../src/test-utils';
import StudyDetailScreen from './index';

// Note: you will need to mock expo-router's useLocalSearchParams
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ studyId: 'study-1' }),
  useRouter: () => ({ push: jest.fn() }),
}));

describe('StudyDetailScreen', () => {
  const preloadedState = {
    studies: {
      ids: ['study-1'],
      entities: { 'study-1': { id: 'study-1', name: 'Test Study', protocolId: 'go-wish', createdAt: '2026-01-01T00:00:00Z' } },
    },
    participants: { ids: [], entities: {} },
    sessions: { ids: [], entities: {} },
  };

  it('shows study name', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('Test Study')).toBeTruthy();
  });

  it('shows Add Participant button', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('Add Participant')).toBeTruthy();
  });

  it('shows New Session button', () => {
    const { getByText } = renderWithStore(<StudyDetailScreen />, { preloadedState });
    expect(getByText('New Session')).toBeTruthy();
  });
});
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement study detail screen**

Screen shows: study name, participant list (coded IDs), session list, "Add Participant" and "New Session" buttons. "Add Participant" navigates to `add-participant`. "New Session" creates session (requires selecting a participant first).

Implementation follows the same pattern as HomeScreen: `useSelector` for state, `useDispatch` for actions, `useRouter` for navigation.

**Step 4: Run test — expect PASS**

**Step 5: Commit**

```bash
git add phase4/app/study/
git commit -m "feat: implement study detail screen with participant and session lists"
```

---

## Task 14: Participant Form (BDD Scenario 2)

**Files:**
- Create: `src/presentation/components/ParticipantForm/index.tsx`
- Modify: `app/study/[studyId]/add-participant.tsx`

**Step 1: Write failing test for ParticipantForm component**

```tsx
// ABOUTME: Tests for dynamic participant form
// ABOUTME: Verifies field rendering from protocol schema and coded ID assignment

import { render, fireEvent } from '@testing-library/react-native';
import { ParticipantForm } from './index';

const mockSchema = [
  { name: 'age', label: 'Age', type: 'number' as const, required: true },
  { name: 'race', label: 'Race', type: 'select' as const, options: ['White', 'Black'], required: true },
];

describe('ParticipantForm', () => {
  it('renders fields from protocol schema', () => {
    const { getByText } = render(
      <ParticipantForm schema={mockSchema} codedId="P001" onSubmit={jest.fn()} />
    );
    expect(getByText('Age')).toBeTruthy();
    expect(getByText('Race')).toBeTruthy();
  });

  it('displays the assigned coded ID', () => {
    const { getByText } = render(
      <ParticipantForm schema={mockSchema} codedId="P003" onSubmit={jest.fn()} />
    );
    expect(getByText('P003')).toBeTruthy();
  });

  it('calls onSubmit with form data', () => {
    const onSubmit = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <ParticipantForm schema={mockSchema} codedId="P001" onSubmit={onSubmit} />
    );

    fireEvent.changeText(getByPlaceholderText('Age'), '65');
    fireEvent.press(getByText('Save'));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ age: '65' }),
    );
  });
});
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement ParticipantForm**

A form component that renders dynamic fields based on `FieldDefinition[]`. Each field type renders the appropriate input:
- `number` → `TextInput` with `keyboardType="numeric"`
- `text` → `TextInput`
- `select` → Pressable options (radio-like)
- `multiselect` → Pressable options (checkbox-like)

Props: `{ schema: FieldDefinition[], codedId: string, onSubmit: (data: Record<string, string | string[]>) => void }`

**Step 4: Run test — expect PASS**

**Step 5: Wire into add-participant route**

The route screen:
1. Gets `studyId` from params
2. Gets protocol from store (via study's `protocolId`)
3. Computes next coded ID (P001, P002, ...) from existing participant count
4. Renders `<ParticipantForm>` with protocol's `participantSchema`
5. On submit: dispatches `addParticipant` and navigates back

**Step 6: Write test for coded ID generation**

```typescript
it('generates sequential coded IDs', () => {
  // With 0 existing participants → P001
  // With 2 existing participants → P003
  expect(generateCodedId(0)).toBe('P001');
  expect(generateCodedId(2)).toBe('P003');
  expect(generateCodedId(99)).toBe('P100');
});
```

Extract `generateCodedId` as a pure function in the participants domain.

**Step 7: Commit**

```bash
git add phase4/src/presentation/components/ParticipantForm/ phase4/src/domain/participants/ phase4/app/study/
git commit -m "feat: implement dynamic participant form with coded ID assignment"
```

---

## Task 15: Session + Capture Screen (BDD Scenarios 3-4)

**Files:**
- Modify: `app/study/[studyId]/session/[sessionId]/capture.tsx`
- Create: `src/presentation/components/CapturePreview/index.tsx`

**Step 1: Write failing test — capture screen**

```tsx
describe('CaptureScreen', () => {
  it('shows Take Photo button', () => {
    const { getByText } = renderWithStore(<CaptureScreen />);
    expect(getByText('Take Photo')).toBeTruthy();
  });

  it('shows Analyze button after photo is taken', () => {
    // Mock expo-image-picker to resolve with an image
    // After photo taken, Analyze button should appear
  });
});
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement capture screen**

Flow:
1. "Take Photo" → calls `ImagePicker.launchCameraAsync()` (same as spike)
2. Photo URI saved as a `Capture` entity (immutable)
3. Preview shown via `<CapturePreview>` component
4. "Retake" clears capture, allows re-capture
5. "Analyze" button appears after capture exists → navigates to results after dispatching `runAnalysis`

Port camera logic from spike's `App.tsx`:
```typescript
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ['images'],
  quality: 0.8,
});
```

**Step 4: Implement CapturePreview component**

Simple component: receives `imagePath`, renders `<Image>` with the path. Reusable.

**Step 5: Run tests — expect PASS**

**Step 6: Write test — capture immutability**

Verify that creating a capture and then modifying the result doesn't change the stored capture path.

**Step 7: Commit**

```bash
git add phase4/app/study/ phase4/src/presentation/components/CapturePreview/ phase4/src/domain/captures/
git commit -m "feat: implement capture screen with camera and preview (BDD Scenario 4)"
```

---

## Task 16: Analysis + Results Screen (BDD Scenarios 5-6)

**Files:**
- Modify: `app/study/[studyId]/session/[sessionId]/results.tsx`
- Create: `src/presentation/components/ResultCard/index.tsx`, `src/presentation/components/ResultCard/index.test.tsx`

**Step 1: Write failing test for ResultCard**

```tsx
// ABOUTME: Tests for result card display component
// ABOUTME: Verifies matched cards shown as checklist, unmatched flagged

import { render } from '@testing-library/react-native';
import { ResultCard } from './index';

describe('ResultCard', () => {
  it('renders matched cards as a checklist', () => {
    const matched = [
      { referenceText: 'To be free from pain', extractedText: 'To be free from pain' },
      { referenceText: 'Wild Card', extractedText: 'wild card' },
    ];
    const { getByText } = render(<ResultCard matched={matched} unmatched={[]} />);

    expect(getByText('To be free from pain')).toBeTruthy();
    expect(getByText('Wild Card')).toBeTruthy();
  });

  it('flags unmatched extractions for review', () => {
    const { getByText } = render(
      <ResultCard matched={[]} unmatched={['garbled text from OCR']} />,
    );
    expect(getByText('garbled text from OCR')).toBeTruthy();
    expect(getByText(/unmatched|review/i)).toBeTruthy();
  });
});
```

**Step 2: Run test — expect FAIL**

**Step 3: Implement ResultCard**

Renders two sections:
1. **Matched Cards** — checklist with checkmark icons (or text ✓), showing the reference card text
2. **Needs Review** — unmatched extractions in a distinct visual style (bordered, different background)

**Step 4: Run test — expect PASS**

**Step 5: Implement results screen**

The route screen:
1. Gets `sessionId` from params
2. Selects analyses for this session from store
3. If analysis is running: shows progress indicator with status text
4. If analysis is complete: gets result and renders `<ResultCard>`
5. If no analysis exists yet: shows "Analyze" button that dispatches `runAnalysis` thunk

The "Analyze" button wiring:
```typescript
const handleAnalyze = () => {
  const protocol = /* get from store via study */;
  const capture = /* get latest capture for this session */;
  const strategy = protocol.strategies[0];

  dispatch(runAnalysis({
    captureId: capture.id,
    sessionId,
    referenceCards: protocol.instruments[0].referenceItems,
    strategyId: strategy.id,
    prompt: strategy.prompt,
  }));
};
```

**Step 6: Write test — results screen with completed analysis**

```tsx
describe('ResultsScreen', () => {
  it('displays matched cards from completed analysis', () => {
    const preloadedState = {
      // ... study, session, capture, analysis (complete), result with matched cards
    };
    const { getByText } = renderWithStore(<ResultsScreen />, { preloadedState });
    expect(getByText('To be free from pain')).toBeTruthy();
  });

  it('shows progress indicator during analysis', () => {
    const preloadedState = {
      // ... analysis with status: 'running'
    };
    const { getByText } = renderWithStore(<ResultsScreen />, { preloadedState });
    expect(getByText(/analyzing|processing/i)).toBeTruthy();
  });
});
```

**Step 7: Run tests — expect PASS**

**Step 8: Commit**

```bash
git add phase4/src/presentation/components/ResultCard/ phase4/app/study/
git commit -m "feat: implement results screen with matched card checklist (BDD Scenarios 5-6)"
```

---

## Task 17: Storybook Setup

**Files:**
- Create: `.storybook/` config, story files

**Step 1: Install Storybook for React Native**

```bash
npx storybook@latest init --type react_native
```

Follow the Storybook React Native setup prompts.

**Step 2: Write ParticipantForm stories**

```tsx
// ABOUTME: Storybook stories for ParticipantForm
// ABOUTME: Visual smoke test — default and filled states

import { ParticipantForm } from './index';
import { GO_WISH_PROTOCOL } from '../../../go-wish/protocol';

export default { title: 'ParticipantForm', component: ParticipantForm };

export const Default = () => (
  <ParticipantForm
    schema={GO_WISH_PROTOCOL.participantSchema}
    codedId="P001"
    onSubmit={() => {}}
  />
);
```

**Step 3: Write ResultCard stories**

```tsx
// ABOUTME: Storybook stories for ResultCard
// ABOUTME: Visual smoke test — matched and unmatched states

import { ResultCard } from './index';

export default { title: 'ResultCard', component: ResultCard };

export const AllMatched = () => (
  <ResultCard
    matched={[
      { referenceText: 'To be free from pain', extractedText: 'To be free from pain' },
      { referenceText: 'Wild Card', extractedText: 'wild card' },
    ]}
    unmatched={[]}
  />
);

export const WithUnmatched = () => (
  <ResultCard
    matched={[{ referenceText: 'To pray', extractedText: 'To pray' }]}
    unmatched={['garbled text', 'another extraction']}
  />
);
```

**Step 4: Write CapturePreview story**

Default state with a placeholder image.

**Step 5: Verify Storybook loads**

Run: `npx storybook dev` (or however RN Storybook is started)
Expected: Stories render in the Storybook UI.

**Step 6: Commit**

```bash
git add phase4/.storybook/ phase4/src/presentation/components/
git commit -m "feat: add Storybook with stories for ParticipantForm, ResultCard, CapturePreview"
```

---

## Task 18: End-to-End Verification

**Not a code task — manual verification on device.**

**Step 1: Build iOS app**

```bash
npx expo prebuild --platform ios
npx expo run:ios
```

**Step 2: Ensure model files are on device**

Copy `Qwen3VL-2B-Instruct-Q4_K_M.gguf` and `mmproj-Qwen3VL-2B-Instruct-F16.gguf` to the app's Documents/models/ directory via iTunes File Sharing.

**Step 3: Walk through BDD scenarios**

1. Open app → Tap "New Study" → Study created with Go Wish protocol
2. Tap "Add Participant" → Fill demographics → P001 saved
3. Tap "New Session" → Select P001 → Session created
4. Tap "Take Photo" → Camera opens → Photo captured → Preview shown
5. Tap "Analyze" → Progress indicator ~12s → Results appear
6. View results → Matched cards shown as checklist → Unmatched extractions flagged

**Step 4: Run full test suite**

```bash
npx jest --coverage
```

Expected: All tests pass. Coverage report generated.

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 4 Go Wish tracer bullet"
```
