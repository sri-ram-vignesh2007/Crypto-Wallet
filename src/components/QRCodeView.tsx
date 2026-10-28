// src/components/QRCodeView.tsx
// Renders a QR matrix produced by utils/QRCode.ts as React Native SVG.
// Uses the already-installed react-native-svg — no new dependency.

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { encodeQR } from '../utils/QRCode';

interface Props {
  value: string;
  size?: number;        // pixel dimensions of the rendered QR
  backgroundColor?: string;
  foregroundColor?: string;
}

export default function QRCodeView({
  value,
  size = 220,
  backgroundColor = '#ffffff',
  foregroundColor = '#0A0A0A',
}: Props) {
  const qr = useMemo(() => encodeQR(value), [value]);

  const moduleSize = size / qr.size;

  if (!qr || qr.size === 0) return null;

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < qr.size; r++) {
    for (let c = 0; c < qr.size; c++) {
      if (qr.matrix[r][c]) {
        cells.push(
          <Rect
            key={`${r}-${c}`}
            x={c * moduleSize}
            y={r * moduleSize}
            width={moduleSize}
            height={moduleSize}
            fill={foregroundColor}
          />
        );
      }
    }
  }

  return (
    <View style={[styles.wrap, { backgroundColor }]}>
      <Svg width={size} height={size}>
        {cells}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
});
