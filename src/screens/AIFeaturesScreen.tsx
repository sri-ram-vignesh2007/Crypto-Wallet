// src/screens/AIFeaturesScreen.tsx
// Catalog of all AI-powered features with status badges and direct navigation.

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { theme } from '../theme/Theme';
import { Card } from '../components/Card';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'ready' | 'beta' | 'coming';
  screen: string;
}

const FEATURES: AIFeature[] = [
  { id: 'risk_analyzer',   title: 'Transaction Risk Analyzer', description: 'Score any tx 0–100, detect phishing, unlimited approvals, honeypots.', icon: '🛡️', status: 'ready', screen: 'RiskAnalyzer' },
  { id: 'nl_wallet',       title: 'Natural Language Wallet',   description: 'Type "Send $50 USDC to Alex" — AI parses, simulates, confirms.', icon: '💬', status: 'ready', screen: 'AICommandBar' },
  { id: 'ai_chatbot',      title: 'CryptoVault AI Chatbot',    description: 'Real-time streaming AI assistant — ask anything about crypto, DeFi, gas, prices.', icon: '🤖', status: 'ready', screen: 'AIChatbot' },
  { id: 'portfolio_ai',    title: 'Portfolio AI',              description: 'P/L, tax estimate, health score, rebalance, yield opportunities.', icon: '📈', status: 'ready', screen: 'PortfolioAI' },
  { id: 'scam_detector',   title: 'AI Scam Detector',          description: 'Scan any address/contract — flag honeypots, rugs, fake tokens.', icon: '🔍', status: 'ready', screen: 'RiskAnalyzer' },
  { id: 'health_score',    title: 'Wallet Health Score',       description: 'Seed backup, biometrics, age, risky approvals, concentration.', icon: '💚', status: 'ready', screen: 'WalletHealth' },
  { id: 'spending_limits', title: 'Smart Spending Limits',     description: 'Daily caps, large-tx 2FA, emergency lock, guardian recovery.', icon: '🔒', status: 'ready', screen: 'SecurityCenter' },
  { id: 'address_book',    title: 'Universal Address Book',    description: 'Send to "Mom" not 0x… — name-based contacts.', icon: '📇', status: 'ready', screen: 'AddressBook' },
  { id: 'wallet_intel',    title: 'Wallet Intelligence',       description: 'Paste any address — profit, win rate, holdings, style, DeFi hints.', icon: '🧠', status: 'ready', screen: 'WalletIntelligence' },
  { id: 'trading_assist',  title: 'Trading Assistant',         description: 'Whale alerts, unlocks, sentiment, large transfers, AI insight.', icon: '📊', status: 'ready', screen: 'TradingAssistant' },
  { id: 'knowledge_engine',title: 'AI Knowledge Engine',       description: 'Ask "Why did my balance drop?" — get plain-English answer.', icon: '❓', status: 'ready', screen: 'KnowledgeEngine' },
  { id: 'smart_swap',      title: 'Smart Swap (Cross-Chain)',  description: 'Cheapest DEX route, auto-bridge, lowest gas across chains.', icon: '⇄', status: 'beta', screen: 'SmartSwap' },
  { id: 'tax_assistant',   title: 'Tax Assistant',             description: 'One-click CSV export, capital gains, 35% short-term estimate.', icon: '📄', status: 'ready', screen: 'PortfolioAI' },
  { id: 'agent_mode',      title: 'Agent Mode (DCA)',          description: 'Recurring self-custody rules — "$50 BTC weekly" with approval.', icon: '🤖', status: 'ready', screen: 'SecurityCenter' },
  { id: 'social_recovery', title: 'Social Recovery',           description: 'Send via email/username — recipient claims later.', icon: '👥', status: 'ready', screen: 'SecurityCenter' },
  { id: 'simulation',      title: 'Simulation Mode',           description: 'Dry-run any tx in sandbox — see outcome before signing.', icon: '🧪', status: 'ready', screen: 'Simulation' },
  { id: 'spending_insights', title: 'Spending Insights',       description: 'Category breakdown, monthly trends, anomaly detection.', icon: '📊', status: 'ready', screen: 'SpendingInsights' },
  { id: 'nft_agent',       title: 'NFT Agent',                 description: 'Monitor collections, floor prices, traits, portfolio P/L.', icon: '🖼️', status: 'ready', screen: 'NFTAgent' },
  { id: 'governance_agent',title: 'Governance Agent',          description: 'Track DAO proposals, vote, monitor treasury health.', icon: '🏛️', status: 'ready', screen: 'GovernanceAgent' },
  { id: 'dev_dashboard',   title: 'Developer Dashboard',       description: 'RPC debug, contract inspection, transaction builder.', icon: '🛠️', status: 'ready', screen: 'DevDashboard' },
  { id: 'custom_token',    title: 'Import Custom Token',       description: 'Add any ERC-20 by contract address — auto-fetch metadata.', icon: '+', status: 'ready', screen: 'CustomToken' },
];

export default function AIFeaturesScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}>
      <Text style={styles.title}>AI Features</Text>
      <Text style={styles.subtitle}>All AI-powered capabilities — tap to open.</Text>

      {FEATURES.map(f => (
        <TouchableOpacity key={f.id} onPress={() => f.screen !== 'coming' && navigation?.navigate?.(f.screen)}
          activeOpacity={0.7} style={[styles.card, f.status === 'coming' && styles.cardDisabled]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.description}</Text>
            </View>
          </View>
          <View style={styles.cardFooter}>
            <View style={[styles.statusBadge, f.status === 'ready' && styles.statusReady, f.status === 'beta' && styles.statusBeta, f.status === 'coming' && styles.statusComing]}>
              <Text style={styles.statusText}>{f.status.toUpperCase()}</Text>
            </View>
            {f.screen !== 'coming' && <Text style={styles.chevron}>›</Text>}
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  title: { fontSize: 30, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4, marginBottom: 16, fontWeight: '500' },
  card: { borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: 'column' },
  cardDisabled: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  cardIcon: { fontSize: 28, marginRight: 12, marginTop: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4, letterSpacing: -0.2 },
  cardDesc: { fontSize: 13, color: theme.colors.textMuted, lineHeight: 19, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.borderRadius.pill },
  statusReady: { backgroundColor: theme.colors.successMuted },
  statusBeta: { backgroundColor: theme.colors.warningMuted },
  statusComing: { backgroundColor: theme.colors.infoMuted },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  chevron: { fontSize: 22, color: theme.colors.textMuted, fontWeight: '700' },
});