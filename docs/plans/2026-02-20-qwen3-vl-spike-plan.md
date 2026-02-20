# Qwen3-VL-2B Desktop Spike Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Evaluate whether Qwen3-VL-2B can read Go Wish card text and return spatially-aware structured JSON from a table-distance photograph, running on desktop via llama-mtmd-cli.

**Architecture:** No application code. This is a model evaluation spike: run a quantized VLM against test photographs using CLI tools, capture output, score against ground truth. The deliverable is an evaluation report with accuracy metrics, failure analysis, and a go/no-go decision for Phase 2 (on-device testing).

**Tech Stack:** llama.cpp (llama-mtmd-cli), Qwen3-VL-2B-Instruct Q4_K_M GGUF, shell scripts for reproducible runs.

**Source documents:**
- Design: `docs/plans/2026-02-20-qwen3-vl-spike-design.md`
- RTD decomposition: `docs/plans/2026-02-20-qwen3-vl-spike-rtd-decomposition.md`

**TDD note:** This is a model evaluation spike, not a code project. The TDD analogy is: define pass/fail criteria (Task 3) before running the experiment (Tasks 6-10), then evaluate against those criteria (Task 11). No application code is written.

**Human-in-the-loop tasks:** Tasks 5 and 6 require Jesse to provide test photographs. The plan will block there until images are available.

---

### Task 1: Set up project scaffolding

**Files:**
- Create: `.gitignore`
- Create: `models/.gitkeep` (directory only; contents gitignored)
- Create: `test-images/.gitkeep` (directory only; tracked for small JPGs)
- Create: `results/.gitkeep`
- Create: `scripts/.gitkeep`

**Step 1: Create .gitignore**

```gitignore
# Model files (large binaries)
models/*.gguf

# macOS
.DS_Store

# llama.cpp build artifacts (if built from source)
llama.cpp/
```

**Step 2: Create directory structure**

Run:
```bash
mkdir -p models test-images results scripts
touch models/.gitkeep test-images/.gitkeep results/.gitkeep scripts/.gitkeep
```

**Step 3: Commit**

```bash
git add .gitignore models/.gitkeep test-images/.gitkeep results/.gitkeep scripts/.gitkeep
git commit -m "scaffold: add project structure for spike"
```

---

### Task 2: Install llama.cpp

The design doc states llama-mtmd-cli is "already installed" — it is not currently on the system. We need the `llama-mtmd-cli` binary, which is the multimodal inference CLI from llama.cpp.

**Step 1: Try brew install**

Run:
```bash
brew install llama.cpp
```

**Step 2: Verify llama-mtmd-cli exists**

Run:
```bash
llama-mtmd-cli --version
```

Expected: version string output.

If `llama-mtmd-cli` is not in the brew formula (some versions ship only `llama-cli` and `llama-server`), fall back to building from source:

**Step 2b (fallback): Build from source**

Run:
```bash
cd /tmp
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release -j$(sysctl -n hw.ncpu)
```

Then symlink or copy:
```bash
cp /tmp/llama.cpp/build/bin/llama-mtmd-cli /usr/local/bin/
```

**Step 3: Verify**

Run:
```bash
llama-mtmd-cli --help 2>&1 | head -5
```

Expected: usage help text mentioning `--image` and `--mmproj` flags.

---

### Task 3: Create evaluation framework

This task defines pass/fail criteria BEFORE running the model — the "test" we write before the "implementation." Based on RTD decomposition tasks T-P1 and T-P5.

**Files:**
- Create: `results/evaluation-framework.md`

**Step 1: Write the evaluation framework**

