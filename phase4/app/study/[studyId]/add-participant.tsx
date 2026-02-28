// ABOUTME: Add participant screen — renders dynamic form from protocol schema
// ABOUTME: Generates coded ID and dispatches addParticipant on save

import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../../../src/data/store';
import { studySelectors } from '../../../src/domain/studies/slice';
import { protocolSelectors } from '../../../src/domain/protocols/slice';
import { addParticipant, selectParticipantsByStudyId } from '../../../src/domain/participants/slice';
import { generateCodedId } from '../../../src/domain/participants/codedId';
import { ParticipantForm } from '../../../src/presentation/components/ParticipantForm';
import { colors } from '../../../src/presentation/theme/colors';

export default function AddParticipantScreen() {
  const { studyId } = useLocalSearchParams<{ studyId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const study = useSelector((state: RootState) =>
    studySelectors.selectById(state.studies, studyId),
  );
  const protocol = useSelector((state: RootState) =>
    study ? protocolSelectors.selectById(state.protocols, study.protocolId) : undefined,
  );
  const participants = useSelector((state: RootState) =>
    selectParticipantsByStudyId(state.participants, studyId),
  );

  if (!study || !protocol) return null;

  const codedId = generateCodedId(participants.length);

  const handleSubmit = (demographics: Record<string, string | string[]>) => {
    dispatch(addParticipant({
      id: `participant-${Date.now()}`,
      studyId,
      codedId,
      demographics,
      createdAt: new Date().toISOString(),
    }));
    router.back();
  };

  return (
    <View style={styles.container}>
      <ParticipantForm
        schema={protocol.participantSchema}
        codedId={codedId}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
