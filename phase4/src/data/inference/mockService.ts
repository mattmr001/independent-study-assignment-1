// ABOUTME: Mock inference service for simulator UI development
// ABOUTME: Returns realistic Go Wish card matches after a short delay

const MOCK_DELAY_MS = 1500;

const MOCK_CARDS = [
  { text: 'To be free from pain' },
  { text: 'To be at peace with God' },
  { text: 'Not being a burden to my family' },
  { text: 'To have my family with me' },
  { text: 'garbled text from OCR artifact' },
  { text: 'To be able to help others' },
];

export async function run(
  _imagePath: string,
  _prompt: string,
  onStatus: (status: string) => void,
): Promise<{ output: string }> {
  onStatus('Checking model files...');
  await delay(300);

  onStatus('Resizing image...');
  await delay(200);

  onStatus('Loading model...');
  await delay(500);

  onStatus('Running inference...');
  await delay(MOCK_DELAY_MS);

  return { output: JSON.stringify({ cards: MOCK_CARDS }) };
}

export async function release(): Promise<void> {}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