```markdown
# Spike Evaluation Framework

## Pass/Fail Thresholds (T-P1)

| Criterion | Pass threshold | Measurement |
|---|---|---|
| Card text reading | ≥80% of visible cards correctly read | Exact or near-exact text match against ground truth |
| Spatial grouping | ≥70% of cards assigned to correct pile | Compare model's pile assignment to actual pile |
| Hallucination | Zero fabricated cards | Any card text not present in the photo = hallucination |
| Valid JSON | Valid JSON in ≥2 of 3 runs per prompt | Parseable with `jq` or `python -m json.tool` |

**Overall pass:** Card text reading AND hallucination thresholds met. Spatial grouping and JSON validity are secondary signals.

**Overall fail:** <60% card text reading OR any hallucinated cards across multiple runs.

**Ambiguous zone:** 60-79% card text reading — warrants prompt iteration before declaring pass/fail.

## Failure Taxonomy (T-P5)

Every error in model output is classified into exactly one category:

| Code | Category | Definition | Example |
|---|---|---|---|
| OCR | Text recognition error | Card detected but text wrong | "To be free from pan" instead of "To be free from pain" |
| MISS | Detection miss | Card visible in photo but not in output | Card clearly visible, model doesn't mention it |
| SPATIAL | Spatial grouping error | Card found with correct text but assigned to wrong pile | Card in left pile reported as center pile |
| HALLUC | Hallucination | Card in output that doesn't exist in photo | Model reports a card not visible in the image |
| FORMAT | Format error | Output is not valid JSON or doesn't match schema | Missing closing brace, wrong field names |
| PARTIAL | Partial read | Card detected, text partially correct | "To have my financial" instead of "To have my financial affairs in order" |

## Scoring Procedure

For each run (1 prompt × 1 image):
1. Parse model output (or note FORMAT error if unparseable)
2. Match each model-reported card to a ground truth card (exact or fuzzy text match)
3. Classify unmatched model cards as HALLUC
4. Classify unmatched ground truth cards as MISS
5. For matched cards, check text accuracy (OCR/PARTIAL) and pile assignment (SPATIAL)
6. Calculate: cards_correct / cards_visible = accuracy %
```

**Step 2: Commit**

```bash
git add results/evaluation-framework.md
git commit -m "spike: add evaluation framework with thresholds and failure taxonomy"
```

---

### Task 4: Download Qwen3-VL-2B model files

**Files:**
- Download to: `models/Qwen3VL-2B-Instruct-Q4_K_M.gguf` (~1.6GB)
- Download to: `models/mmproj-Qwen3VL-2B-Instruct-F16.gguf` (~0.5GB)

**Step 1: Install huggingface-cli if needed**

Run:
```bash
pip install huggingface-hub
```

**Step 2: Download model files**

Run:
```bash
huggingface-cli download Qwen/Qwen3-VL-2B-Instruct-GGUF \
  Qwen3VL-2B-Instruct-Q4_K_M.gguf \
  mmproj-Qwen3VL-2B-Instruct-F16.gguf \
  --local-dir models/
```

Expected: Two `.gguf` files in `models/`. Total ~2.1GB.

**Step 3: Verify files exist and are reasonable size**

Run:
```bash
ls -lh models/*.gguf
```

Expected: Two files, ~1.6GB and ~0.5GB respectively.

---

### Task 5: Prepare test images — REQUIRES JESSE

Jesse provides photographs. The plan blocks here until images are available.

**Required images (T-P2, T-P6, T-I3):**

| Image | Filename | Conditions | Purpose |
|---|---|---|---|
| Controlled | `test-images/01-controlled.jpg` | Well-lit, top-down, cards clearly separated into piles | Baseline best-case |
| Angled | `test-images/02-angled.jpg` | Taken at ~45° angle, some partial card overlap | Realistic capture angle |
| Realistic | `test-images/03-realistic.jpg` | Arm's length, slight angle, as if facilitator snapped quickly | T-P6: real-world conditions |
| Non-Go-Wish | `test-images/04-non-gowish.jpg` | Sticky notes or other co-design artifacts on a table | T-I3: early generalization signal |

**Step 1: Place images in test-images/ directory**

Jesse copies or moves photos into `test-images/` with the filenames above.

**Step 2: Document image conditions**

Create `test-images/README.md`:

```markdown
# Test Images

| File | Date | Conditions | Cards visible | Notes |
|---|---|---|---|---|
| 01-controlled.jpg | YYYY-MM-DD | Top-down, well-lit, cards separated | N | |
| 02-angled.jpg | YYYY-MM-DD | ~45° angle, some overlap | N | |
| 03-realistic.jpg | YYYY-MM-DD | Arm's length, quick snap | N | |
| 04-non-gowish.jpg | YYYY-MM-DD | Sticky notes on table | N | |
```

Fill in actual conditions, card counts, and any notes about each photo.

**Step 3: Create ground truth file**

Create `test-images/ground-truth.json` for each Go Wish image:

```json
{
  "01-controlled": {
    "total_cards_visible": 0,
    "piles": [
      {
        "label": "left",
        "cards": ["card text 1", "card text 2"]
      },
      {
        "label": "center",
        "cards": ["card text 3"]
      },
      {
        "label": "right",
        "cards": ["card text 4", "card text 5"]
      }
    ]
  }
}
```

Fill in the actual card texts visible in each photo. Reference Lankarani-Fard et al. (2010) Table 2 for canonical card values.

**Step 4: Commit**

```bash
git add test-images/
git commit -m "spike: add test images and ground truth"
```

---

### Task 6: Create run script

