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
