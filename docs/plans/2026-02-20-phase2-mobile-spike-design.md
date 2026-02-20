# Design: Phase 2 — On-Device Mobile Spike

**Date:** 2026-02-20
**Status:** Approved

---

## Goal

Prove Qwen3-VL-2B + llama.rn runs on iPhone 17 and produces output.

**Pass criteria:**
- Model loads without crashing
- `initMultimodal()` succeeds
- `completion()` returns any output

## Context

Phase 1 spike validated Qwen3-VL-2B reads Go Wish cards and handwritten sticky notes with 100% accuracy on desktop. Phase 2 answers: can this model run on-device at all?

**Device:** iPhone 17 base model (~8GB RAM)
**Approach:** Expo development build + llama.rn

## Architecture

```
┌─────────────────────────────────────────┐
│  Expo App (development build)           │
│  ┌───────────────────────────────────┐  │
│  │  Single Screen                    │  │
│  │  - "Run Inference" button         │  │
│  │  - Status text (loading/running)  │  │
│  │  - Output text area               │  │
│  └───────────────────────────────────┘  │
│                    │                    │
│                    ▼                    │
│  ┌───────────────────────────────────┐  │
│  │  llama.rn                         │  │
│  │  - initLlama() with model path    │  │
│  │  - initMultimodal() with mmproj   │  │
│  │  - completion() with image        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│  Bundled Assets                         │
│  - Qwen3VL-2B-Instruct-Q4_K_M.gguf     │
│  - mmproj-Qwen3VL-2B-Instruct-F16.gguf │
│  - test-image.jpg (from spike)          │
└─────────────────────────────────────────┘
```

## Project Structure

```
qwen-spike-mobile/
├── app/
│   └── index.tsx          # Single screen: button + output
├── lib/
│   └── inference.ts       # llama.rn wrapper: load model, run inference
├── assets/
│   └── test-image.jpg     # Bundled test image from spike
├── models/                # Bundled in app
│   ├── Qwen3VL-2B-Instruct-Q4_K_M.gguf
│   └── mmproj-Qwen3VL-2B-Instruct-F16.gguf
├── app.json
├── package.json
└── README.md
```

**Model bundling:** Models are bundled in the app (~2GB total). Keeps setup simple for a spike.

## Inference Flow

```
User taps "Run Inference"
         │
         ▼
┌─────────────────────────┐
│ Show "Loading model..." │
└─────────────────────────┘
         │
         ▼
initLlama({
  model: bundled .gguf path,
  n_ctx: 4096,
  n_gpu_layers: 99,  // use Metal
  ctx_shift: false   // required for vision
})
         │
         ▼
initMultimodal({
  path: bundled mmproj path
})
         │
         ▼
┌─────────────────────────┐
│ Show "Running..."       │
└─────────────────────────┘
         │
         ▼
completion({
  prompt: "Describe this image",
  image: bundled test-image.jpg
})
         │
         ▼
┌─────────────────────────┐
│ Display model output    │
│ + inference time        │
└─────────────────────────┘
```

**Prompt:** Simple "Describe this image" — testing if it runs, not accuracy.

**Metrics displayed:**
- Model load time
- Inference time
- Output text (or error message)

## Error Handling

Minimal — surface errors, don't swallow them.

| Error Type | Display |
|---|---|
| Model file missing | "Model not found at {path}" |
| Memory crash | App terminates — check Xcode logs |
| Inference failure | Show error.message in output area |
| mmproj init fails | "Multimodal init failed: {error}" |

No retry logic, no graceful degradation. Wrap the whole flow in try/catch and display whatever error surfaces.

## Out of Scope

- Camera capture
- Photo picker
- Accuracy validation (spike already did this)
- Latency optimization
- UI polish
- JSON output parsing
- Multiple test images

## If It Fails

| Failure | Mitigation |
|---|---|
| Memory crash | Try Q3_K quantization (~1.5GB smaller) |
| mmproj incompatible | Check llama.rn version, update llama.cpp bindings |
| Inference hangs | Reduce n_ctx, check Metal compatibility |
