// metro.config.js
// Tells Metro bundler how to handle Ethers v6 & @noble crypto dependencies

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for packages that use .cjs / .mjs files
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

// Enable package exports required for React Native 0.88+ subpaths
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