A shell script that wraps `llama-mtmd-cli` invocations for reproducible runs. Each run saves output to a timestamped file in `results/`.

**Files:**
- Create: `scripts/run-spike.sh`

**Step 1: Write the run script**

```bash
#!/usr/bin/env bash
# ABOUTME: Runs Qwen3-VL-2B inference via llama-mtmd-cli against a test image.
# ABOUTME: Saves raw output to results/ with timestamp for reproducibility.

set -euo pipefail

MODEL="models/Qwen3VL-2B-Instruct-Q4_K_M.gguf"
MMPROJ="models/mmproj-Qwen3VL-2B-Instruct-F16.gguf"
RESULTS_DIR="results"

if [ $# -lt 3 ]; then
  echo "Usage: $0 <image_path> <prompt_name> <prompt_text>"
  echo "  prompt_name: short label for the run (e.g., 'spatial-grouping')"
  echo "  prompt_text: the full prompt to send to the model"
  exit 1
fi

IMAGE="$1"
PROMPT_NAME="$2"
PROMPT_TEXT="$3"

IMAGE_BASENAME=$(basename "$IMAGE" | sed 's/\.[^.]*$//')
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_FILE="${RESULTS_DIR}/${IMAGE_BASENAME}_${PROMPT_NAME}_${TIMESTAMP}.txt"

echo "=== Spike Run ==="
echo "Image: $IMAGE"
echo "Prompt: $PROMPT_NAME"
echo "Output: $OUTPUT_FILE"
echo "=================="

llama-mtmd-cli \
  -m "$MODEL" \
  --mmproj "$MMPROJ" \
  --image "$IMAGE" \
  -p "$PROMPT_TEXT" \
  --temp 0.1 \
  -n 2048 \
  2>&1 | tee "$OUTPUT_FILE"

echo ""
echo "Output saved to: $OUTPUT_FILE"
```

**Step 2: Make executable**

Run:
```bash
chmod +x scripts/run-spike.sh
```

**Step 3: Commit**

```bash
git add scripts/run-spike.sh
git commit -m "spike: add reproducible run script"
```

---

### Task 7: Verify model loads with a sanity check

Before running real test images, confirm the model loads and produces output.

**Step 1: Run a trivial prompt**

Run:
```bash
./scripts/run-spike.sh test-images/01-controlled.jpg sanity-check "What do you see in this image? Describe briefly."
```

Expected: Model loads, processes image, produces a text description of the scene. May take 30-120 seconds depending on hardware.

**Step 2: Check output**

Read `results/01-controlled_sanity-check_*.txt`. Confirm:
- Model loaded without errors
- Output describes cards/objects on a table (even if imprecise)
- No crashes or OOM errors

If the model fails to load, check:
- File paths are correct
- Sufficient RAM (~3GB needed)
- mmproj file matches the model (both must be Qwen3-VL-2B)

---

### Task 8: Run 1 — Card reading + spatial grouping (controlled image)

The first real spike prompt, run against the controlled top-down image.

**Step 1: Create the prompt log**

Create `results/prompt-log.md` (T-E2):

```markdown
# Prompt Log

## Run 1: Card Reading + Spatial Grouping

**Prompt name:** spatial-grouping
**Prompt version:** v1
**Image:** 01-controlled.jpg
**Timestamp:** (filled by run)

### Prompt text
Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON with this schema: {"piles": [{"label": "string (left/center/right or descriptive)", "cards": ["card text 1", "card text 2"]}]}

### Raw output
(paste from results file)

### Scoring
- Cards correctly read: _ / _ visible
- Cards correctly grouped: _ / _ read
- Hallucinated cards: _
- Valid JSON: yes/no
- Error classifications: (list each error with taxonomy code)
```

**Step 2: Run the prompt**

Run:
```bash
./scripts/run-spike.sh test-images/01-controlled.jpg spatial-grouping \
  'Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON with this schema: {"piles": [{"label": "string (left/center/right or descriptive)", "cards": ["card text 1", "card text 2"]}]}'
```

**Step 3: Score the output**

1. Open the results file and the ground truth file side by side
2. Try to parse the JSON: `cat results/01-controlled_spatial-grouping_*.txt | python3 -m json.tool`
3. Match each card in the model output to the ground truth
4. Classify errors using the failure taxonomy
5. Record scores in `results/prompt-log.md`

**Step 4: Commit**

```bash
git add results/
git commit -m "spike: run 1 — spatial grouping on controlled image"
```

---

### Task 9: Run 2 — Spatial coordinates (controlled image)

The second prompt tests bounding box detection.

**Step 1: Log the prompt in prompt-log.md**

Append a new section:

