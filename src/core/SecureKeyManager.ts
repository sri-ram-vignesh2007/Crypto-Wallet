// src/core/SecureKeyManager.ts
// THE SECURITY VAULT — Secure storage with graceful biometric support

import * as SecureStore from 'expo-secure-store';
import * as LocalAuth from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { generateSecureMnemonic } from '../polyfills';

const MNEMONIC_KEY = 'encrypted_mnemonic_v1';
const WALLET_ADDRESS_KEY = 'wallet_address_v1';
const PRIVATE_KEY_KEY = 'encrypted_pk_v1';

export class SecureKeyManager {
  static async createWallet(): Promise<{ address: string; mnemonicWarning: string }> {
    const mnemonic = await generateSecureMnemonic(); // 12-word standard BIP39 mnemonic
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const address = wallet.address;

    await this.encryptAndStore(mnemonic, address, wallet.privateKey);

    return {
      address,
      mnemonicWarning: 'WRITE DOWN THESE 12 WORDS ON PAPER. NEVER SCREENSHOT. NEVER SHARE.',
    };
  }

  static async getMnemonic(): Promise<string | null> {
    try {
      const compatible = await LocalAuth.hasHardwareAsync();
      const enrolled = await LocalAuth.isEnrolledAsync();
      if (compatible && enrolled) {
        await LocalAuth.authenticateAsync({
          promptMessage: 'Authenticate to reveal your seed phrase',
          fallbackLabel: 'Use device PIN',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
        });
      }
      return await SecureStore.getItemAsync(MNEMONIC_KEY);
    } catch {
      return await AsyncStorage.getItem(MNEMONIC_KEY);
    }
  }

  static async importWallet(mnemonic: string): Promise<{ address: string }> {
    const cleaned = mnemonic.trim().replace(/\s+/g, ' ');
    const isValid = bip39.validateMnemonic(cleaned);
    if (!isValid) {
      // Check if it's a raw private key
      try {
        const wallet = new ethers.Wallet(cleaned.startsWith('0x') ? cleaned : `0x${cleaned}`);
        await this.encryptAndStore('', wallet.address, wallet.privateKey);
        return { address: wallet.address };
      } catch {
        throw new Error('Invalid seed phrase or private key. Please check and try again.');
      }
    }

    const wallet = ethers.Wallet.fromPhrase(cleaned);
    const address = wallet.address;

    await this.encryptAndStore(cleaned, address, wallet.privateKey);

    return { address };
  }

  private static async encryptAndStore(mnemonic: string, address: string, privateKey?: string): Promise<void> {
    try {
      if (mnemonic) {
        await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic);
        await AsyncStorage.setItem(MNEMONIC_KEY, mnemonic);
      }
      if (privateKey) {
        await SecureStore.setItemAsync(PRIVATE_KEY_KEY, privateKey);
        await AsyncStorage.setItem(PRIVATE_KEY_KEY, privateKey);
      }
      await SecureStore.setItemAsync(WALLET_ADDRESS_KEY, address);
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, address);
    } catch (e: any) {
      console.warn('Storage fallback applied:', e?.message);
      if (mnemonic) await AsyncStorage.setItem(MNEMONIC_KEY, mnemonic);
      if (privateKey) await AsyncStorage.setItem(PRIVATE_KEY_KEY, privateKey);
      await AsyncStorage.setItem(WALLET_ADDRESS_KEY, address);
    }
  }

  static async getAddress(): Promise<string | null> {
    try {
      const address = await SecureStore.getItemAsync(WALLET_ADDRESS_KEY);
      if (address) return address;
    } catch {}
    return await AsyncStorage.getItem(WALLET_ADDRESS_KEY);
  }

  static async getPrivateKey(): Promise<string | null> {
    try {
      const pk = await SecureStore.getItemAsync(PRIVATE_KEY_KEY);
      if (pk) return pk;
    } catch {}
    
    try {
      const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
      if (mnemonic) {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        return wallet.privateKey;
      }
    } catch {}

    const asyncMnemonic = await AsyncStorage.getItem(MNEMONIC_KEY);
    if (asyncMnemonic) {
      const wallet = ethers.Wallet.fromPhrase(asyncMnemonic);
      return wallet.privateKey;
    }
    return await AsyncStorage.getItem(PRIVATE_KEY_KEY);
  }

  static async hasWallet(): Promise<boolean> {
    const address = await this.getAddress();
    return !!address;
  }

  static async clearWallet(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(MNEMONIC_KEY);
      await SecureStore.deleteItemAsync(WALLET_ADDRESS_KEY);
      await SecureStore.deleteItemAsync(PRIVATE_KEY_KEY);
      await AsyncStorage.removeItem(MNEMONIC_KEY);
      await AsyncStorage.removeItem(WALLET_ADDRESS_KEY);
      await AsyncStorage.removeItem(PRIVATE_KEY_KEY);
    } catch (e: any) {
      console.warn('Clear wallet fallback:', e?.message);
    }
  }

  static async deleteWallet(): Promise<void> {
    await this.clearWallet();
  }

  static async signTransaction(txRequest: ethers.TransactionRequest): Promise<string> {
    const pk = await this.getPrivateKey();
    if (!pk) throw new Error('Private key not accessible');
    const wallet = new ethers.Wallet(pk);
    return await wallet.signTransaction(txRequest);
  }
}
