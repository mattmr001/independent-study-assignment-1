// ABOUTME: Main screen for Qwen3-VL mobile spike
// ABOUTME: Single button UI to run inference and display results

import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { runInference, releaseModel, InferenceResult, InferenceError } from './lib/inference';

export default function App() {
  const [status, setStatus] = useState<string>('Ready');
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [error, setError] = useState<InferenceError | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunInference = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const inferenceResult = await runInference(setStatus);
      setResult(inferenceResult);
      setStatus('Complete');
    } catch (err) {
      setError(err as InferenceError);
      setStatus('Failed');
    } finally {
      setIsRunning(false);
      await releaseModel();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qwen3-VL Mobile Spike</Text>

      <Pressable
        style={[styles.button, isRunning && styles.buttonDisabled]}
        onPress={handleRunInference}
        disabled={isRunning}
      >
        {isRunning ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Run Inference</Text>
        )}
      </Pressable>

      <Text style={styles.status}>Status: {status}</Text>

      <ScrollView style={styles.output}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error ({error.stage})</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              Model load: {result.modelLoadTimeMs}ms
            </Text>
            <Text style={styles.resultLabel}>
              Inference: {result.inferenceTimeMs}ms
            </Text>
            <Text style={styles.resultOutput}>{result.output}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666',
  },
  output: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  errorBox: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
  },
  errorTitle: {
    color: '#c00',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#c00',
  },
  resultBox: {
    gap: 8,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultOutput: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 24,
  },
});
