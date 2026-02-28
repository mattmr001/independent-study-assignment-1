// ABOUTME: Redux persistence configuration — stores state on-device
// ABOUTME: Uses AsyncStorage for local-only storage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import { rootReducer } from './store';

const persistConfig = {
  key: 'co-design-capture',
  storage: AsyncStorage,
};

export const persistedReducer = persistReducer(persistConfig, rootReducer);
export { persistStore };
