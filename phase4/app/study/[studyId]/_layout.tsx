// ABOUTME: Study layout — Stack navigator for study screens
// ABOUTME: Enables back navigation between study detail, add participant, and sessions

import { Stack } from 'expo-router';

export default function StudyLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
