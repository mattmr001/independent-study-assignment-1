# Brutalist Lo-Fi Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restyle the entire app with Commit Mono font, sharp borders, and high-contrast black-on-white to signal "research prototype."

**Architecture:** Replace the existing `colors.ts` theme, add a new `typography.ts` with font family constants, load Commit Mono via `expo-font` in the root layout, then update every screen and component's StyleSheet. No structural/logic changes — purely visual.

**Tech Stack:** expo-font, Commit Mono OTF files, React Native StyleSheet

---

### Task 1: Add Commit Mono font assets and install expo-font

**Files:**
- Create: `assets/fonts/CommitMono-Regular.otf` (copy from ~/Library/Fonts/CommitMono-400-Regular.otf)
- Create: `assets/fonts/CommitMono-Bold.otf` (copy from ~/Library/Fonts/CommitMono-700-Regular.otf)
- Modify: `package.json`

**Step 1: Create assets directory and copy font files**

```bash
mkdir -p assets/fonts
cp ~/Library/Fonts/CommitMono-400-Regular.otf assets/fonts/CommitMono-Regular.otf
cp ~/Library/Fonts/CommitMono-700-Regular.otf assets/fonts/CommitMono-Bold.otf
```

**Step 2: Install expo-font**

```bash
npx expo install expo-font
```

**Step 3: Commit**

```bash
git add assets/fonts/ package.json package-lock.json
git commit -m "chore: add Commit Mono font assets and expo-font"
```

---

### Task 2: Create typography theme and update colors

**Files:**
- Create: `src/presentation/theme/typography.ts`
- Modify: `src/presentation/theme/colors.ts`

**Step 1: Create typography.ts**

```typescript
// ABOUTME: Typography constants for Commit Mono brutalist theme
// ABOUTME: Single monospaced typeface at defined size/weight scales

export const fonts = {
  regular: 'CommitMono-Regular',
  bold: 'CommitMono-Bold',
} as const;

export const typography = {
  title: { fontFamily: fonts.bold, fontSize: 24 },
  sectionHeader: { fontFamily: fonts.bold, fontSize: 16, textTransform: 'uppercase' as const },
  body: { fontFamily: fonts.regular, fontSize: 14 },
  label: { fontFamily: fonts.regular, fontSize: 12, textTransform: 'uppercase' as const },
  button: { fontFamily: fonts.bold, fontSize: 14, textTransform: 'uppercase' as const },
} as const;
```

**Step 2: Simplify colors.ts**

Replace entire file with:

```typescript
// ABOUTME: High-contrast black-on-white palette for brutalist prototype aesthetic
// ABOUTME: Minimal tokens — hierarchy comes from borders and typography, not color

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  border: '#000000',
  error: '#CC0000',
} as const;
```

**Step 3: Run tests to check for compilation errors from removed color tokens**

```bash
npx jest --no-coverage 2>&1
```

Expected: Some tests may fail due to referencing removed tokens like `colors.textPrimary`, `colors.accent`, `colors.white`, etc. Note which files need updating — they'll be fixed in subsequent tasks as each screen is restyled.

**Step 4: Commit**

```bash
git add src/presentation/theme/typography.ts src/presentation/theme/colors.ts
git commit -m "feat: add brutalist typography and simplify color palette"
```

---

### Task 3: Load fonts in root layout

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Update _layout.tsx to load Commit Mono**

Replace the file content with:

```typescript
// ABOUTME: Root layout — Redux Provider with persistence and navigation
// ABOUTME: Loads Commit Mono font before rendering app

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '@reduxjs/toolkit';
import { Text } from 'react-native';
import { useFonts } from 'expo-font';
import { persistedReducer, persistStore } from '../src/data/persistence';
import { ThunkExtra } from '../src/data/store';
import * as inferenceService from '../src/data/inference/service';

const extra: ThunkExtra = { inferenceService };

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: extra },
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'CommitMono-Regular': require('../assets/fonts/CommitMono-Regular.otf'),
    'CommitMono-Bold': require('../assets/fonts/CommitMono-Bold.otf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}
```

**Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat: load Commit Mono font in root layout"
```

---

### Task 4: Restyle HomeScreen

**Files:**
- Modify: `app/index.tsx`

**Step 1: Update imports and styles**

Replace `colors` import and add typography import:
```typescript
import { colors } from '../src/presentation/theme/colors';
import { typography, fonts } from '../src/presentation/theme/typography';
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.label, color: colors.text, textAlign: 'center', marginBottom: 24 },
  studyCard: {
    backgroundColor: colors.surface, padding: 16, borderRadius: 0,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  studyName: { ...typography.body, fontFamily: fonts.bold, color: colors.text },
  studyDate: { ...typography.label, color: colors.text, marginTop: 4 },
  empty: { ...typography.body, textAlign: 'center', color: colors.text, marginTop: 48 },
  button: {
    backgroundColor: colors.background, padding: 16, borderRadius: 0,
    alignItems: 'center', marginTop: 16, borderWidth: 2, borderColor: colors.border,
  },
  buttonText: { ...typography.button, color: colors.text },
  storybookLink: { alignItems: 'center', marginTop: 12, padding: 8 },
  storybookText: { ...typography.label, color: colors.text },
});
```

**Step 2: Run tests**

```bash
npx jest --no-coverage -- app/index
```

Expected: Existing home screen test should still pass (tests check text content, not styles).

**Step 3: Commit**

```bash
git add app/index.tsx
git commit -m "feat: restyle home screen with brutalist theme"
```

---

### Task 5: Restyle StudyDetailScreen

**Files:**
- Modify: `app/study/[studyId]/index.tsx`

**Step 1: Update imports and styles**

Add typography import:
```typescript
import { typography, fonts } from '../../../src/presentation/theme/typography';
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  sectionHeader: { ...typography.sectionHeader, color: colors.text, marginTop: 16, marginBottom: 8 },
  listItem: {
    backgroundColor: colors.surface, padding: 12, borderRadius: 0,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  listItemText: { ...typography.body, color: colors.text },
  empty: { ...typography.body, color: colors.text, marginBottom: 8 },
  button: {
    backgroundColor: colors.background, padding: 14, borderRadius: 0,
    alignItems: 'center', marginTop: 8, marginBottom: 16, borderWidth: 2, borderColor: colors.border,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...typography.button, color: colors.text },
  error: { ...typography.body, color: colors.error, textAlign: 'center' },
});
```

**Step 2: Run tests**

```bash
npx jest --no-coverage -- "app/study/\\[studyId\\]/index"
```

**Step 3: Commit**

```bash
git add app/study/\\[studyId\\]/index.tsx
git commit -m "feat: restyle study detail screen with brutalist theme"
```

---

### Task 6: Restyle ParticipantForm component

**Files:**
- Modify: `src/presentation/components/ParticipantForm/index.tsx`

**Step 1: Update imports and styles**

Add typography import:
```typescript
import { typography, fonts } from '../../theme/typography';
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  codedId: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  fieldContainer: { marginBottom: 16 },
  label: { ...typography.sectionHeader, color: colors.text, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, padding: 12, borderRadius: 0,
    borderWidth: 2, borderColor: colors.border, ...typography.body, color: colors.text,
  },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 0,
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface,
  },
  optionSelected: { backgroundColor: colors.text, borderColor: colors.text },
  optionText: { ...typography.body, color: colors.text },
  optionTextSelected: { color: colors.background },
  saveButton: {
    backgroundColor: colors.background, padding: 16, borderRadius: 0,
    alignItems: 'center', marginTop: 24, marginBottom: 48, borderWidth: 2, borderColor: colors.border,
  },
  saveButtonText: { ...typography.button, color: colors.text },
});
```

**Step 2: Run tests**

```bash
npx jest --no-coverage -- ParticipantForm
```

**Step 3: Commit**

```bash
git add src/presentation/components/ParticipantForm/index.tsx
git commit -m "feat: restyle participant form with brutalist theme"
```

---

### Task 7: Restyle CapturePreview and CaptureScreen

**Files:**
- Modify: `src/presentation/components/CapturePreview/index.tsx`
- Modify: `app/study/[studyId]/session/[sessionId]/capture.tsx`

**Step 1: Update CapturePreview styles**

```typescript
const styles = StyleSheet.create({
  image: { width: '100%', height: 300, borderRadius: 0, borderWidth: 2, borderColor: '#000000' },
});
```

Note: CapturePreview doesn't import colors since it only needs a single border style. Using literal `#000000` to avoid importing the theme for one value.

**Step 2: Update capture.tsx imports and styles**

Add typography import:
```typescript
import { typography } from '../../../../../src/presentation/theme/typography';
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  button: {
    flex: 1, backgroundColor: colors.background, padding: 16, borderRadius: 0,
    alignItems: 'center', borderWidth: 2, borderColor: colors.border,
  },
  analyzeButton: {},
  buttonText: { ...typography.button, color: colors.text },
  captureCount: { ...typography.label, textAlign: 'center', color: colors.text, marginTop: 12 },
});
```

Note: `analyzeButton` is now empty since both buttons share the same outlined style. Kept as empty object so the `style={[styles.button, styles.analyzeButton]}` pattern doesn't need to change.

**Step 3: Run tests**

```bash
npx jest --no-coverage -- capture
```

**Step 4: Commit**

```bash
git add src/presentation/components/CapturePreview/index.tsx app/study/\\[studyId\\]/session/\\[sessionId\\]/capture.tsx
git commit -m "feat: restyle capture screen and preview with brutalist theme"
```

---

### Task 8: Restyle ResultCard and ResultsScreen

