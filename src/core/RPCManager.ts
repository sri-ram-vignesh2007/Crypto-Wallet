// src/core/RPCManager.ts
// MULTI-CHAIN BLOCKCHAIN ENGINE — Free Public RPCs with static network configuration (No network detection retry loop)

import { ethers } from 'ethers';
import { CHAINS, Chain, Token, getTokensForChain, getNativeToken } from './ChainConfig';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

function createStaticProvider(rpcUrl: string, chain: Chain): ethers.JsonRpcProvider {
  try {
    const network = ethers.Network.from(chain.id);
    return new ethers.JsonRpcProvider(rpcUrl, network, {
      staticNetwork: network,
      batchMaxCount: 1,
    });
  } catch {
    return new ethers.JsonRpcProvider(rpcUrl, chain.id, {
      staticNetwork: true,
    });
  }
}

class RPCManager {
  private providers: Map<string, ethers.JsonRpcProvider> = new Map();

  getProvider(chainKey: string): ethers.JsonRpcProvider {
    if (!this.providers.has(chainKey)) {
      const chain = CHAINS[chainKey] || CHAINS.ethereum;
      const provider = createStaticProvider(chain.rpcUrls[0], chain);
      this.providers.set(chainKey, provider);
    }
    return this.providers.get(chainKey)!;
  }

  async getNativeBalance(address: string, chainKey: string): Promise<string> {
    const chain = CHAINS[chainKey] || CHAINS.ethereum;
    const native = getNativeToken(chainKey);
    const decimals = native?.decimals || 18;

    for (const rpcUrl of chain.rpcUrls) {
      try {
        const provider = createStaticProvider(rpcUrl, chain);
        const balance = await Promise.race([
          provider.getBalance(address),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 3500)),
        ]);
        return ethers.formatUnits(balance, decimals);
      } catch (e) {
        // try next RPC url
      }
    }
    return '0.00';
  }

  async getTokenBalance(address: string, token: Token, chainKey: string): Promise<string> {
    if (token.isNative) {
      return this.getNativeBalance(address, chainKey);
    }
    
    const chain = CHAINS[chainKey] || CHAINS.ethereum;
    for (const rpcUrl of chain.rpcUrls) {
      try {
        const provider = createStaticProvider(rpcUrl, chain);
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balance = await Promise.race([
          contract.balanceOf(address),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RPC Timeout')), 3500)),
        ]);
        return ethers.formatUnits(balance, token.decimals);
      } catch (e) {
        // try next RPC url
      }
    }
    return '0.00';
  }

  async getAllBalances(address: string, chainKey: string): Promise<{ token: Token; balance: string }[]> {
    const tokens = getTokensForChain(chainKey);
    const results: { token: Token; balance: string }[] = [];
    
    for (const token of tokens) {
      try {
        const balance = await this.getTokenBalance(address, token, chainKey);
        results.push({ token, balance });
      } catch (e) {
        results.push({ token, balance: '0.00' });
      }
    }
    
    return results;
  }

  async getTransactionCount(address: string, chainKey: string): Promise<number> {
    const provider = this.getProvider(chainKey);
    return await provider.getTransactionCount(address);
  }

  async getFeeData(chainKey: string) {
    const provider = this.getProvider(chainKey);
    return await provider.getFeeData();
  }

  async broadcastTransaction(signedTx: string, chainKey: string): Promise<string> {
    const provider = this.getProvider(chainKey);
    const tx = await provider.broadcastTransaction(signedTx);
    return tx.hash;
  }

  async sendNative(
    privateKey: string,
    toAddress: string,
    amount: string,
    chainKey: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const chain = CHAINS[chainKey] || CHAINS.ethereum;
    for (const rpcUrl of chain.rpcUrls) {
      try {
        const provider = createStaticProvider(rpcUrl, chain);
        const wallet = new ethers.Wallet(privateKey, provider);
        const tx = await wallet.sendTransaction({
          to: toAddress,
          value: ethers.parseEther(amount),
        });
        return { success: true, txHash: tx.hash };
      } catch (e: any) {
        console.warn('Send native error on RPC:', e?.message);
      }
    }
    return { success: false, error: 'Transaction broadcast failed on all RPC nodes' };
  }

  async sendERC20(
    privateKey: string,
    toAddress: string,
    amount: string,
    token: Token,
    chainKey: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    const chain = CHAINS[chainKey] || CHAINS.ethereum;
    for (const rpcUrl of chain.rpcUrls) {
      try {
        const provider = createStaticProvider(rpcUrl, chain);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(token.address, ERC20_ABI, wallet);
        const parsedAmount = ethers.parseUnits(amount, token.decimals);
        const tx = await contract.transfer(toAddress, parsedAmount);
        return { success: true, txHash: tx.hash };
      } catch (e: any) {
        console.warn('Send ERC20 error on RPC:', e?.message);
      }
    }
    return { success: false, error: 'Token transfer failed on all RPC nodes' };
  }
}

export const rpcManager = new RPCManager();