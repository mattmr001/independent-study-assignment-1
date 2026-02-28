// ABOUTME: Study detail screen — shows participants, sessions, and action buttons
// ABOUTME: Entry point for adding participants and starting sessions

import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../../../src/data/store';
import { studySelectors } from '../../../src/domain/studies/slice';
import { selectParticipantsByStudyId } from '../../../src/domain/participants/slice';
import { selectSessionsByStudyId } from '../../../src/domain/sessions/slice';
import { addSession } from '../../../src/domain/sessions/slice';
import { colors } from '../../../src/presentation/theme/colors';

export default function StudyDetailScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const study = useSelector((state: RootState) =>
    studySelectors.selectById(state.studies, studyId),
  );
  const participants = useSelector((state: RootState) =>
    selectParticipantsByStudyId(state.participants, studyId),
  );
  const sessions = useSelector((state: RootState) =>
    selectSessionsByStudyId(state.sessions, studyId),
  );

  if (!study) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Study not found</Text>
      </View>
    );
  }

  const handleNewSession = () => {
    if (participants.length === 0) return;

    const participantId = participants[participants.length - 1].id;
    const sessionId = `session-${Date.now()}`;
    dispatch(addSession({
      id: sessionId,
      studyId,
      participantId,
      createdAt: new Date().toISOString(),
    }));
    router.push(`/study/${studyId}/session/${sessionId}/capture`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{study.name}</Text>

      <Text style={styles.sectionHeader}>Participants</Text>
      {participants.length === 0 ? (
        <Text style={styles.empty}>No participants yet.</Text>
      ) : (
        <FlatList
          data={participants}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.listItemText}>{item.codedId}</Text>
            </View>
          )}
        />
      )}

      <Pressable
        style={styles.button}
        onPress={() => router.push(`/study/${studyId}/add-participant`)}
      >
        <Text style={styles.buttonText}>Add Participant</Text>
      </Pressable>

      <Text style={styles.sectionHeader}>Sessions</Text>
      {sessions.length === 0 ? (
        <Text style={styles.empty}>No sessions yet.</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.listItem}
              onPress={() => router.push(`/study/${studyId}/session/${item.id}/capture`)}
            >
              <Text style={styles.listItemText}>
                Session {new Date(item.createdAt).toLocaleString()}
              </Text>
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={[styles.button, participants.length === 0 && styles.buttonDisabled]}
        onPress={handleNewSession}
        disabled={participants.length === 0}
      >
        <Text style={styles.buttonText}>New Session</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 24 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  listItem: {
    backgroundColor: colors.surface, padding: 12, borderRadius: 6,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  listItemText: { fontSize: 16, color: colors.textPrimary },
  empty: { color: colors.textSecondary, marginBottom: 8 },
  button: {
    backgroundColor: colors.accent, padding: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 8, marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  error: { fontSize: 18, color: colors.error, textAlign: 'center' },
});
