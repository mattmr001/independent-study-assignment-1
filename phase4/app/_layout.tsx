// ABOUTME: Root layout — Redux Provider with persistence and navigation
// ABOUTME: Entry point for all screens via Expo Router

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '@reduxjs/toolkit';
import { Text } from 'react-native';
import { persistedReducer, persistStore } from '../src/data/persistence';
import { ThunkExtra } from '../src/data/store';
import * as inferenceService from '../src/data/inference/service';

const extra: ThunkExtra = { inferenceService };

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: { extraArgument: extra },
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}
