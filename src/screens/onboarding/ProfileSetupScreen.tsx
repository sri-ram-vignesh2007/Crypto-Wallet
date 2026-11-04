// src/screens/onboarding/ProfileSetupScreen.tsx
// Clean Profile Setup Screen - Choose Avatar

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Text, SafeAreaView } from 'react-native';
import { Button } from 'react-native-paper';
import { useProfileStore } from '../../store/profileStore';
import { useColors, useIsDark, useSpacing, useBorderRadius, useTypography } from '../../theme/ThemeContext';

// Safe area hook with fallback
let useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
try {
  const safeAreaContext = require('react-native-safe-area-context');
  if (safeAreaContext.useSafeAreaInsets) {
    useSafeAreaInsets = safeAreaContext.useSafeAreaInsets;
  }
} catch (e) {
  // Fallback already defined
}

const AVATARS = ['U', 'L', 'T', 'F', 'P', 'K', 'G', 'O', 'A', 'R', 'S', 'N'];

export default function ProfileSetupScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isDark = useIsDark();

  const [selectedAvatar, setSelectedAvatar] = useState('U');
  const { setAvatar, setOnboardingComplete, setSignedIn, name } = useProfileStore();

  const handleFinish = () => {
    setAvatar(selectedAvatar);
    setSignedIn(true);
    navigation.reset({
      index: 0,
      routes: [{ name: 'CreateWallet' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg.canvas} />

      <View style={styles.content}>
        <Text style={[styles.step, { color: colors.primary.DEFAULT }]}>Step 4 of 4</Text>
        <Text style={[styles.title, { color: colors.text.primary }]}>Choose your avatar</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
          Pick an avatar that represents you.
        </Text>

        <View style={[
          styles.previewCard,
          { backgroundColor: colors.bg.surfaceElevated, borderColor: colors.border.subtle },
        ]}>
          <Text style={[
            styles.previewAvatar,
            { color: colors.text.primary, fontSize: 64 },
          ]}>
            {selectedAvatar}
          </Text>
          <Text style={[
            styles.previewName,
            { color: colors.text.primary, fontSize: 20, fontWeight: '700' },
          ]}>
            {name || 'Your Name'}
          </Text>
          <Text style={[
            styles.previewHandle,
            { color: colors.text.muted, fontSize: 14 },
          ]}>
            @cryptovault_user
          </Text>
        </View>

        <View style={styles.avatarGrid}>
          {AVATARS.map((avatar) => (
            <TouchableOpacity
              key={avatar}
              style={[
                styles.avatarBox,
                {
                  backgroundColor: colors.bg.surfaceElevated,
                  borderColor: selectedAvatar === avatar ? colors.primary.DEFAULT : 'transparent',
                  backgroundColor: selectedAvatar === avatar ? colors.primary.muted : colors.bg.surfaceElevated,
                },
              ]}
              onPress={() => setSelectedAvatar(avatar)}
            >
              <Text style={[
                styles.avatarText,
                { color: selectedAvatar === avatar ? colors.primary.DEFAULT : colors.text.primary, fontSize: 28 },
              ]}>
                {avatar}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottom}>
        <Button
          mode="contained"
          onPress={handleFinish}
          style={[
            styles.primaryBtn,
            {
              borderRadius: borderRadius.button,
              paddingVertical: spacing.sm,
              buttonColor: colors.primary.DEFAULT,
            },
          ]}
          textColor="#FFFFFF"
          labelStyle={{ fontSize: 16, fontWeight: '700' }}
        >
          Create Wallet
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  step: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 32,
  },
  previewCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  previewAvatar: {
    fontSize: 64,
    marginBottom: 12,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewHandle: {
    fontSize: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 28,
  },
  bottom: {
    padding: 24,
    paddingBottom: 40,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 6,
  },
});