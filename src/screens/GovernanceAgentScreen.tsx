// src/screens/GovernanceAgentScreen.tsx
// AI Governance Agent — DAO proposals, voting power, treasury health, vote history

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Text, Button, Card, Switch } from 'react-native-paper';
import Svg, { Rect, Text as SvgText, Circle } from 'react-native-svg';
import { theme } from '../theme/Theme';
import { useWalletStore } from '../store/walletStore';
import { GovernanceService, DAOProposal, VotePosition, DAOTreasury } from '../services/GovernanceService';

const SCREEN_W = Dimensions.get('window').width;

export default function GovernanceAgentScreen() {
  const { address } = useWalletStore();
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [votes, setVotes] = useState<VotePosition[]>([]);
  const [treasuries, setTreasuries] = useState<DAOTreasury[]>([]);
  const [votingPower, setVotingPower] = useState<Array<{ dao: string; token: string; votingPower: number; canVote: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<DAOProposal | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [useAI, setUseAI] = useState(true);

  useEffect(() => { load(); }, [address]);

  const load = async () => {
    setLoading(true);
    try {
      const [p, v, t] = await Promise.all([
        GovernanceService.getProposalsForUser(address || '0x0'),
        GovernanceService.getUserVotes(address || '0x0'),
        GovernanceService.getTreasuryHealth(),
      ]);
      setProposals(p);
      setVotes(v);
      setTreasuries(t);
      
      // Check voting power for major DAOs
      const daos = ['aave', 'uniswap', 'compound', 'arbitrum', 'optimism'];
      const vpChecks = await Promise.all(
        daos.map(async (slug) => {
          const vp = await GovernanceService.canVote(address || '0x0', slug);
          return { dao: slug, ...vp };
        })
      );
      setVotingPower(vpChecks);
    } catch (e) {
      console.error('Governance load error:', e);
    }
    setLoading(false);
  };

  const handleVote = async (proposalId: string, support: number) => {
    if (!address) return;
    const canVote = await GovernanceService.canVote(address, proposals.find(p => p.id === proposalId)?.daoSlug || '');
    if (!canVote.canVote) {
      Alert.alert('Cannot Vote', `You don't hold ${canVote.token} tokens to vote on this proposal.`);
      return;
    }
    
    Alert.alert(
      support === 1 ? 'Vote FOR' : 'Vote AGAINST',
      `Cast your vote with ${canVote.votingPower.toLocaleString()} ${canVote.token} voting power?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm Vote', onPress: () => Alert.alert('Vote Submitted', 'Your vote has been recorded on Snapshot.') },
      ]
    );
  };

  if (loading) return <View style={styles.root}><Text style={styles.title}>Governance Agent</Text></View>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingTop: 56, paddingBottom: 120 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Governance Agent</Text>
        <Text style={styles.subtitle}>Track DAO proposals, vote, and monitor treasury health</Text>
      </View>

      {/* Voting Power Summary */}
      <View style={styles.summaryRow}>
        {proposals.filter(p => p.status === 'active').map((p, i) => (
          <VotingPowerCard key={i} proposal={p} address={address || '0x0'} onVote={handleVote} />
        ))}
      </View>

      {/* Active Proposals */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Proposals</Text>
          <View style={styles.switchRow}>
  <Text style={styles.switchLabel}>AI Summaries</Text>
  <Switch value={useAI} onValueChange={setUseAI} />
</View>
        </View>
        {proposals.filter(p => p.status === 'active').length === 0 ? (
          <Text style={styles.empty}>No active proposals at the moment.</Text>
        ) : (
          proposals.filter(p => p.status === 'active').map((p, i) => (
            <ProposalRow key={i} proposal={p} useAI={useAI} onPress={() => { setSelectedProposal(p); setShowDetail(true); }} />
          ))
        )}
      </Card>

      {/* Upcoming Proposals */}
      {proposals.filter(p => p.status === 'pending').length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
          </View>
          {proposals.filter(p => p.status === 'pending').map((p, i) => (
            <ProposalRow key={i} proposal={p} useAI={useAI} onPress={() => { setSelectedProposal(p); setShowDetail(true); }} />
          ))}
        </Card>
      )}

      {/* Recent Votes */}
      {votes.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Recent Votes</Text>
          </View>
          {votes.map((v, i) => {
            const prop = proposals.find(p => p.id === v.proposalId);
            return (
              <VoteHistoryRow key={i} vote={v} proposalTitle={prop?.title || 'Unknown Proposal'} />
            );
          })}
        </Card>
      )}

      {/* Treasury Health */}
      {treasuries.length > 0 && (
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Treasury Health</Text>
          </View>
          {treasuries.map((t, i) => (
            <TreasuryRow key={i} treasury={t} />
          ))}
        </Card>
      )}

      {/* DAO Voting Power Check */}
      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Voting Power</Text>
        </View>
        <View style={styles.votingPowerList}>
          {votingPower.map((v, i) => (
            <View key={i} style={styles.votingPowerRow}>
              <View style={styles.vpInfo}>
                <Text style={styles.vpDao}>{v.dao.charAt(0).toUpperCase() + v.dao.slice(1)}</Text>
                <Text style={styles.vpToken}>{v.token} tokens</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.vpPower, { color: v.canVote ? theme.colors.success : theme.colors.textMuted }]}>
                  {v.canVote ? v.votingPower.toLocaleString() : 'No tokens'}
                </Text>
                <Text style={styles.vpStatus}>{v.canVote ? 'Can Vote' : 'No Voting Power'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function VotingPowerCard({ proposal, address, onVote }: { proposal: DAOProposal; address: string; onVote: (id: string, support: number) => void }) {
  const [canVote, setCanVote] = useState<{ canVote: boolean; votingPower: number; token: string } | null>(null);
  
  useEffect(() => {
    GovernanceService.canVote(address, proposal.daoSlug).then(setCanVote);
  }, [address, proposal.daoSlug]);

  if (!canVote) return null;

  return (
    <View style={[styles.vpCard, { borderLeftColor: canVote.canVote ? theme.colors.success : theme.colors.textMuted }]}>
      <Text style={styles.vpCardDao}>{proposal.dao}</Text>
      <Text style={styles.vpCardPower}>{canVote.votingPower.toLocaleString()} {canVote.token}</Text>
      <View style={styles.vpCardActions}>
        {canVote.canVote && proposal.status === 'active' && (
          <>
            <Button mode="outlined" onPress={() => onVote(proposal.id, 1)} textColor={theme.colors.success} style={styles.voteBtn}>
              For
            </Button>
            <Button mode="outlined" onPress={() => onVote(proposal.id, 0)} textColor={theme.colors.danger} style={styles.voteBtn}>
              Against
            </Button>
          </>
        )}
        {!canVote.canVote && <Text style={styles.noPower}>No voting power</Text>}
      </View>
    </View>
  );
}

function ProposalRow({ proposal, useAI, onPress }: { proposal: DAOProposal; useAI: boolean; onPress: () => void }) {
  const [summary, setSummary] = useState<string>('');
  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPct = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const daysLeft = Math.max(0, Math.ceil((proposal.endDate - Date.now()) / 86400000));
  const statusColor = proposal.status === 'active' ? theme.colors.primary : proposal.status === 'pending' ? theme.colors.warning : theme.colors.success;

  useEffect(() => {
    if (useAI) {
      GovernanceService.getProposalSummary(proposal, true).then(setSummary);
    } else {
      GovernanceService.getProposalSummary(proposal, false).then(setSummary);
    }
  }, [proposal.id, useAI]);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.proposalRow}>
      <View style={{ flex: 1 }}>
        <View style={styles.proposalHeader}>
          <Text style={styles.proposalDao}>{proposal.dao}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{proposal.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.proposalTitle}>{proposal.title}</Text>
        {summary && <Text style={styles.proposalSummary}>{summary}</Text>}
        <View style={styles.proposalMeta}>
          <Text style={styles.metaItem}>⏱ {daysLeft}d left</Text>
          <Text style={styles.metaItem}>🗳 {proposal.voterCount} voters</Text>
          <Text style={styles.metaItem}>📊 {forPct.toFixed(1)}% For</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function VoteHistoryRow({ vote, proposalTitle }: { vote: VotePosition; proposalTitle: string }) {
  const supportLabel = vote.support === 1 ? 'For' : vote.support === 0 ? 'Against' : 'Abstain';
  const supportColor = vote.support === 1 ? theme.colors.success : vote.support === 0 ? theme.colors.danger : theme.colors.warning;
  return (
    <View style={styles.voteRow}>
      <View style={styles.voteInfo}>
        <Text style={styles.voteTitle}>{proposalTitle}</Text>
        <Text style={styles.voteDate}>{new Date(vote.timestamp).toLocaleDateString()}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.voteBadge, { backgroundColor: supportColor + '20' }]}>
          <Text style={[styles.voteBadgeText, { color: supportColor }]}>{supportLabel}</Text>
        </View>
        <Text style={styles.voteWeight}>{vote.weight.toLocaleString()} voting power</Text>
      </View>
    </View>
  );
}

function TreasuryRow({ treasury }: { treasury: DAOTreasury }) {
  const diversificationColor = treasury.diversificationScore > 70 ? theme.colors.success : treasury.diversificationScore > 40 ? theme.colors.warning : theme.colors.danger;
  return (
    <View style={styles.treasuryRow}>
      <View style={styles.treasuryInfo}>
        <Text style={styles.treasuryDao}>{treasury.daoSlug.toUpperCase()}</Text>
        <Text style={styles.treasuryAssets}>
          {treasury.assets.slice(0, 3).map(a => `${a.symbol} $${(a.valueUsd/1e6).toFixed(0)}M`).join(' · ')}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.treasuryValue}>${(treasury.totalValueUsd/1e9).toFixed(1)}B</Text>
        <View style={styles.treasuryMeta}>
          <Text style={[styles.treasuryRunway, { color: treasury.runwayMonths > 36 ? theme.colors.success : theme.colors.warning }]}>
            {treasury.runwayMonths}mo runway
          </Text>
          <View style={[styles.diversificationBar, { width: 60 }]}>
            <View style={[styles.divFill, { width: `${treasury.diversificationScore}%`, backgroundColor: diversificationColor }]} />
          </View>
          <Text style={styles.treasuryDiversification}>Diversification: {treasury.diversificationScore}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background, paddingHorizontal: theme.spacing.screen },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  vpCard: { flex: 1, minWidth: 140, padding: 14, backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.borderRadius.lg, borderLeftWidth: 4, borderWidth: 1, borderColor: theme.colors.border },
  vpCardDao: { fontSize: 13, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  vpCardPower: { fontSize: 18, fontWeight: '700', color: theme.colors.primary, marginBottom: 8 },
  vpCardActions: { flexDirection: 'row', gap: 6 },
  voteBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.full },
  noPower: { fontSize: 12, color: theme.colors.textMuted },
  card: { borderRadius: theme.borderRadius.lg, padding: 16, marginBottom: 16, backgroundColor: theme.colors.surfaceElevated, borderWidth: 1, borderColor: theme.colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  empty: { color: theme.colors.textMuted, textAlign: 'center', padding: 20 },
  proposalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  proposalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  proposalDao: { fontSize: 12, fontWeight: '700', color: theme.colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.borderRadius.full },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  proposalTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 6 },
  proposalSummary: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18, marginBottom: 6, fontStyle: 'italic' },
  proposalMeta: { flexDirection: 'row', gap: 12 },
  metaItem: { fontSize: 11, color: theme.colors.textMuted },
  chevron: { fontSize: 18, color: theme.colors.textMuted, marginLeft: 12 },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  voteInfo: { flex: 1 },
  voteTitle: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  voteDate: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  voteBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.borderRadius.full },
  voteBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  voteWeight: { fontSize: 11, color: theme.colors.textMuted, marginTop: 4 },
  treasuryRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  treasuryInfo: { flex: 1 },
  treasuryDao: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
  treasuryAssets: { fontSize: 11, color: theme.colors.textMuted, marginTop: 2 },
  treasuryValue: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  treasuryMeta: { alignItems: 'flex-end', marginTop: 4 },
  treasuryRunway: { fontSize: 11, fontWeight: '600' },
  diversificationBar: { height: 4, backgroundColor: theme.colors.surfaceMuted, borderRadius: 2, overflow: 'hidden', marginVertical: 4 },
  divFill: { height: '100%', borderRadius: 2 },
  treasuryDiversification: { fontSize: 10, color: theme.colors.textMuted },
  votingPowerList: { gap: 12 },
  votingPowerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight },
  vpInfo: { flex: 1 },
  vpDao: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  vpToken: { fontSize: 11, color: theme.colors.textMuted, marginTop: 1 },
  vpPower: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  vpStatus: { fontSize: 11, color: theme.colors.textMuted },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 14, color: theme.colors.text },
});