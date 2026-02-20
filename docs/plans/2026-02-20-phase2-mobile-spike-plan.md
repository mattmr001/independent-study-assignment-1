# Phase 2 Mobile Spike Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prove Qwen3-VL-2B + llama.rn runs on iPhone 17 and produces any output.

**Architecture:** Expo development build with llama.rn native module. Single screen with one button that loads the model, runs inference on a bundled test image, and displays the result. Models bundled in app assets.

**Tech Stack:** Expo SDK 52+, llama.rn 0.9.x, TypeScript, React Native

---

## Task 1: Create Expo Project

**Files:**
- Create: `qwen-spike-mobile/` (project root)

**Step 1: Create new Expo project**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync
npx create-expo-app@latest qwen-spike-mobile --template blank-typescript
```

Expected: Project created with TypeScript template

**Step 2: Verify project runs in simulator**

Run:
```bash
cd qwen-spike-mobile
npx expo start --ios
```

Expected: App opens in iOS simulator with default Expo screen

**Step 3: Commit**

Run:
```bash
git add qwen-spike-mobile
git commit -m "scaffold: create Expo project for mobile spike"
```

---

## Task 2: Add llama.rn Dependency

**Files:**
- Modify: `qwen-spike-mobile/package.json`

**Step 1: Install llama.rn**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo install llama.rn
```

Expected: llama.rn added to package.json dependencies

**Step 2: Create development build config**

llama.rn is a native module — requires Expo development build, not Expo Go.

Run:
```bash
npx expo install expo-dev-client
```

Expected: expo-dev-client added to dependencies

**Step 3: Commit**

Run:
```bash
git add package.json package-lock.json
git commit -m "deps: add llama.rn and expo-dev-client"
```

---

## Task 3: Configure iOS Build

**Files:**
- Modify: `qwen-spike-mobile/app.json`
- Create: `qwen-spike-mobile/ios/` (via prebuild)

**Step 1: Update app.json for iOS**

Edit `qwen-spike-mobile/app.json`:

```json
{
  "expo": {
    "name": "qwen-spike-mobile",
    "slug": "qwen-spike-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.spike.qwenvl"
    },
    "plugins": [
      "expo-dev-client"
    ]
  }
}
```

**Step 2: Run prebuild to generate native project**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo prebuild --platform ios
```

Expected: `ios/` directory created with Xcode project

**Step 3: Verify Xcode project opens**

Run:
```bash
open ios/qwenspikemobile.xcworkspace
```

Expected: Xcode opens without errors

**Step 4: Commit**

Run:
```bash
git add app.json ios/
git commit -m "build: configure iOS prebuild for native modules"
```

---

## Task 4: Bundle Model Files

**Files:**
- Create: `qwen-spike-mobile/assets/models/` (directory)
- Modify: `qwen-spike-mobile/metro.config.js`
- Modify: `qwen-spike-mobile/app.json`

**Step 1: Create models directory and copy files**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
mkdir -p assets/models
```

Then manually copy these files into `assets/models/`:
- `Qwen3VL-2B-Instruct-Q4_K_M.gguf` (~1.03 GB)
- `mmproj-Qwen3VL-2B-Instruct-F16.gguf` (~781 MB)

Note: These files should already exist from Phase 1 spike. If not, download from HuggingFace `Qwen/Qwen3-VL-2B-Instruct-GGUF`.

**Step 2: Copy test image**

Run:
```bash
cp /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/test-images/01-controlled.jpg assets/test-image.jpg
```

**Step 3: Configure metro to handle .gguf files**

Create `qwen-spike-mobile/metro.config.js`:

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('gguf');

