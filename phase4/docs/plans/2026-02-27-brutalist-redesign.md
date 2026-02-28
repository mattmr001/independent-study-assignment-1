# Brutalist Lo-Fi Redesign

**Date:** 2026-02-27
**Intent:** Make the app visually signal "research prototype" — not a product. Brutalist aesthetic with Commit Mono font throughout.

## Approach: Mono + Borders

Commit Mono as the only typeface. Sharp rectangles. High-contrast black-on-white. No decorative elements.

## Typography

Commit Mono loaded via `expo-font`. Two weights: Regular, Bold.

| Role             | Size  | Weight | Transform |
|------------------|-------|--------|-----------|
| Screen title     | 24px  | Bold   | none      |
| Section header   | 16px  | Bold   | uppercase |
| Body / list item | 14px  | Regular| none      |
| Label / caption  | 12px  | Regular| uppercase |
| Button text      | 14px  | Bold   | uppercase |

## Color Palette

| Token        | Value     | Use                              |
|--------------|-----------|----------------------------------|
| `background` | `#FFFFFF` | Screen background                |
| `text`       | `#000000` | All text, borders, icons         |
| `surface`    | `#FFFFFF` | Cards (differentiated by border) |
| `error`      | `#CC0000` | Error/unmatched states only      |

No greys for UI chrome. Hierarchy from border weight, font size, and spacing only.

## Borders & Shapes

- `borderRadius: 0` everywhere
- Interactive surfaces: `2px solid #000`
- Cards/sections: `1px solid #000`
- No shadows, no elevation

## Buttons

- Outlined: `2px solid #000`, transparent background, black uppercase text
- Pressed state: inverted (black fill, white text)

## Form Inputs

- `2px solid #000` border, no background tint
- Monospaced placeholder text
- Selected option chips: black fill, white text

## CapturePreview

- `2px solid #000` border, no border radius

## ResultCard

- Matched: `[✓]` prefix
- Unmatched: `[!]` prefix, `2px solid #CC0000` border
- No colored backgrounds

## Files Affected

- `src/presentation/theme/colors.ts` — simplify palette
- `src/presentation/theme/typography.ts` — new file, font definitions
- `app/_layout.tsx` — load Commit Mono font
- `app/index.tsx` — restyle home screen
- `app/study/[studyId]/index.tsx` — restyle study detail
- `app/study/[studyId]/add-participant.tsx` — minor (delegates to form)
- `app/study/[studyId]/session/[sessionId]/capture.tsx` — restyle
- `app/study/[studyId]/session/[sessionId]/results.tsx` — restyle
- `src/presentation/components/ParticipantForm/index.tsx` — restyle
- `src/presentation/components/ResultCard/index.tsx` — restyle
- `src/presentation/components/CapturePreview/index.tsx` — restyle
- Storybook stories — update if needed for visual consistency
