// ABOUTME: Displays analysis results — matched cards checklist and unmatched flags
// ABOUTME: Pure presentation component, no Redux dependency

import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

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
              <Text style={styles.checkmark}>✓</Text>
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
              <Text style={styles.unmatchedText}>{text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  summary: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  section: { marginBottom: 16 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  sectionHeaderWarning: { fontSize: 16, fontWeight: '600', color: colors.error, marginBottom: 8 },
  matchedItem: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    backgroundColor: colors.surface, borderRadius: 6, marginBottom: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  checkmark: { fontSize: 16, color: colors.accent, marginRight: 8, fontWeight: 'bold' },
  cardText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  unmatchedItem: {
    padding: 10, backgroundColor: '#fff5f5', borderRadius: 6, marginBottom: 6,
    borderWidth: 1, borderColor: colors.error,
  },
  unmatchedText: { fontSize: 14, color: colors.error },
});
