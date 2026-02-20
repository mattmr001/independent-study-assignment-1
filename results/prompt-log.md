# Prompt Log

## Run 0: Sanity Check

**Prompt name:** sanity-check
**Image:** 01-controlled.jpg
**Timestamp:** 20260220-154043

### Prompt text
What do you see in this image? Describe briefly.

### Raw output
Model described: 10 cards in 2 rows of 5, white with purple border on wooden surface. Listed 9 text cards + Wild Card with leaf design. All card texts correct.

### Assessment
- Model loaded without errors: yes
- Describes scene accurately: yes
- Load time: ~5s, total inference: ~4s
- No crashes or OOM

---

## Run 1: Card Reading + Spatial Grouping

**Prompt name:** spatial-grouping
**Prompt version:** v1
**Image:** 01-controlled.jpg
**Timestamp:** 20260220-154123

### Prompt text
Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON with this schema: {"piles": [{"label": "string (left/center/right or descriptive)", "cards": ["card text 1", "card text 2"]}]}

### Raw output
Valid JSON. Model created 10 piles — one per card, using each card's text as the pile label. Did not group cards into rows or spatial clusters.

### Scoring
- Cards correctly read: 10 / 10 visible (100%)
- Cards correctly grouped: 0 / 10 (model treated each card as its own pile)
- Hallucinated cards: 0
- Valid JSON: yes
- Error classifications:
  - SPATIAL × 10: All cards detected but no meaningful grouping. Model used card text as pile labels instead of spatial descriptors.

### Notes
The image shows a uniform 2×5 grid, not distinct piles. The prompt's "piles" framing may have confused the model — or the model simply can't infer grouping from a uniform grid. Text reading is perfect regardless.

---

## Run 2: Spatial Coordinates (Bounding Boxes)

**Prompt name:** bounding-boxes
**Prompt version:** v1
**Image:** 01-controlled.jpg
**Timestamp:** 20260220-154142

### Prompt text
Detect every card visible in this photo. For each card, return the text content and bounding box coordinates (x_min, y_min, x_max, y_max as 0-1 normalized). Return JSON with this schema: {"cards": [{"text": "card text", "bbox": {"x_min": 0.0, "y_min": 0.0, "x_max": 0.0, "y_max": 0.0}}]}

### Raw output
Valid JSON. 10 cards detected with pixel-value bounding boxes (not normalized 0-1 as requested).

Bounding box analysis:
- Top row: y_min=100, y_max=197 (consistent)
- Bottom row: y_min=597, y_max=697 (consistent)
- x values progress left to right in ~170px intervals
- Two distinct y-ranges correctly separate the two rows

### Scoring
- Cards correctly read: 10 / 10 visible (100%)
- Hallucinated cards: 0
- Valid JSON: yes
- Bounding boxes plausible: partially — values are pixel coordinates, not normalized 0-1 as requested, but spatial ordering is correct (left-to-right, top-to-bottom)
- Error classifications:
  - FORMAT × 1: Coordinates returned as pixel values instead of normalized 0-1

### Notes
Despite not following the normalization instruction, the model demonstrates genuine spatial awareness. The bounding box values correctly encode card positions relative to each other. The x/y values show left-to-right ordering within each row and clear vertical separation between the two rows.
