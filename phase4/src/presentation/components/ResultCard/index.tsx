// ABOUTME: Displays analysis results — matched cards checklist and unmatched flags
// ABOUTME: Pure presentation component, no Redux dependency

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography, fonts } from '../../theme/typography';

interface MatchedCard {
  referenceText: string;
  extractedText: string;
}

interface Props {
  matched: MatchedCard[];
  unmatched: string[];
}

export function ResultCard({ matched, unmatched }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.summary}>
        {matched.length} matched / {unmatched.length} unmatched
      </Text>

      {matched.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Matched Cards</Text>
          {matched.map((card, i) => (
            <View key={i} style={styles.matchedItem}>
              <Text style={styles.checkmark}>[✓]</Text>
              <Text style={styles.cardText}>{card.referenceText}</Text>
            </View>
          ))}
        </View>
      )}

      {unmatched.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeaderWarning}>Needs Review</Text>
          {unmatched.map((text, i) => (
            <View key={i} style={styles.unmatchedItem}>
              <Text style={styles.unmatchedText}>[!] {text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  summary: { ...typography.label, color: colors.text, textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { ...typography.sectionHeader, color: colors.text, marginBottom: 8 },
  sectionHeaderWarning: { ...typography.sectionHeader, color: colors.error, marginBottom: 8 },
  matchedItem: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    backgroundColor: colors.surface, borderRadius: 0, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  checkmark: { ...typography.body, fontFamily: fonts.bold, color: colors.text, marginRight: 8 },
  cardText: { ...typography.body, color: colors.text, flex: 1 },
  unmatchedItem: {
    padding: 10, backgroundColor: colors.surface, borderRadius: 0, marginBottom: 6,
    borderWidth: 2, borderColor: colors.error,
  },
  unmatchedText: { ...typography.body, color: colors.error },
});
