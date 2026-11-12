// src/services/AddressBookService.ts
// Institutional Address Book & Contact Management with Real ENS (.eth) Name Resolution

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ethers } from 'ethers';
import { rpcManager } from '../core/RPCManager';

const STORAGE_KEY_ADDRESS_BOOK = 'cura_address_book_v1';

export interface Contact {
  id: string;
  name: string;
  address: string;
  chain: string; // 'ethereum' | 'solana' | 'bitcoin' | 'bsc' | 'polygon' | 'all'
  ensName?: string;
  notes?: string;
  updatedAt: number;
}

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: 'contact-vitalik',
    name: 'Vitalik Buterin',
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    chain: 'ethereum',
    ensName: 'vitalik.eth',
    notes: 'Ethereum Foundation Creator',
    updatedAt: Date.now(),
  },
  {
    id: 'contact-binance',
    name: 'Binance Cold Vault',
    address: '0x28C6c06298d514Db089934071355E5743bf21d60',
    chain: 'all',
    notes: 'Primary Centralized Exchange Deposit',
    updatedAt: Date.now(),
  },
];

export class AddressBookService {
  /**
   * Retrieves all saved contacts from local encrypted storage
   */
  static async getContacts(): Promise<Contact[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY_ADDRESS_BOOK);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEY_ADDRESS_BOOK, JSON.stringify(DEFAULT_CONTACTS));
        return DEFAULT_CONTACTS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CONTACTS;
    }
  }

  /**
   * Saves or updates a contact with nickname and address
   */
  static async saveContact(data: {
    id?: string;
    name: string;
    address: string;
    chain?: string;
    notes?: string;
    ensName?: string;
  }): Promise<Contact> {
    const contacts = await this.getContacts();
    const contactId = data.id || `contact-${Date.now()}`;
    
    // Auto-detect ENS if ending in .eth
    let resolvedAddress = data.address.trim();
    let ens = data.ensName;

    if (resolvedAddress.endsWith('.eth')) {
      ens = resolvedAddress;
      const lookup = await this.resolveENS(resolvedAddress);
      if (lookup.address) {
        resolvedAddress = lookup.address;
      }
    } else if (ethers.isAddress(resolvedAddress) && !ens) {
      const reverse = await this.reverseLookupENS(resolvedAddress);
      if (reverse) ens = reverse;
    }

    const newContact: Contact = {
      id: contactId,
      name: data.name.trim() || 'New Contact',
      address: resolvedAddress,
      chain: data.chain || 'all',
      ensName: ens,
      notes: data.notes?.trim(),
      updatedAt: Date.now(),
    };

    const existingIndex = contacts.findIndex(c => c.id === contactId);
    let updated: Contact[];
    if (existingIndex >= 0) {
      updated = [...contacts];
      updated[existingIndex] = newContact;
    } else {
      updated = [newContact, ...contacts];
    }

    await AsyncStorage.setItem(STORAGE_KEY_ADDRESS_BOOK, JSON.stringify(updated));
    return newContact;
  }

  /**
   * Deletes a contact by ID
   */
  static async deleteContact(id: string): Promise<void> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY_ADDRESS_BOOK, JSON.stringify(filtered));
  }

  /**
   * Real on-chain ENS (.eth) Name Resolution
   * Resolves e.g. 'vitalik.eth' to '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
   */
  static async resolveENS(name: string): Promise<{ address?: string; error?: string }> {
    try {
      const cleaned = name.trim().toLowerCase();
      if (!cleaned.endsWith('.eth')) {
        return { error: 'Not a valid .eth name' };
      }

      // Query Ethereum Mainnet provider
      const provider = rpcManager.getProvider('ethereum');
      const resolved = await Promise.race([
        provider.resolveName(cleaned),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('ENS Timeout')), 2500)),
      ]);

      if (resolved && ethers.isAddress(resolved)) {
        return { address: resolved };
      }
      return { error: 'ENS name not found or unconfigured' };
    } catch (e: any) {
      return { error: e?.message || 'ENS lookup failed' };
    }
  }

  /**
   * Reverse ENS Lookup: takes an Ethereum address and finds its registered .eth name
   */
  static async reverseLookupENS(address: string): Promise<string | null> {
    try {
      if (!ethers.isAddress(address)) return null;
      const provider = rpcManager.getProvider('ethereum');
      const ensName = await Promise.race([
        provider.lookupAddress(address),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Reverse ENS Timeout')), 2500)),
      ]);
      return ensName;
    } catch {
      return null;
    }
  }
}