```markdown
## Run 2: Spatial Coordinates

**Prompt name:** bounding-boxes
**Prompt version:** v1
**Image:** 01-controlled.jpg
**Timestamp:** (filled by run)

### Prompt text
Detect every card visible in this photo. For each card, return the text content and bounding box coordinates (x_min, y_min, x_max, y_max as 0-1 normalized). Return JSON with this schema: {"cards": [{"text": "card text", "bbox": {"x_min": 0.0, "y_min": 0.0, "x_max": 0.0, "y_max": 0.0}}]}

### Raw output
(paste from results file)

### Scoring
- Cards correctly read: _ / _ visible
- Hallucinated cards: _
- Valid JSON: yes/no
- Bounding boxes plausible: yes/no (do they roughly correspond to card positions?)
- Error classifications: (list each error with taxonomy code)
```

**Step 2: Run the prompt**

Run:
```bash
./scripts/run-spike.sh test-images/01-controlled.jpg bounding-boxes \
  'Detect every card visible in this photo. For each card, return the text content and bounding box coordinates (x_min, y_min, x_max, y_max as 0-1 normalized). Return JSON with this schema: {"cards": [{"text": "card text", "bbox": {"x_min": 0.0, "y_min": 0.0, "x_max": 0.0, "y_max": 0.0}}]}'
```

**Step 3: Score the output**

Same procedure as Task 8 Step 3. Additionally check whether bounding box values are plausible (e.g., not all zeros, coordinates make spatial sense relative to card positions in the photo).

**Step 4: Commit**

```bash
git add results/
git commit -m "spike: run 2 — bounding boxes on controlled image"
```

---

### Task 10: Run prompts on varied images

Run both prompts against the angled and realistic images. This tests how accuracy degrades under less favorable conditions (T-P2, T-P6).

**Step 1: Run spatial-grouping prompt on each additional image**

Run:
```bash
./scripts/run-spike.sh test-images/02-angled.jpg spatial-grouping \
  'Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON with this schema: {"piles": [{"label": "string (left/center/right or descriptive)", "cards": ["card text 1", "card text 2"]}]}'
```

```bash
./scripts/run-spike.sh test-images/03-realistic.jpg spatial-grouping \
  'Look at this photo of cards laid out on a table. The cards are sorted into spatial groups/piles. For each card you can see, read the text and determine which pile it belongs to based on its position. Return JSON with this schema: {"piles": [{"label": "string (left/center/right or descriptive)", "cards": ["card text 1", "card text 2"]}]}'
```

**Step 2: Score each run**

Add entries to `results/prompt-log.md` for each run. Score using the same procedure.

**Step 3: Run bounding-boxes prompt on each additional image**

Same commands with `bounding-boxes` prompt. Score each.

**Step 4: Commit**

```bash
git add results/
git commit -m "spike: runs on angled and realistic images"
```

---

### Task 11: Run prompts on non-Go-Wish image

Tests early generalization signal (T-I3). Use the same prompts but adapted for generic artifacts.

**Step 1: Run adapted spatial-grouping prompt**

Run:
```bash
./scripts/run-spike.sh test-images/04-non-gowish.jpg spatial-grouping-general \
  'Look at this photo of items laid out on a table. The items may be sticky notes, cards, or other objects arranged in groups. For each item you can see, read any text on it and determine which spatial group it belongs to based on its position. Return JSON with this schema: {"groups": [{"label": "string (left/center/right or descriptive)", "items": [{"text": "item text", "type": "sticky note/card/other"}]}]}'
```

**Step 2: Score and log**

Score is qualitative for non-Go-Wish (no ground truth file). Note:
- Did the model detect the items?
- Did it read handwritten text (if any)?
- Did it group spatially?
- Any hallucinations?

**Step 3: Commit**

```bash
git add results/
git commit -m "spike: run on non-Go-Wish image for generalization signal"
```

---

### Task 12: Prompt iteration (conditional — only if results are in ambiguous zone)

Per T-P3: if card reading accuracy is 60-79% on the controlled image, try up to 3 prompt variations before declaring pass/fail. Skip this task if results are clearly above 80% (pass) or below 60% (fail).

**Variation strategies to try (in order):**

1. **Add explicit instruction about text extraction:**
   > "Read the text on EVERY card carefully. The cards contain short phrases about end-of-life care wishes. Make sure to capture the complete text of each card."

2. **Two-step prompting — describe then structure:**
   > First: "Describe everything you see in this photo in detail."
   > Then: "Based on your description, list each card's text and which pile it's in. Return JSON."

3. **Simpler schema:**
   > "List every card you can read in this photo. Just return a JSON array of strings with the text of each card."

