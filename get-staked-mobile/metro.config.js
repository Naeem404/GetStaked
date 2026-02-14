const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for NativeWind
config.resolver.alias = {
  ...config.resolver.alias,
  '@': './',
};

module.exports = config;
