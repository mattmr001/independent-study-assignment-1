// ABOUTME: Jest configuration for React Native + Expo testing
// ABOUTME: Uses jest-expo preset with transform ignore patterns for native modules
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterFramework: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|llama.rn)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
};
