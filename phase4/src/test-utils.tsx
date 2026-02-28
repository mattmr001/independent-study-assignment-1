// ABOUTME: Test helper — renders components with Redux store
// ABOUTME: Used by presentation layer tests

import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { makeStore, RootState, ThunkExtra } from './data/store';

interface RenderOptions {
  preloadedState?: Partial<RootState>;
  extra?: ThunkExtra;
}

export function renderWithStore(
  ui: React.ReactElement,
  { preloadedState, extra }: RenderOptions = {},
) {
  const store = makeStore(preloadedState, extra);
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  return { ...render(ui, { wrapper }), store };
}
