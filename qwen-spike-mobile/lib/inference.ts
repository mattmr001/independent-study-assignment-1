// ABOUTME: Inference wrapper for llama.rn
// ABOUTME: Loads Qwen3-VL-2B model and runs multimodal inference

import { initLlama, LlamaContext } from 'llama.rn';
import { Asset } from 'expo-asset';

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
