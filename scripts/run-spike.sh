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
