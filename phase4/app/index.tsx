// ABOUTME: Home screen — displays studies and creates new ones
// ABOUTME: Go Wish protocol is pre-selected (only protocol available)

import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../src/data/store';
import { addStudy, studySelectors } from '../src/domain/studies/slice';
import { addProtocol, protocolSelectors } from '../src/domain/protocols/slice';
import { GO_WISH_PROTOCOL } from '../src/go-wish/protocol';
import { colors } from '../src/presentation/theme/colors';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const studies = useSelector((state: RootState) => studySelectors.selectAll(state.studies));
  const protocols = useSelector((state: RootState) => state.protocols);

  const handleNewStudy = () => {
    if (!protocolSelectors.selectById(protocols, GO_WISH_PROTOCOL.id)) {
      dispatch(addProtocol(GO_WISH_PROTOCOL));
    }

    const studyId = `study-${Date.now()}`;
    dispatch(addStudy({
      id: studyId,
      name: `Study ${studies.length + 1}`,
      protocolId: GO_WISH_PROTOCOL.id,
      createdAt: new Date().toISOString(),
    }));

    router.push(`/study/${studyId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Co-Design Capture</Text>
      <Text style={styles.subtitle}>Go Wish Protocol</Text>

      <FlatList
        data={studies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.studyCard}
            onPress={() => router.push(`/study/${item.id}`)}
          >
            <Text style={styles.studyName}>{item.name}</Text>
            <Text style={styles.studyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No studies yet. Tap &quot;New Study&quot; to begin.</Text>
        }
      />

      <Pressable style={styles.button} onPress={handleNewStudy}>
        <Text style={styles.buttonText}>New Study</Text>
      </Pressable>

      {__DEV__ && (
        <Pressable style={styles.storybookLink} onPress={() => router.push('/storybook')}>
          <Text style={styles.storybookText}>Open Storybook</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 },
  studyCard: {
    backgroundColor: colors.surface, padding: 16, borderRadius: 8,
    marginBottom: 12, borderWidth: 1, borderColor: colors.border,
  },
  studyName: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  studyDate: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 48 },
  button: {
    backgroundColor: colors.accent, padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
  storybookLink: { alignItems: 'center', marginTop: 12, padding: 8 },
  storybookText: { color: colors.textSecondary, fontSize: 14 },
});
