// src/core/WalletManager.ts
// WALLET CONTROLLER — connects security + blockchain

import { ethers } from 'ethers';
import { SecureKeyManager } from './SecureKeyManager';
import { rpcManager } from './RPCManager';
import { CHAINS, Token } from './ChainConfig';

export interface WalletInfo {
  address: string;
  balance: string;
  chain: string;
}

export class WalletManager {
  static async createWallet(): Promise<{ address: string; warning: string }> {
    const result = await SecureKeyManager.createWallet();
    return {
      address: result.address,
      warning: result.mnemonicWarning,
    };
  }

  static async importWallet(mnemonic: string): Promise<{ address: string }> {
    return await SecureKeyManager.importWallet(mnemonic);
  }

  static async getWalletInfo(chainKey: string = 'ethereum'): Promise<WalletInfo | null> {
    const address = await SecureKeyManager.getAddress();
    if (!address) return null;

    const balance = await rpcManager.getNativeBalance(address, chainKey);

    return {
      address,
      balance,
      chain: (CHAINS[chainKey] || CHAINS.ethereum).name,
    };
  }

  static async sendCrypto(
    toAddress: string,
    amount: string,
    chainKey: string = 'ethereum',
    token?: Token
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!ethers.isAddress(toAddress)) {
        return { success: false, error: 'Invalid recipient address' };
      }

      const privateKey = await SecureKeyManager.getPrivateKey();
      if (!privateKey) {
        return { success: false, error: 'Private key not accessible. Please verify wallet security.' };
      }

      if (!token || token.isNative) {
        return await rpcManager.sendNative(privateKey, toAddress, amount, chainKey);
      } else {
        return await rpcManager.sendERC20(privateKey, toAddress, amount, token, chainKey);
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Transaction failed' };
    }
  }

  static async hasWallet(): Promise<boolean> {
    return await SecureKeyManager.hasWallet();
  }

  static async deleteWallet(): Promise<void> {
    await SecureKeyManager.deleteWallet();
  }

  static async getReceiveAddress(): Promise<string | null> {
    return await SecureKeyManager.getAddress();
  }

  static async signTransaction(txRequest: ethers.TransactionRequest): Promise<string> {
    return await SecureKeyManager.signTransaction(txRequest);
  }
}
