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

  static async getWalletInfo(chainKey: string = 'sepolia'): Promise<WalletInfo | null> {
    const address = await SecureKeyManager.getAddress();
    if (!address) return null;

    const balance = await rpcManager.getNativeBalance(address, chainKey);

    return {
      address,
      balance,
      chain: CHAINS[chainKey].name,
    };
  }

  static async sendCrypto(
    toAddress: string,
    amount: string,
    chainKey: string = 'sepolia',
    token?: Token
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!ethers.isAddress(toAddress)) {
        return { success: false, error: 'Invalid recipient address' };
      }

      const fromAddress = await SecureKeyManager.getAddress();
      if (!fromAddress) {
        return { success: false, error: 'No wallet found' };
      }

      const chain = CHAINS[chainKey];
      const provider = rpcManager.getProvider(chainKey);
      const feeData = await rpcManager.getFeeData(chainKey);

      let txRequest: ethers.TransactionRequest;

      if (!token || token.isNative) {
        // Send native coin (ETH, BNB, MATIC, etc.)
        txRequest = {
          to: toAddress,
          from: fromAddress,
          value: ethers.parseUnits(amount, chain.decimals),
          chainId: chain.id,
          maxFeePerGas: feeData.maxFeePerGas || undefined,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
          type: 2,
        };
      } else {
        // Send ERC-20 token
        const ERC20_ABI = ['function transfer(address to, uint256 amount) returns (bool)'];
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const parsedAmount = ethers.parseUnits(amount, token.decimals);
        const data = contract.interface.encodeFunctionData('transfer', [toAddress, parsedAmount]);

        txRequest = {
          to: token.address,
          from: fromAddress,
          data: data,
          chainId: chain.id,
          maxFeePerGas: feeData.maxFeePerGas || undefined,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || undefined,
          type: 2,
        };
      }

      const nonce = await rpcManager.getTransactionCount(fromAddress, chainKey);
      txRequest.nonce = nonce;

      const gasLimit = await provider.estimateGas(txRequest);
      txRequest.gasLimit = gasLimit;

      const signedTx = await SecureKeyManager.signTransaction(txRequest);
      const txHash = await rpcManager.broadcastTransaction(signedTx, chainKey);

      return { success: true, txHash };
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

  // Exposed for walletStore.ts to use directly if needed
  static async signTransaction(txRequest: ethers.TransactionRequest): Promise<string> {
    return await SecureKeyManager.signTransaction(txRequest);
  }
}