// metro.config.js
// Tells Metro bundler how to handle Ethers v6 & @noble crypto dependencies

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for packages that use .cjs / .mjs files
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

// Disable package exports warning fallback for legacy subpath imports like @noble/hashes/crypto.js
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

