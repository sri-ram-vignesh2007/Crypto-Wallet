// src/screens/onboarding/OTPScreen.tsx
// Clean OTP Verification Screen

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TextInput as RNTextInput, KeyboardAvoidingView, Platform, Text, SafeAreaView } from 'react-native';
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

export default function OTPScreen({ route, navigation }: any) {
  const { otpCode, email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const inputRefs = useRef<(RNTextInput | null)[]>([]);
  const { setEmailVerified } = useProfileStore();

  const colors = useColors();
  const spacing = useSpacing();
  const borderRadius = useBorderRadius();
  const typography = useTypography();
  const isDark = useIsDark();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) text = text[0];

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    setError('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newCode.join('');
    if (fullCode.length === 6) {
      if (fullCode === otpCode) {
        setEmailVerified(true);
        setTimeout(() => navigation.navigate('Name'), 300);
      } else {
        setError('Invalid code. Check the code in your terminal logs.');
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendCode = () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('NEW DEMO OTP CODE:', newCode);
    navigation.setParams({ otpCode: newCode });
    setTimer(60);
    setCode(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.canvas }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.content}>
          <Text style={[styles.step, { color: colors.primary.DEFAULT }]}>Step 2 of 4</Text>
          <Text style={[styles.title, { color: colors.text.primary }]}>Enter verification code</Text>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            We sent a 6-digit code to
            {'\n'}
            <Text style={[styles.emailHighlight, { color: colors.primary.DEFAULT }]}>{email}</Text>
          </Text>

          <View style={styles.codeRow}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <RNTextInput
                key={i}
                ref={(ref) => { inputRefs.current[i] = ref; }}
                style={[
                  styles.codeBox,
                  code[i] ? styles.codeBoxFilled : null,
                  error ? styles.codeBoxError : null,
                  {
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: colors.border.DEFAULT,
                    backgroundColor: colors.bg.surfaceElevated,
                    color: colors.text.primary,
                    fontSize: 22,
                    fontWeight: '700',
                  },
                ]}
                value={code[i]}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectionColor={colors.primary.DEFAULT}
                textAlign="center"
              />
            ))}
          </View>

          {error ? <Text style={[styles.error, { color: colors.danger.DEFAULT }]}>{error}</Text> : null}

          <Text style={[styles.demoHint, { color: colors.text.muted }]}>
            Demo: Check your terminal (Metro logs) for the OTP code
          </Text>

          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: colors.text.secondary }]}>Didn't receive it? </Text>
            {timer > 0 ? (
              <Text style={[styles.timer, { color: colors.text.muted }]}>Resend in {timer}s</Text>
            ) : (
              <Text style={[styles.resendLink, { color: colors.primary.DEFAULT }]} onPress={resendCode}>
                Resend code
              </Text>
            )}
          </View>
        </View>
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
    marginBottom: 40,
  },
  emailHighlight: {
    fontWeight: '600',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    textAlign: 'center',
  },
  codeBoxFilled: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  codeBoxError: {
    borderColor: '#DC2626',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  demoHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  timer: {
    fontSize: 14,
  },
});