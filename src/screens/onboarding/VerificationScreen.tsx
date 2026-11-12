// src/screens/onboarding/VerificationScreen.tsx
// Institutional Google Account Verification & Personal Details Onboarding Screen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  StatusBar, Alert, Modal, Animated, Pressable, Switch, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, G } from 'react-native-svg';
import { useProfileStore } from '../../store/profileStore';
import { useColors, useIsDark } from '../../theme/ThemeContext';

// Official Multi-Color Google G Logo
const GoogleLogo = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

const CheckCircleIcon = ({ color = '#10B981', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <Path d="M22 4L12 14.01l-3-3" />
  </Svg>
);

const LockShieldIcon = ({ color = '#8E8E93', size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Svg>
);

const COUNTRIES = [
  'India 🇮🇳',
  'United States 🇺🇸',
  'United Kingdom 🇬🇧',
  'Canada 🇨🇦',
  'United Arab Emirates 🇦🇪',
  'Singapore 🇸🇬',
  'Germany 🇩🇪',
  'Australia 🇦🇺',
];

export default function VerificationScreen({ navigation, route }: { navigation: any; route?: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const isDark = useIsDark();
  const profileStore = useProfileStore();

  const [fullName, setFullName] = useState(profileStore.name || 'Sri Ram Vignesh');
  const [username, setUsername] = useState(profileStore.username || 'sriram_vault');
  const [email, setEmail] = useState(profileStore.email || profileStore.googleAccount || 'sri.ram.vignesh@gmail.com');
  const [country, setCountry] = useState(profileStore.country || 'India 🇮🇳');
  const [phoneNumber, setPhoneNumber] = useState(profileStore.phoneNumber || '+91 98765 43210');
  const [biometricsEnabled, setBiometricsEnabled] = useState(profileStore.isBiometricEnabled);

  // Google Verification Modal & Flow
  const [isGoogleVerified, setIsGoogleVerified] = useState(profileStore.isGoogleVerified || false);
  const [googleEmail, setGoogleEmail] = useState(profileStore.googleAccount || 'sri.ram.vignesh@gmail.com');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);

  const cardBg = isDark ? '#161618' : '#FFFFFF';
  const cardBorder = isDark ? '#262629' : '#E5E5EA';
  const inputBg = isDark ? '#202024' : '#F2F2F7';
  const primaryBtnBg = isDark ? '#FFFFFF' : '#111111';
  const primaryBtnText = isDark ? '#000000' : '#FFFFFF';

  const handleSimulateGoogleLogin = (selectedEmail: string) => {
    setIsVerifyingGoogle(true);
    setTimeout(() => {
      setIsVerifyingGoogle(false);
      setGoogleEmail(selectedEmail);
      setEmail(selectedEmail);
      setIsGoogleVerified(true);
      setShowGoogleModal(false);
      profileStore.setGoogleVerified(selectedEmail, true);
    }, 1200);
  };

  const handleSaveAndContinue = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full legal or display name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please provide a valid email address.');
      return;
    }

    // Save personal details into persistent store
    profileStore.updatePersonalDetails({
      name: fullName.trim(),
      username: username.trim().replace('@', ''),
      email: email.trim(),
      googleAccount: googleEmail,
      country,
      phoneNumber,
    });
    profileStore.setBiometricEnabled(biometricsEnabled);
    profileStore.setOnboardingComplete(true);
    profileStore.setSignedIn(true);

    // Continue to next screen (SeedPhrase setup or MainTabs)
    if (route?.params?.mode === 'import') {
      navigation.navigate('SeedPhrase', { mode: 'import' });
    } else {
      navigation.navigate('SeedPhrase', { mode: 'create' });
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 8, paddingBottom: Math.max(30, insets.bottom + 20) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.header}>
          <Text style={[styles.stepLabel, { color: '#3B82F6' }]}>STEP 1 OF 2 • IDENTITY & SECURITY</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Personal Verification</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            Verify your Google account and configure your secure personal details before initializing your self-custody wallet.
          </Text>
        </View>

        {/* ── 1. GOOGLE ACCOUNT VERIFICATION CARD ─────────────── */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#CCCCCC' : colors.text.secondary }]}>
          GOOGLE ACCOUNT VERIFICATION
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {isGoogleVerified ? (
            <View style={styles.verifiedRow}>
              <View style={styles.verifiedLeft}>
                <GoogleLogo size={24} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.verifiedEmail, { color: colors.text.primary }]}>{googleEmail}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                    <CheckCircleIcon size={14} color="#10B981" />
                    <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '700', marginLeft: 4 }}>
                      Verified Google Account
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowGoogleModal(true)}
                style={[styles.switchAccountBtn, { backgroundColor: inputBg }]}
              >
                <Text style={{ fontSize: 12, color: colors.text.primary, fontWeight: '600' }}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.unverifiedContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <GoogleLogo size={24} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={[styles.googleCardTitle, { color: colors.text.primary }]}>Connect Google Account</Text>
                  <Text style={[styles.googleCardSub, { color: colors.text.muted }]}>
                    Links your verified email for encrypted cloud backup & security recovery alerts.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowGoogleModal(true)}
                style={[styles.googleActionBtn, { backgroundColor: primaryBtnBg }]}
                activeOpacity={0.8}
              >
                <GoogleLogo size={18} />
                <Text style={[styles.googleActionBtnText, { color: primaryBtnText }]}>
                  Verify with Google Account
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── 2. PERSONAL DETAILS FORM ────────────────────────── */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#CCCCCC' : colors.text.secondary, marginTop: 22 }]}>
          PERSONAL DETAILS
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Legal / Full Name</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBg, color: colors.text.primary }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Sri Ram Vignesh"
              placeholderTextColor={colors.text.muted}
            />
          </View>

          {/* Username / Handle */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Wallet Username / Handle</Text>
            <View style={[styles.handleInputWrapper, { backgroundColor: inputBg }]}>
              <Text style={{ color: '#8E8E93', fontWeight: '700', paddingLeft: 12 }}>@</Text>
              <TextInput
                style={[styles.handleInput, { color: colors.text.primary }]}
                value={username}
                onChangeText={setUsername}
                placeholder="sriram_vault"
                placeholderTextColor={colors.text.muted}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBg, color: colors.text.primary }]}
              value={email}
              onChangeText={setEmail}
              placeholder="user@example.com"
              placeholderTextColor={colors.text.muted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Country / Region */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Country / Jurisdiction</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
              {COUNTRIES.map((c) => {
                const isSelected = country === c;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCountry(c)}
                    style={[
                      styles.countryChip,
                      {
                        backgroundColor: isSelected ? primaryBtnBg : inputBg,
                        borderColor: isSelected ? primaryBtnBg : cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: isSelected ? '700' : '500',
                        color: isSelected ? primaryBtnText : colors.text.primary,
                      }}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Phone Number */}
          <View style={[styles.inputGroup, { marginBottom: 4 }]}>
            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Mobile Phone (Security 2FA)</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: inputBg, color: colors.text.primary }]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.text.muted}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* ── 3. HARDWARE BIOMETRICS TOGGLE ──────────────────── */}
        <Text style={[styles.sectionHeading, { color: isDark ? '#CCCCCC' : colors.text.secondary, marginTop: 22 }]}>
          SECURITY
        </Text>
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <LockShieldIcon size={16} color="#10B981" />
                <Text style={[styles.toggleTitle, { color: colors.text.primary, marginLeft: 6 }]}>
                  Biometric Face ID / Fingerprint
                </Text>
              </View>
              <Text style={[styles.toggleSub, { color: colors.text.muted, marginTop: 3 }]}>
                Require hardware biometric authentication for every outgoing transaction and seed phrase reveal.
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#3A3A3C', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ── 4. SAVE & CONTINUE BUTTON ───────────────────────── */}
        <TouchableOpacity
          onPress={handleSaveAndContinue}
          style={[styles.continueBtn, { backgroundColor: primaryBtnBg }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, { color: primaryBtnText }]}>
            Complete Details & Continue →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Google Account Selector Modal */}
      <Modal
        visible={showGoogleModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <GoogleLogo size={32} />
              <Text style={[styles.modalTitle, { color: colors.text.primary, marginTop: 10 }]}>
                Sign in with Google
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.text.muted }]}>
                to continue to Cura Self-Custody Vault
              </Text>
            </View>

            {isVerifyingGoogle ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#4285F4" />
                <Text style={{ marginTop: 12, color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>
                  Verifying Google Account...
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {[
                  { name: 'Sri Ram Vignesh', email: 'sri.ram.vignesh@gmail.com' },
                  { name: 'Work Account', email: 'sriram.dev@gmail.com' },
                ].map((acc) => (
                  <TouchableOpacity
                    key={acc.email}
                    onPress={() => handleSimulateGoogleLogin(acc.email)}
                    style={[styles.googleAccountOption, { backgroundColor: inputBg }]}
                  >
                    <View style={styles.avatarCircle}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                        {acc.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '700' }}>
                        {acc.name}
                      </Text>
                      <Text style={{ color: colors.text.muted, fontSize: 12 }}>{acc.email}</Text>
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  onPress={() => setShowGoogleModal(false)}
                  style={[styles.modalCancelBtn, { borderColor: cardBorder }]}
                >
                  <Text style={{ color: colors.text.secondary, fontWeight: '600', fontSize: 13 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  verifiedEmail: {
    fontSize: 15,
    fontWeight: '700',
  },
  switchAccountBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginLeft: 8,
  },
  unverifiedContainer: {
    paddingVertical: 4,
  },
  googleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  googleCardSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  googleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  googleActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  handleInputWrapper: {
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 6,
    fontSize: 15,
    fontWeight: '500',
  },
  countryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 12,
    lineHeight: 17,
  },
  continueBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  googleAccountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 0.5,
    marginTop: 6,
  },
});
