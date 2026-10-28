// src/polyfills.ts
// Robust cryptographic and buffer polyfills for React Native & Expo

import 'react-native-get-random-values';
import '@ethersproject/shims';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';

// Ensure global Buffer is always available
(global as any).Buffer = (global as any).Buffer || Buffer;

// Ensure global crypto and getRandomValues exist
if (typeof (global as any).crypto !== 'object') {
  (global as any).crypto = {};
}

// Hook expo-crypto directly into global.crypto.getRandomValues
(global as any).crypto.getRandomValues = function (array: any) {
  if (array && array.length) {
    const bytes = Crypto.getRandomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = bytes[i];
    }
  }
  return array;
};

// Export helper for generating secure 12-word BIP39 mnemonics
import * as bip39 from 'bip39';

export async function generateSecureMnemonic(): Promise<string> {
  try {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return bip39.entropyToMnemonic(Buffer.from(randomBytes));
  } catch {
    const randomBytes = Crypto.getRandomBytes(16);
    return bip39.entropyToMnemonic(Buffer.from(randomBytes));
  }
}
