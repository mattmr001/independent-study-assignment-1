// ABOUTME: Metro bundler config for Expo
// ABOUTME: Excludes test files from the runtime bundle

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\.test\.[jt]sx?$/,
  /jest\.setup\.[jt]s$/,
];

module.exports = config;
