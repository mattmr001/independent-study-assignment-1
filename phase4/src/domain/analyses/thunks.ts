// ABOUTME: Analysis orchestration — coordinates inference and card matching
// ABOUTME: Dispatches status updates as analysis progresses

import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState, ThunkExtra } from '../../data/store';
import { addAnalysis, updateAnalysis } from './slice';
import { addResult } from '../results/slice';
import { captureSelectors } from '../captures/slice';
import { matchCards } from '../../go-wish/cardMatching';

interface RunAnalysisArgs {
  captureId: string;
  sessionId: string;
  referenceCards: string[];
  strategyId: string;
  prompt: string;
}

export const runAnalysis = createAsyncThunk<
  void,
  RunAnalysisArgs,
  { state: RootState; extra: ThunkExtra }
>(
  'analyses/run',
  async ({ captureId, sessionId, referenceCards, strategyId, prompt }, { dispatch, getState, extra }) => {
    const analysisId = `analysis-${Date.now()}`;
    const resultId = `result-${Date.now()}`;

    dispatch(addAnalysis({
      id: analysisId,
      sessionId,
      captureId,
      strategyId,
      status: 'running',
      resultId: null,
      error: null,
      createdAt: new Date().toISOString(),
    }));

    try {
      const capture = captureSelectors.selectById(getState().captures, captureId);
      if (!capture) throw new Error(`Capture ${captureId} not found`);

      const { output } = await extra.inferenceService.run(
        capture.imagePath,
        prompt,
        () => {},
      );

      const parsed = JSON.parse(output);
      const extractedTexts: string[] = parsed.cards.map((c: { text: string }) => c.text);
      const matchResult = matchCards(extractedTexts, referenceCards);

      dispatch(addResult({
        id: resultId,
        analysisId,
        matched: matchResult.matched,
        unmatched: matchResult.unmatched,
        rawOutput: output,
        createdAt: new Date().toISOString(),
      }));

      dispatch(updateAnalysis({
        id: analysisId,
        changes: { status: 'complete', resultId },
      }));
    } catch (error) {
      dispatch(updateAnalysis({
        id: analysisId,
        changes: {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        },
      }));
    }
  },
);
