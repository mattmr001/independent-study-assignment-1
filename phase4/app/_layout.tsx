// ABOUTME: Root layout — wraps app with Redux Provider
// ABOUTME: Entry point for Expo Router navigation

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { makeStore } from '../src/data/store';

const store = makeStore();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