**For each variation:**
1. Log the prompt text in `results/prompt-log.md`
2. Run against the controlled image
3. Score against ground truth
4. Note what changed compared to v1

**After iterations, commit:**
```bash
git add results/
git commit -m "spike: prompt iteration results"
```

---

### Task 13: Write evaluation report

Consolidate all results into a structured evaluation report (T-E1).

**Files:**
- Create: `results/evaluation-report.md`

**Step 1: Write the report**

```markdown
# Qwen3-VL-2B Spike Evaluation Report

**Date:** 2026-02-XX
**Model:** Qwen3-VL-2B-Instruct, Q4_K_M quantization
**Runtime:** llama-mtmd-cli (llama.cpp)
**Hardware:** [Mac model, RAM, etc.]

## Summary

[1-2 sentence overall result: pass/fail/ambiguous, key finding]

## Results by Image

### 01-controlled.jpg (top-down, well-lit)

| Metric | Spatial Grouping Prompt | Bounding Box Prompt |
|---|---|---|
| Cards read correctly | _/_ (_%) | _/_ (_%) |
| Cards grouped correctly | _/_ (_%) | N/A |
| Hallucinated cards | _ | _ |
| Valid JSON | yes/no | yes/no |

**Error breakdown:**
| Error code | Count | Examples |
|---|---|---|
| OCR | | |
| MISS | | |
| SPATIAL | | |
| HALLUC | | |
| FORMAT | | |
| PARTIAL | | |

### 02-angled.jpg
[Same table structure]

### 03-realistic.jpg
[Same table structure]

### 04-non-gowish.jpg (generalization test)
[Qualitative assessment — no ground truth]

## Prompt Iteration Results (if applicable)

| Prompt version | Accuracy (controlled) | Notes |
|---|---|---|
| v1 (spatial grouping) | _% | |
| v2 (explicit instruction) | _% | |
| v3 (two-step) | _% | |

## Accuracy Degradation Across Conditions

| Image condition | Best accuracy | Worst accuracy | Primary failure mode |
|---|---|---|---|
| Controlled | | | |
| Angled | | | |
| Realistic | | | |

## Key Findings

1. [Finding about text reading capability]
2. [Finding about spatial reasoning]
3. [Finding about failure modes]
4. [Finding about generalization (non-Go-Wish)]

## Go/No-Go Decision

**Decision:** [PASS / FAIL / CONDITIONAL]

**Rationale:** [Why, referencing threshold criteria from evaluation-framework.md]

**If PASS — next steps:** Proceed to Phase 2 (on-device validation with Expo + llama.rn on iPhone 17 Pro). Key questions for Phase 2: latency, memory under iOS constraints, real camera photo quality.

**If FAIL — pivot plan:** Switch to Approach 1 (Apple Vision OCR + text LLM hybrid). Apple Vision handles text extraction and card detection; small text-only LLM (Qwen3 0.6B) structures output into JSON.

**If CONDITIONAL:** [What additional evidence is needed to make the decision]
```

**Step 2: Commit**

```bash
git add results/evaluation-report.md
git commit -m "spike: evaluation report with go/no-go decision"
```

---

### Task 14: Final commit and cleanup

**Step 1: Update prompt-log.md with any remaining entries**

Ensure every run is logged.

**Step 2: Update README.md**

Update the project README to describe what's in the repo:

```markdown
# On-Device Co-Design Element Detection — Spike

Desktop evaluation of Qwen3-VL-2B for reading co-design session artifacts from photographs.

## Results

See `results/evaluation-report.md` for the full evaluation.

## Repo Structure

- `docs/plans/` — Design documents and implementation plans
- `models/` — GGUF model files (gitignored)
- `test-images/` — Test photographs with ground truth
- `results/` — Run outputs, prompt log, evaluation report
- `scripts/` — Reproducible run scripts
```

**Step 3: Final commit**

```bash
git add README.md results/prompt-log.md
git commit -m "spike: finalize documentation and prompt log"
```

---

## Out of Scope for This Plan

The following tasks from the RTD decomposition are important but are **not part of the spike execution**. They should be planned separately after the spike completes:

- **T-I1:** Prior work search (literature review)
- **T-R3:** "Why not simpler alternatives?" argument
- **T-P4:** Model selection rationale documentation
- **T-I4:** De-identification-by-design pattern note
- **T-E4:** Behavioral scenarios as reusable design patterns
- **T-R2:** Who the output serves vs. who it doesn't
- **T-R5:** Data journey beyond JSON output

These are Phase 1.5 (positioning and grounding) tasks — research and writing, not spike execution.
