# Design: Phase 3 — Camera Capture

**Date:** 2026-02-21
**Status:** Approved

---

## Goal

Add live camera capture so inference can run on photos taken with the phone camera instead of a bundled test image.

## Approach

Use `expo-image-picker` to launch the system camera. User takes a photo, returns to app, sees preview, then runs inference.

## Flow

```
Tap "Take Photo" → System camera opens → Capture → Return to app →
Show preview → Tap "Run Inference" → Results displayed
```

## Changes

| File | Change |
|------|--------|
| `App.tsx` | Add "Take Photo" button, image preview, pass captured image path to inference |
| `lib/inference.ts` | Accept image path as parameter instead of hardcoded asset |
| `app.json` | Add `NSCameraUsageDescription` for camera permission |

## UI

Single screen (no navigation):
- "Take Photo" button at top
- Image preview area (shows captured photo or placeholder)
- "Run Inference" button (disabled until photo taken)
- Status + results area (unchanged from Phase 2)

## Dependencies

- `expo-image-picker` — launches system camera, returns captured image URI

## Out of Scope

- Photo library picker
- Multiple photos
- Image cropping/editing
- Saving results
