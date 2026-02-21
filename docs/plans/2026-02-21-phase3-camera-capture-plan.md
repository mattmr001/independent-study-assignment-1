# Phase 3 Camera Capture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add live camera capture so inference runs on photos taken with the phone camera.

**Architecture:** Use expo-image-picker to launch system camera, capture photo, pass URI to existing inference wrapper. Single-screen UI with photo preview.

**Tech Stack:** Expo SDK 54, expo-image-picker, llama.rn, TypeScript

---

## Task 1: Add expo-image-picker Dependency

**Files:**
- Modify: `qwen-spike-mobile/package.json`
- Modify: `qwen-spike-mobile/app.json`

**Step 1: Install expo-image-picker**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo install expo-image-picker
```

Expected: Package added to package.json

**Step 2: Add camera permission to app.json**

Edit `qwen-spike-mobile/app.json` to add camera permission in ios.infoPlist:

```json
{
  "expo": {
    "ios": {
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
      "expo-image-picker"
    ]
  }
}
```

**Step 3: Commit**

Run:
```bash
git add package.json package-lock.json app.json
git commit -m "deps: add expo-image-picker for camera capture"
```

---

## Task 2: Update Inference Wrapper to Accept Image Path

**Files:**
- Modify: `qwen-spike-mobile/lib/inference.ts`

**Step 1: Change runInference signature**

Edit `qwen-spike-mobile/lib/inference.ts`:

Change the function signature from:
```typescript
export async function runInference(
  onStatus: (status: string) => void
): Promise<InferenceResult> {
```

To:
```typescript
export async function runInference(
  imagePath: string,
  onStatus: (status: string) => void
): Promise<InferenceResult> {
```

**Step 2: Remove hardcoded image loading**

Remove these lines (around lines 75-79):
```typescript
  // Load test image asset (small enough for Metro)
  const imageAsset = Asset.fromModule(require('../assets/test-image.jpg'));
  const imageUri = await getAssetPath(imageAsset);
  const imagePath = uriToPath(imageUri);
  console.log('Image path:', imagePath);
```

**Step 3: Convert passed imagePath to raw path**

Add after model loading, before context initialization:
```typescript
  const rawImagePath = uriToPath(imagePath);
  console.log('Image path:', rawImagePath);
```

**Step 4: Update completion call to use rawImagePath**

Change the completion call to use `rawImagePath`:
```typescript
    const result = await context.completion({
      prompt: 'Describe this image.',
      media_paths: [rawImagePath],
    });
```

**Step 5: Remove unused Asset import**

Remove `Asset` from imports since it's no longer needed:
```typescript
import { initLlama, LlamaContext } from 'llama.rn';
import * as FileSystem from 'expo-file-system/legacy';
```

**Step 6: Remove unused getAssetPath function**

Delete the `getAssetPath` function (lines 47-50):
```typescript
async function getAssetPath(asset: Asset): Promise<string> {
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
}
```

**Step 7: Commit**

Run:
```bash
git add lib/inference.ts
git commit -m "refactor: inference accepts image path parameter"
```

---

## Task 3: Update App.tsx with Camera Capture

**Files:**
- Modify: `qwen-spike-mobile/App.tsx`

**Step 1: Add imports**

Add at top of file:
```typescript
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
```

**Step 2: Add state for captured image**

Add new state variable after existing state declarations:
```typescript
const [imageUri, setImageUri] = useState<string | null>(null);
```

**Step 3: Add camera launch function**

Add before `handleRunInference`:
```typescript
const handleTakePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    setError({
      stage: 'inference',
      message: 'Camera permission denied',
    });
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setImageUri(result.assets[0].uri);
    setResult(null);
    setError(null);
    setStatus('Photo captured');
  }
};
```

**Step 4: Update handleRunInference to use captured image**

Change `handleRunInference` to pass the image URI:
```typescript
const handleRunInference = async () => {
  if (!imageUri) return;

  setIsRunning(true);
  setResult(null);
  setError(null);

  try {
    const inferenceResult = await runInference(imageUri, setStatus);
    setResult(inferenceResult);
    setStatus('Complete');
  } catch (err) {
    setError(err as InferenceError);
    setStatus('Failed');
  } finally {
    setIsRunning(false);
    await releaseModel();
  }
};
```

**Step 5: Update JSX with camera button and preview**

Replace the return statement JSX:
```typescript
return (
  <View style={styles.container}>
    <Text style={styles.title}>Qwen3-VL Mobile Spike</Text>

    <Pressable
      style={styles.button}
      onPress={handleTakePhoto}
    >
      <Text style={styles.buttonText}>Take Photo</Text>
    </Pressable>

    {imageUri && (
      <Image
        source={{ uri: imageUri }}
        style={styles.preview}
        resizeMode="contain"
      />
    )}

    <Pressable
      style={[styles.button, (!imageUri || isRunning) && styles.buttonDisabled]}
      onPress={handleRunInference}
      disabled={!imageUri || isRunning}
    >
      {isRunning ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Run Inference</Text>
      )}
    </Pressable>

    <Text style={styles.status}>Status: {status}</Text>

    <ScrollView style={styles.output}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Error ({error.stage})</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>
            Model load: {result.modelLoadTimeMs}ms
          </Text>
          <Text style={styles.resultLabel}>
            Inference: {result.inferenceTimeMs}ms
          </Text>
          <Text style={styles.resultOutput}>{result.output}</Text>
        </View>
      )}
    </ScrollView>
  </View>
);
```

**Step 6: Add preview style**

Add to StyleSheet:
```typescript
preview: {
  width: '100%',
  height: 200,
  borderRadius: 8,
  marginBottom: 16,
  backgroundColor: '#e0e0e0',
},
```

**Step 7: Commit**

Run:
```bash
git add App.tsx
git commit -m "feat: add camera capture UI"
```

---

## Task 4: Rebuild and Test on Device

**Files:**
- None (build/test task)

**Step 1: Rebuild iOS app**

The native modules changed (expo-image-picker), so rebuild is required:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo prebuild --platform ios --clean
npx expo run:ios --device
```

**Step 2: Test camera capture flow**

1. Tap "Take Photo"
2. Grant camera permission when prompted
3. Take a photo of Go Wish cards or sticky notes
4. Verify preview appears in app
5. Tap "Run Inference"
6. Wait for results (~12 seconds)
7. Verify output describes the photographed items

**Step 3: Document results**

Note in results folder:
- Did inference complete?
- How accurate was the text reading?
- Any errors or unexpected behavior?

**Step 4: Commit any fixes**

If fixes were needed:
```bash
git add -A
git commit -m "fix: camera capture issues from testing"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Add expo-image-picker dependency |
| 2 | Update inference wrapper to accept image path |
| 3 | Update App.tsx with camera UI |
| 4 | Rebuild and test on device |
