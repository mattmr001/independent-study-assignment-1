// ABOUTME: Inference wrapper for llama.rn
// ABOUTME: Loads Qwen3-VL-2B model and runs multimodal inference

import { initLlama, LlamaContext } from 'llama.rn';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

export interface InferenceResult {
  output: string;
  modelLoadTimeMs: number;
  inferenceTimeMs: number;
}

export interface InferenceError {
  stage: 'model_load' | 'multimodal_init' | 'inference' | 'file_not_found';
  message: string;
}

let context: LlamaContext | null = null;

const MODEL_FILENAME = 'Qwen3VL-2B-Instruct-Q4_K_M.gguf';
const MMPROJ_FILENAME = 'mmproj-Qwen3VL-2B-Instruct-F16.gguf';

function uriToPath(uri: string): string {
  // Convert file:// URI to raw path for native libraries
  if (uri.startsWith('file://')) {
    return decodeURIComponent(uri.replace('file://', ''));
  }
  return uri;
}

async function getModelPath(filename: string): Promise<string> {
  const docDir = FileSystem.documentDirectory;
  const docPath = `${docDir}models/${filename}`;

  console.log('Looking for model at:', docPath);

  const info = await FileSystem.getInfoAsync(docPath);
  if (info.exists) {
    const rawPath = uriToPath(docPath);
    console.log('Found model, raw path:', rawPath);
    return rawPath;
  }
  throw new Error(`Model not found at ${docPath}. Copy ${filename} to the app's Documents/models/ folder.`);
}

async function getAssetPath(asset: Asset): Promise<string> {
  await asset.downloadAsync();
  return asset.localUri || asset.uri;
}

export async function runInference(
  onStatus: (status: string) => void
): Promise<InferenceResult> {
  const modelLoadStart = Date.now();

  onStatus('Checking model files...');

  let modelPath: string;
  let mmprojPath: string;

  try {
    modelPath = await getModelPath(MODEL_FILENAME);
    mmprojPath = await getModelPath(MMPROJ_FILENAME);
  } catch (error) {
    const err = error as Error;
    throw {
      stage: 'file_not_found',
      message: err.message,
    } as InferenceError;
  }

  onStatus('Loading model...');

  // Load test image asset (small enough for Metro)
  const imageAsset = Asset.fromModule(require('../assets/test-image.jpg'));
  const imageUri = await getAssetPath(imageAsset);
  const imagePath = uriToPath(imageUri);
  console.log('Image path:', imagePath);

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
      media_paths: [imagePath],
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
