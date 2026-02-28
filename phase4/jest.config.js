// ABOUTME: Jest configuration for React Native + Expo testing
// ABOUTME: Uses jest-expo preset with transform ignore patterns for native modules
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|llama.rn|@reduxjs/toolkit|immer|redux|react-redux)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
