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
import { typography } from '../../../src/presentation/theme/typography';

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
  title: { ...typography.title, color: colors.text, textAlign: 'center', marginBottom: 24 },
  sectionHeader: { ...typography.sectionHeader, color: colors.text, marginTop: 16, marginBottom: 8 },
  listItem: {
    backgroundColor: colors.surface, padding: 12, borderRadius: 0,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border,
  },
  listItemText: { ...typography.body, color: colors.text },
  empty: { ...typography.body, color: colors.text, marginBottom: 8 },
  button: {
    backgroundColor: colors.background, padding: 14, borderRadius: 0,
    alignItems: 'center', marginTop: 8, marginBottom: 16, borderWidth: 2, borderColor: colors.border,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { ...typography.button, color: colors.text },
  error: { ...typography.body, color: colors.error, textAlign: 'center' },
});