module.exports = config;
```

**Step 4: Add models to .gitignore**

Append to `qwen-spike-mobile/.gitignore`:

```
# Large model files - download separately
assets/models/*.gguf
```

**Step 5: Commit (without model files)**

Run:
```bash
git add metro.config.js .gitignore assets/test-image.jpg
git commit -m "config: add metro config for gguf assets, bundle test image"
```

---

## Task 5: Create Inference Wrapper

**Files:**
- Create: `qwen-spike-mobile/lib/inference.ts`

**Step 1: Create lib directory**

Run:
```bash
mkdir -p /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile/lib
```

**Step 2: Write inference wrapper**

Create `qwen-spike-mobile/lib/inference.ts`:

```typescript
import { initLlama, LlamaContext } from 'llama.rn';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export interface InferenceResult {
  output: string;
  modelLoadTimeMs: number;
  inferenceTimeMs: number;
}

export interface InferenceError {
  stage: 'model_load' | 'multimodal_init' | 'inference';
  message: string;
}

let context: LlamaContext | null = null;

async function getAssetPath(asset: Asset): Promise<string> {
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
}

export async function runInference(
  onStatus: (status: string) => void
): Promise<InferenceResult> {
  const modelLoadStart = Date.now();

  onStatus('Loading model...');

  // Load model asset
  const modelAsset = Asset.fromModule(
    require('../assets/models/Qwen3VL-2B-Instruct-Q4_K_M.gguf')
  );
  const modelPath = await getAssetPath(modelAsset);

  // Load mmproj asset
  const mmprojAsset = Asset.fromModule(
    require('../assets/models/mmproj-Qwen3VL-2B-Instruct-F16.gguf')
  );
  const mmprojPath = await getAssetPath(mmprojAsset);

  // Load test image asset
  const imageAsset = Asset.fromModule(require('../assets/test-image.jpg'));
  const imagePath = await getAssetPath(imageAsset);

  try {
    // Initialize llama context
    context = await initLlama({
      model: modelPath,
      n_ctx: 4096,
      n_gpu_layers: 99,
      ctx_shift: false,
    });

    onStatus('Initializing multimodal...');

    // Initialize multimodal support
    await context.initMultimodal({ path: mmprojPath });

    const modelLoadTimeMs = Date.now() - modelLoadStart;

    onStatus('Running inference...');

    const inferenceStart = Date.now();

    // Run completion with image
    const result = await context.completion({
      prompt: 'Describe this image.',
      image: imagePath,
    });

    const inferenceTimeMs = Date.now() - inferenceStart;

    return {
      output: result.text,
      modelLoadTimeMs,
      inferenceTimeMs,
    };
  } catch (error) {
    const err = error as Error;
    throw {
      stage: context ? 'inference' : 'model_load',
      message: err.message || String(error),
    } as InferenceError;
  }
}

export async function releaseModel(): Promise<void> {
  if (context) {
    await context.release();
    context = null;
  }
}
```

**Step 3: Install expo-asset and expo-file-system**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo install expo-asset expo-file-system
```

**Step 4: Commit**

Run:
```bash
git add lib/inference.ts package.json package-lock.json
git commit -m "feat: add inference wrapper for llama.rn"
```

---

## Task 6: Create UI Screen

**Files:**
- Modify: `qwen-spike-mobile/app/index.tsx`

**Step 1: Write the main screen**

Replace `qwen-spike-mobile/app/index.tsx` with:

```typescript
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { runInference, releaseModel, InferenceResult, InferenceError } from '../lib/inference';

export default function Index() {
  const [status, setStatus] = useState<string>('Ready');
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<InferenceError | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunInference = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const inferenceResult = await runInference(setStatus);
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qwen3-VL Mobile Spike</Text>

      <Pressable
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={handleRunInference}
        disabled={isRunning}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  output: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
  },
  errorTitle: {
    color: '#c00',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#c00',
  },
  resultBox: {
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultOutput: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 24,
  },
});
```

**Step 2: Commit**

Run:
```bash
git add app/index.tsx
git commit -m "feat: add single-screen UI for inference spike"
```

---

## Task 7: Build and Run on Device

**Files:**
- None (build/test task)

**Step 1: Build development client for iOS**

Run:
```bash
cd /Users/mattmr/Documents/obsidian-vault/courses/independent-study-1/assignment-1/_code.nosync/qwen-spike-mobile
npx expo run:ios --device
```

This will:
1. Compile the native iOS project
2. Install on connected iPhone
3. Launch the app

Expected: App installs and shows "Run Inference" button

**Step 2: Run inference test**

1. Tap "Run Inference" button
2. Watch status change: Loading model → Initializing multimodal → Running inference
3. Wait for result or error

**Pass criteria:**
- Model loads without crashing
- `initMultimodal()` succeeds
- `completion()` returns any output

**Step 3: Document result**

If pass: Create `results/phase2-evaluation-report.md` documenting timings and output.

If fail: Note error message and stage where it failed. Check Xcode console logs for memory/crash details.

**Step 4: Commit results**

Run:
```bash
git add results/
git commit -m "spike: Phase 2 mobile inference test results"
```

---

## Fallback: Memory Issues

If the app crashes due to memory pressure:

**Option A: Try smaller quantization**

Download `Qwen3VL-2B-Instruct-Q3_K_M.gguf` (~700MB smaller) and replace the Q4 model.

**Option B: Reduce context**

In `lib/inference.ts`, reduce `n_ctx: 4096` to `n_ctx: 2048`.

**Option C: Disable GPU layers**

In `lib/inference.ts`, change `n_gpu_layers: 99` to `n_gpu_layers: 0` (CPU only, slower but less memory).

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Create Expo project |
| 2 | Add llama.rn dependency |
| 3 | Configure iOS build |
| 4 | Bundle model files |
| 5 | Create inference wrapper |
| 6 | Create UI screen |
| 7 | Build and run on device |
