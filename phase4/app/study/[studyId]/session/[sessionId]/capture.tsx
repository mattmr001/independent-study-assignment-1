// ABOUTME: Capture screen — camera photo capture with preview
// ABOUTME: Stores immutable captures and navigates to results for analysis

import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RootState, AppDispatch } from '../../../../../src/data/store';
import { addCapture, selectCapturesBySessionId } from '../../../../../src/domain/captures/slice';
import { CapturePreview } from '../../../../../src/presentation/components/CapturePreview';
import { colors } from '../../../../../src/presentation/theme/colors';
import { typography } from '../../../../../src/presentation/theme/typography';

export default function CaptureScreen() {
  const { studyId, sessionId } = useLocalSearchParams<{ studyId: string; sessionId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [lastCaptureUri, setLastCaptureUri] = useState<string | null>(null);

  const captures = useSelector((state: RootState) =>
    selectCapturesBySessionId(state.captures, sessionId),
  );

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const captureId = `capture-${Date.now()}`;
      dispatch(addCapture({
        id: captureId,
        sessionId,
        imagePath: uri,
        createdAt: new Date().toISOString(),
      }));
      setLastCaptureUri(uri);
    }
  };

  const handleAnalyze = () => {
    router.push(`/study/${studyId}/session/${sessionId}/results`);
  };

  const latestCapture = lastCaptureUri || (captures.length > 0 ? captures[captures.length - 1].imagePath : null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Capture</Text>

      {latestCapture && (
        <CapturePreview imagePath={latestCapture} />
      )}

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>

        {captures.length > 0 && (
          <Pressable style={[styles.button, styles.analyzeButton]} onPress={handleAnalyze}>
            <Text style={styles.buttonText}>Analyze</Text>
          </Pressable>
        )}
      </View>

      {captures.length > 0 && (
        <Text style={styles.captureCount}>
          {captures.length} capture{captures.length !== 1 ? 's' : ''} taken
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  button: {
    flex: 1, backgroundColor: colors.background, padding: 16, borderRadius: 0,
    alignItems: 'center', borderWidth: 2, borderColor: colors.border,
  },
  analyzeButton: {},
  buttonText: { ...typography.button, color: colors.text },
  captureCount: { ...typography.label, textAlign: 'center', color: colors.text, marginTop: 12 },
});