**Files:**
- Modify: `src/presentation/components/ResultCard/index.tsx`
- Modify: `app/study/[studyId]/session/[sessionId]/results.tsx`

**Step 1: Update ResultCard imports and styles**

Add typography import:
```typescript
import { typography, fonts } from '../../theme/typography';
```

Update the matched/unmatched text prefixes in the JSX:
- Change `✓` to `[✓]`
- Add `[!]` prefix to unmatched items

Replace the checkmark text:
```tsx
<Text style={styles.checkmark}>[✓]</Text>
```

Add prefix to unmatched items — change:
```tsx
<Text style={styles.unmatchedText}>{text}</Text>
```
to:
```tsx
<Text style={styles.unmatchedText}>[!] {text}</Text>
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { padding: 16 },
  summary: { ...typography.label, color: colors.text, textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { ...typography.sectionHeader, color: colors.text, marginBottom: 8 },
  sectionHeaderWarning: { ...typography.sectionHeader, color: colors.error, marginBottom: 8 },
  matchedItem: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    backgroundColor: colors.surface, borderRadius: 0, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  checkmark: { ...typography.body, fontFamily: fonts.bold, color: colors.text, marginRight: 8 },
  cardText: { ...typography.body, color: colors.text, flex: 1 },
  unmatchedItem: {
    padding: 10, backgroundColor: colors.surface, borderRadius: 0, marginBottom: 6,
    borderWidth: 2, borderColor: colors.error,
  },
  unmatchedText: { ...typography.body, color: colors.error },
});
```

**Step 2: Update results.tsx imports and styles**

Add typography import:
```typescript
import { typography } from '../../../../../src/presentation/theme/typography';
```

Replace the entire `styles` object:

```typescript
const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  centered: { alignItems: 'center', marginTop: 48 },
  info: { ...typography.body, color: colors.text, marginTop: 16, marginBottom: 16 },
  button: {
    backgroundColor: colors.background, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 0, borderWidth: 2, borderColor: colors.border,
  },
  buttonText: { ...typography.button, color: colors.text },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: 16 },
});
```

Also update the `ActivityIndicator` color from `colors.accent` to `colors.text`:
```tsx
<ActivityIndicator size="large" color={colors.text} />
```

**Step 3: Run tests**

```bash
npx jest --no-coverage -- "ResultCard|results"
```

The ResultCard test checks for `✓` text — update the test assertion if needed to match `[✓]`.

**Step 4: Commit**

```bash
git add src/presentation/components/ResultCard/index.tsx app/study/\\[studyId\\]/session/\\[sessionId\\]/results.tsx
git commit -m "feat: restyle results screen and result card with brutalist theme"
```

---

### Task 9: Update Storybook stories for visual consistency

**Files:**
- Modify: `src/presentation/components/ParticipantForm/ParticipantForm.stories.tsx`
- Modify: `src/presentation/components/ResultCard/ResultCard.stories.tsx`
- Modify: `src/presentation/components/CapturePreview/CapturePreview.stories.tsx`

**Step 1:** Review each story file. The stories themselves pass props to components, not styles, so they should already reflect the new look without code changes. However, if any story wraps the component in a styled container, update it to use `colors.background` (`#FFFFFF`).

**Step 2: Regenerate storybook requires**

```bash
npx sb-rn-get-stories
```

**Step 3: Run full test suite to confirm nothing is broken**

```bash
npx jest --no-coverage
```

Expected: All 56 tests pass.

**Step 4: Commit if any stories changed**

```bash
git add src/presentation/components/*/\*.stories.tsx .rnstorybook/storybook.requires.ts
git commit -m "chore: update storybook stories for brutalist theme"
```

---

### Task 10: Visual verification and Maestro E2E

**Step 1: Start Expo dev server**

```bash
npx expo start --ios
```

**Step 2: Visually verify each screen**

Take screenshots of:
- Home screen (should show Commit Mono, sharp borders, outlined buttons)
- Study detail screen
- Add participant form
- Capture screen

Verify:
- All text is monospaced (Commit Mono)
- No rounded corners anywhere
- Buttons are outlined (black border, white fill) not filled
- High contrast black on white
- No grey mid-tones in UI chrome

**Step 3: Run Maestro E2E tests**

```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk"
~/.maestro/bin/maestro test .maestro/app-launches.yaml
~/.maestro/bin/maestro test .maestro/create-study-flow.yaml
```

Expected: Both pass. E2E tests check text content and tappability, not visual styling, so they should pass unchanged.

**Step 4: Start Storybook and verify component stories**

```bash
EXPO_PUBLIC_STORYBOOK_ENABLED=true npx expo start --ios
```

Navigate to each story and verify the brutalist styling renders correctly.

**Step 5: Final commit if any fixes were needed**

```bash
git add -p  # review changes
git commit -m "fix: visual adjustments from brutalist theme verification"
```
