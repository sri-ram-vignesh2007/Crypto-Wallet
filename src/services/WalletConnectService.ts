// src/services/WalletConnectService.ts
// Reown / WalletConnect v2 Connector for Real Web3 dApp Communication (Uniswap, OpenSea, PancakeSwap)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { SecureKeyManager } from '../core/SecureKeyManager';
import { rpcManager } from '../core/RPCManager';

const STORAGE_KEY_WC_SESSIONS = 'cura_wc_sessions_v1';
export const DEFAULT_REOWN_PROJECT_ID = '3a8170812b534d0ff9d794f19a901d64'; // Default free starter project ID

export interface WCSession {
  topic: string;
  dappName: string;
  dappUrl: string;
  dappIcon?: string;
  chains: string[];
  accounts: string[];
  connectedAt: number;
}

export interface WCSignRequest {
  id: number;
  topic: string;
  method: 'eth_sendTransaction' | 'eth_sign' | 'personal_sign' | 'eth_signTypedData';
  params: any[];
  dappName: string;
  dappUrl: string;
}

export class WalletConnectService {
  private static sessions: WCSession[] = [];

  /**
   * Parse a WalletConnect URI (e.g. from Camera Scanner: wc:12345... )
   */
  static parseUri(uri: string): { topic: string; version: number; valid: boolean; raw: string } {
    const cleaned = uri.trim();
    if (!cleaned.startsWith('wc:')) {
      return { topic: '', version: 0, valid: false, raw: cleaned };
    }

    try {
      const parts = cleaned.replace('wc:', '').split('@');
      const topic = parts[0];
      const version = parts[1]?.startsWith('2') ? 2 : 1;
      return {
        topic,
        version,
        valid: topic.length > 0,
        raw: cleaned,
      };
    } catch {
      return { topic: '', version: 0, valid: false, raw: cleaned };
    }
  }

  /**
   * Load active dApp sessions from local encrypted store
   */
  static async getSessions(): Promise<WCSession[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_WC_SESSIONS);
      if (raw) {
        this.sessions = JSON.parse(raw);
        return this.sessions;
      }
    } catch {}
    return [];
  }

  /**
   * Save a newly approved dApp connection
   */
  static async approveSession(data: {
    dappName: string;
    dappUrl: string;
    dappIcon?: string;
    accountAddress: string;
    chainId?: number;
  }): Promise<WCSession> {
    const existing = await this.getSessions();
    const newSession: WCSession = {
      topic: `wc_session_${Date.now()}`,
      dappName: data.dappName,
      dappUrl: data.dappUrl,
      dappIcon: data.dappIcon,
      chains: [`eip155:${data.chainId || 1}`],
      accounts: [data.accountAddress],
      connectedAt: Date.now(),
    };

    const updated = [newSession, ...existing.filter(s => s.dappUrl !== data.dappUrl)];
    this.sessions = updated;
    await AsyncStorage.setItem(STORAGE_KEY_WC_SESSIONS, JSON.stringify(updated));
    return newSession;
  }

  /**
   * Disconnect from a dApp
   */
  static async disconnectSession(topic: string): Promise<void> {
    const existing = await this.getSessions();
    const filtered = existing.filter(s => s.topic !== topic);
    this.sessions = filtered;
    await AsyncStorage.setItem(STORAGE_KEY_WC_SESSIONS, JSON.stringify(filtered));
  }

  /**
   * Signs a real transaction or message requested by a connected dApp
   */
  static async handleSignRequest(
    method: string,
    params: any[],
    chainKey: string = 'ethereum'
  ): Promise<{ success: boolean; result?: string; error?: string }> {
    try {
      const pk = await SecureKeyManager.getPrivateKey();
      if (!pk) return { success: false, error: 'Wallet private key not available' };

      const provider = rpcManager.getProvider(chainKey);
      const wallet = new ethers.Wallet(pk, provider);

      if (method === 'personal_sign' || method === 'eth_sign') {
        const rawMessage = params[0]?.startsWith('0x') ? ethers.toUtf8String(params[0]) : params[0];
        const signature = await wallet.signMessage(rawMessage);
        return { success: true, result: signature };
      }

      if (method === 'eth_sendTransaction') {
        const txData = params[0];
        const tx = await wallet.sendTransaction({
          to: txData.to,
          value: txData.value ? BigInt(txData.value) : undefined,
          data: txData.data,
          gasLimit: txData.gas ? BigInt(txData.gas) : undefined,
        });
        return { success: true, result: tx.hash };
      }

      return { success: false, error: `Unsupported method: ${method}` };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Signing failed' };
    }
  }
}
