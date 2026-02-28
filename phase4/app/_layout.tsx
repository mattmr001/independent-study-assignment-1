// ABOUTME: Root layout — Redux Provider with persistence and navigation
// ABOUTME: Loads Commit Mono font before rendering app

import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { configureStore } from '@reduxjs/toolkit';
import { Text } from 'react-native';
import { useFonts } from 'expo-font';
import { persistedReducer, persistStore } from '../src/data/persistence';
import { ThunkExtra } from '../src/data/store';
import * as inferenceService from '../src/data/inference/service';
import * as mockInferenceService from '../src/data/inference/mockService';

const useMock = process.env.EXPO_PUBLIC_MOCK_INFERENCE === 'true';
const extra: ThunkExtra = { inferenceService: useMock ? mockInferenceService : inferenceService };

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
  const [fontsLoaded] = useFonts({
    'CommitMono-Regular': require('../assets/fonts/CommitMono-Regular.otf'),
    'CommitMono-Bold': require('../assets/fonts/CommitMono-Bold.otf'),
  });

  if (!fontsLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <Slot />
      </PersistGate>
    </Provider>
  );
}
