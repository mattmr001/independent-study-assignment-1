// ABOUTME: Redux store configuration with all domain slices
// ABOUTME: Exports makeStore for testing and typed hooks for app use

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import protocolsReducer from '../domain/protocols/slice';
import studiesReducer from '../domain/studies/slice';
import participantsReducer from '../domain/participants/slice';
import sessionsReducer from '../domain/sessions/slice';
import capturesReducer from '../domain/captures/slice';
import analysesReducer from '../domain/analyses/slice';
import resultsReducer from '../domain/results/slice';

export interface ThunkExtra {
  inferenceService: {
    run(imagePath: string, prompt: string, onStatus: (s: string) => void): Promise<{ output: string }>;
  };
}

export const rootReducer = combineReducers({
  protocols: protocolsReducer,
  studies: studiesReducer,
  participants: participantsReducer,
  sessions: sessionsReducer,
  captures: capturesReducer,
  analyses: analysesReducer,
  results: resultsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function makeStore(preloadedState?: Partial<RootState>, extra?: ThunkExtra) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: extra ? { extraArgument: extra } : undefined,
        serializableCheck: false,
      }),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
