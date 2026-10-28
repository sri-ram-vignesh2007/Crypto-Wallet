// src/screens/ScannerScreen.tsx
// QR Code scanner for sending crypto — scan any wallet address

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../theme/Theme';

export default function ScannerScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedAddress, setScannedAddress] = useState('');

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setScannedAddress(data);
    
    // Validate Ethereum address
    if (data.startsWith('0x') && data.length === 42) {
      Alert.alert(
        'Address Scanned',
        `${data.slice(0, 10)}...${data.slice(-8)}`,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { 
            text: 'Send To This Address', 
            onPress: () => navigation.navigate('Send', { prefillAddress: data })
          },
        ]
      );
    } else {
      Alert.alert('Invalid Address', 'This QR code does not contain a valid crypto address.', [
        { text: 'OK', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.subtitle}>We need camera access to scan QR codes.</Text>
        <Button mode="contained" onPress={requestPermission} buttonColor={theme.colors.primary}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.subtitle}>Point camera at a wallet address QR code</Text>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
        </View>
      </View>

      {scanned && (
        <Card style={styles.resultCard}>
          <Card.Content>
            <Text style={styles.resultLabel}>Scanned Address</Text>
            <Text style={styles.resultAddress}>{scannedAddress}</Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('Send', { prefillAddress: scannedAddress })}
              style={{ marginTop: 12 }}
              buttonColor={theme.colors.primary}
            >
              Send Crypto
            </Button>
            <Button
              mode="text"
              onPress={() => setScanned(false)}
              textColor={theme.colors.textSecondary}
              style={{ marginTop: 8 }}
            >
              Scan Again
            </Button>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginTop: 40 },
  subtitle: { color: theme.colors.textMuted, marginBottom: 20, marginTop: 4 },
  cameraContainer: {
    width: '100%',
    height: 350,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  camera: { flex: 1 },
  scanOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  resultCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.border,
    borderWidth: 1,
    marginTop: 20,
    borderRadius: 14,
  },
  resultLabel: { color: theme.colors.textMuted, fontSize: 12, textTransform: 'uppercase' },
  resultAddress: { color: theme.colors.text, fontSize: 14, fontFamily: 'monospace', marginTop: 6 },
});