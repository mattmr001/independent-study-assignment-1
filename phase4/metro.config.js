// ABOUTME: Metro bundler config for Expo
// ABOUTME: Excludes test files from bundle, integrates Storybook when enabled

const { getDefaultConfig } = require('expo/metro-config');
const { withStorybook } = require('@storybook/react-native/metro/withStorybook');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\.test\.[jt]sx?$/,
  /jest\.setup\.[jt]s$/,
];

module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === 'true',
  configPath: './.rnstorybook',
});
