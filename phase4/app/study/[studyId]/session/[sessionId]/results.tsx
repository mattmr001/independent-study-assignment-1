// ABOUTME: Results screen — displays analysis progress and matched card results
// ABOUTME: Triggers analysis via runAnalysis thunk when no analysis exists

import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams } from 'expo-router';
import { RootState, AppDispatch } from '../../../../../src/data/store';
import { studySelectors } from '../../../../../src/domain/studies/slice';
import { protocolSelectors } from '../../../../../src/domain/protocols/slice';
import { selectCapturesBySessionId } from '../../../../../src/domain/captures/slice';
import { selectAnalysesBySessionId } from '../../../../../src/domain/analyses/slice';
import { selectResultByAnalysisId } from '../../../../../src/domain/results/slice';
import { runAnalysis } from '../../../../../src/domain/analyses/thunks';
import { ResultCard } from '../../../../../src/presentation/components/ResultCard';
import { colors } from '../../../../../src/presentation/theme/colors';
import { typography } from '../../../../../src/presentation/theme/typography';

export default function ResultsScreen() {
  const { studyId, sessionId } = useLocalSearchParams<{ studyId: string; sessionId: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const study = useSelector((state: RootState) =>
    studySelectors.selectById(state.studies, studyId),
  );
  const protocol = useSelector((state: RootState) =>
    study ? protocolSelectors.selectById(state.protocols, study.protocolId) : undefined,
  );
  const captures = useSelector((state: RootState) =>
    selectCapturesBySessionId(state.captures, sessionId),
  );
  const analyses = useSelector((state: RootState) =>
    selectAnalysesBySessionId(state.analyses, sessionId),
  );

  const latestAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : null;

  const result = useSelector((state: RootState) =>
    latestAnalysis?.resultId
      ? selectResultByAnalysisId(state.results, latestAnalysis.id)
      : undefined,
  );

  const handleAnalyze = () => {
    if (!protocol || captures.length === 0) return;

    const capture = captures[captures.length - 1];
    const strategy = protocol.strategies[0];

    dispatch(runAnalysis({
      captureId: capture.id,
      sessionId,
      referenceCards: protocol.instruments[0].referenceItems,
      strategyId: strategy.id,
      prompt: strategy.prompt,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Results</Text>

      {!latestAnalysis && (
        <View style={styles.centered}>
          <Text style={styles.info}>Ready to analyze captured photo.</Text>
          <Pressable style={styles.button} onPress={handleAnalyze}>
            <Text style={styles.buttonText}>Analyze</Text>
          </Pressable>
        </View>
      )}

      {latestAnalysis?.status === 'running' && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={styles.info}>Analyzing...</Text>
        </View>
      )}

      {latestAnalysis?.status === 'failed' && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Analysis failed: {latestAnalysis.error}</Text>
          <Pressable style={styles.button} onPress={handleAnalyze}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {latestAnalysis?.status === 'complete' && result && (
        <ResultCard matched={result.matched} unmatched={result.unmatched} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  centered: { alignItems: 'center', marginTop: 48 },
  info: { ...typography.body, color: colors.text, marginTop: 16, marginBottom: 16 },
  button: {
    backgroundColor: colors.background, paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 0, borderWidth: 2, borderColor: colors.border,
  },
  buttonText: { ...typography.button, color: colors.text },
  errorText: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: 16 },
});
