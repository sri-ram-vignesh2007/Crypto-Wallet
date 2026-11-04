// src/services/SupabaseService.ts
// FREE Supabase backend — syncs profile + transactions (with user consent)
// Sign up: https://supabase.com → New Project → Settings → API → copy URL + anon key

import { createClient } from '@supabase/supabase-js';

// REPLACE THESE WITH YOUR SUPABASE PROJECT KEYS
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  wallet_address: string;
  consent_analytics: boolean;
}

export interface TransactionLog {
  user_email: string;
  tx_hash: string;
  from_address: string;
  to_address: string;
  amount: string;
  token_symbol: string;
  chain: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export class SupabaseService {
  // Save user profile to cloud
  static async saveProfile(profile: UserProfile): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert([profile], { onConflict: 'email' });
      return !error;
    } catch (e) {
      return false;
    }
  }

  // Log transaction (only if user consented)
  static async logTransaction(tx: TransactionLog): Promise<boolean> {
    try {
      const { error } = await supabase.from('transactions').insert([tx]);
      return !error;
    } catch (e) {
      return false;
    }
  }

  // Fetch all users (for developer dashboard)
  static async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  // Fetch all transactions
  static async getAllTransactions(): Promise<TransactionLog[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  // Fetch transactions for one user
  static async getUserTransactions(email: string): Promise<TransactionLog[]> {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });
    return data || [];
  }
}