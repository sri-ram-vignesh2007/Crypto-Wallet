// metro.config.js
// Tells Metro bundler how to handle Ethers v6 & @noble crypto dependencies

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for packages that use .cjs / .mjs files
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

// Custom resolver for @noble/hashes exports subpaths
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName && moduleName.includes('@noble/hashes/crypto.js')) {
    const aliased = moduleName.replace('@noble/hashes/crypto.js', '@noble/hashes/crypto');
    return context.resolveRequest(context, aliased, platform);
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Enable package exports required for React Native 0.88+ subpaths
config.resolver.unstable_enablePackageExports = true;

module.exports = config;

