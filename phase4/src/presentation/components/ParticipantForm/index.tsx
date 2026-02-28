// ABOUTME: Dynamic participant form — renders fields from protocol schema
// ABOUTME: Supports text, number, select, and multiselect field types

import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Keyboard, StyleSheet } from 'react-native';
import { FieldDefinition } from '../../../domain/protocols/types';
import { colors } from '../../theme/colors';

interface Props {
  schema: FieldDefinition[];
  codedId: string;
  onSubmit: (data: Record<string, string | string[]>) => void;
}

export function ParticipantForm({ schema, codedId, onSubmit }: Props) {
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});

  const updateField = (name: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleMultiselect = (name: string, option: string) => {
    const current = (formData[name] as string[]) || [];
    const updated = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
    updateField(name, updated);
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSubmit(formData);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.codedId}>{codedId}</Text>

      {schema.map(field => (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>

          {(field.type === 'text' || field.type === 'number') && (
            <TextInput
              style={styles.input}
              placeholder={field.label}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              value={(formData[field.name] as string) || ''}
              onChangeText={(text) => updateField(field.name, text)}
            />
          )}

          {field.type === 'select' && field.options && (
            <View style={styles.optionsContainer}>
              {field.options.map(option => (
                <Pressable
                  key={option}
                  style={[
                    styles.option,
                    formData[field.name] === option && styles.optionSelected,
                  ]}
                  onPress={() => updateField(field.name, option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData[field.name] === option && styles.optionTextSelected,
                  ]}>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {field.type === 'multiselect' && field.options && (
            <View style={styles.optionsContainer}>
              {field.options.map(option => {
                const selected = ((formData[field.name] as string[]) || []).includes(option);
                return (
                  <Pressable
                    key={option}
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => toggleMultiselect(field.name, option)}
                  >
                    <Text style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      ))}

      <Pressable style={styles.saveButton} onPress={handleSubmit}>
        <Text style={styles.saveButtonText}>Save</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  codedId: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary, textAlign: 'center', marginBottom: 24 },
  fieldContainer: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface, padding: 12, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, fontSize: 16, color: colors.textPrimary,
  },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  optionSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  optionText: { fontSize: 14, color: colors.textPrimary },
  optionTextSelected: { color: colors.white },
  saveButton: {
    backgroundColor: colors.accent, padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 24, marginBottom: 48,
  },
  saveButtonText: { color: colors.white, fontSize: 18, fontWeight: '600' },
});
