// ABOUTME: Tests for capture screen
// ABOUTME: Verifies camera button, preview, and analyze flow

import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithStore } from '../../../../../src/test-utils';
import CaptureScreen from './capture';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ studyId: 'study-1', sessionId: 'session-1' }),
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('expo-image-picker', () => ({
  launchCameraAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///tmp/photo.jpg' }],
  }),
}));

describe('CaptureScreen', () => {
  const preloadedState = {
    studies: {
      ids: ['study-1'],
      entities: { 'study-1': { id: 'study-1', name: 'Test Study', protocolId: 'go-wish', createdAt: '2026-01-01T00:00:00Z' } },
    },
    sessions: {
      ids: ['session-1'],
      entities: { 'session-1': { id: 'session-1', studyId: 'study-1', participantId: 'p-1', createdAt: '2026-01-01T00:00:00Z' } },
    },
    captures: { ids: [], entities: {} },
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('shows Take Photo button', () => {
    const { getByText } = renderWithStore(<CaptureScreen />, { preloadedState });
    expect(getByText('Take Photo')).toBeTruthy();
  });

  it('stores capture after photo is taken', async () => {
    const { getByText, store } = renderWithStore(<CaptureScreen />, { preloadedState });
    fireEvent.press(getByText('Take Photo'));

    await waitFor(() => {
      const captures = store.getState().captures.ids;
      expect(captures).toHaveLength(1);
    });
  });

  it('shows Analyze button after photo is taken', async () => {
    const { getByText } = renderWithStore(<CaptureScreen />, { preloadedState });
    fireEvent.press(getByText('Take Photo'));

    await waitFor(() => {
      expect(getByText('Analyze')).toBeTruthy();
    });
  });
});
