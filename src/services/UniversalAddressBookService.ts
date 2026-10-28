// src/services/UniversalAddressBookService.ts
// Universal Address Book — store Mom, Office, Trading Wallet etc. by name
// instead of memorising 0x addresses. Backed by AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'address_book_v1';

export interface AddressBookEntry {
  id: string;
  label: string;       // "Mom"
  address: string;    // 0x...
  note?: string;
  createdAt: number;
}

export class UniversalAddressBookService {
  static async list(): Promise<AddressBookEntry[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static async findByName(name: string): Promise<AddressBookEntry | null> {
    const list = await this.list();
    const lower = name.toLowerCase().trim();
    return list.find(e => e.label.toLowerCase() === lower) || null;
  }

  static async findByAddress(address: string): Promise<AddressBookEntry | null> {
    const list = await this.list();
    const lower = address.toLowerCase();
    return list.find(e => e.address.toLowerCase() === lower) || null;
  }

  static async add(label: string, address: string, note?: string): Promise<void> {
    const list = await this.list();
    if (list.some(e => e.label.toLowerCase() === label.toLowerCase())) {
      throw new Error('A contact with that name already exists.');
    }
    list.push({ id: Math.random().toString(36).slice(2), label, address, note, createdAt: Date.now() });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  static async remove(id: string): Promise<void> {
    const list = (await this.list()).filter(e => e.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
