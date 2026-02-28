// ABOUTME: Tests for home screen
// ABOUTME: Verifies study creation flow (BDD Scenario 1)

import { fireEvent } from '@testing-library/react-native';
import { renderWithStore } from '../src/test-utils';
import HomeScreen from './index';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('HomeScreen', () => {
  it('renders New Study button', () => {
    const { getByText } = renderWithStore(<HomeScreen />);
    expect(getByText('New Study')).toBeTruthy();
  });

  it('creates a study when New Study is tapped', () => {
    const { getByText, store } = renderWithStore(<HomeScreen />);
    fireEvent.press(getByText('New Study'));

    const studies = store.getState().studies.ids;
    expect(studies).toHaveLength(1);
  });
});
