// src/screens/onboarding/NameScreen.tsx
// Clean Name Input Screen

import React, { useState } from 'react';
import {
  View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, SafeAreaView,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
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

export default function NameScreen({ navigation }: { navigation: any }) {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isDark = useIsDark();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { setName } = useProfileStore();

  const handleContinue = () => {
    if (firstName.trim()) {
      setName(`${firstName.trim()} ${lastName.trim()}`.trim());
      navigation.navigate('ProfileSetup');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={[styles.step, { color: colors.primary.DEFAULT }]}>Step 3 of 4</Text>
            <Text style={[styles.title, { color: colors.text.primary }]}>What's your name?</Text>
            <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
              This will be displayed on your profile and transaction receipts.
            </Text>

            <TextInput
              mode="outlined"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.text.muted}
              autoFocus
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg.surfaceElevated,
                  borderRadius: borderRadius.input,
                  textColor: colors.text.primary,
                  outlineColor: colors.border.DEFAULT,
                  activeOutlineColor: colors.primary.DEFAULT,
                  contentStyle: { backgroundColor: colors.bg.surfaceElevated },
                },
              ]}
            />

            <TextInput
              mode="outlined"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name (optional)"
              placeholderTextColor={colors.text.muted}
              style={[
                styles.input,
                { marginTop: 12 },
                {
                  backgroundColor: colors.bg.surfaceElevated,
                  borderRadius: borderRadius.input,
                  textColor: colors.text.primary,
                  outlineColor: colors.border.DEFAULT,
                  activeOutlineColor: colors.primary.DEFAULT,
                  contentStyle: { backgroundColor: colors.bg.surfaceElevated },
                },
              ]}
            />
          </View>

          <View style={styles.bottom}>
            <Button
              mode="contained"
              onPress={handleContinue}
              disabled={!firstName.trim()}
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
              Continue
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    fontSize: 16,
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