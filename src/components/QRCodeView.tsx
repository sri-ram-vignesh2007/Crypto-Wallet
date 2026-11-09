// src/components/QRCodeView.tsx
// Stunning Institutional-Grade Fintech QR Code View
// Features rounded micro-modules, Apple-style eye finder patterns, optical corner brackets, and center token emblem

import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Rect, Circle, Path, G } from 'react-native-svg';
import { encodeQR } from '../utils/QRCode';

interface Props {
  value: string;
  size?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  centerSymbol?: string;
  centerLogo?: React.ReactNode;
  showViewfinderCorners?: boolean;
}

export default function QRCodeView({
  value,
  size = 230,
  backgroundColor = '#FFFFFF',
  foregroundColor = '#0A0A0A',
  centerSymbol = 'ETH',
  centerLogo,
  showViewfinderCorners = true,
}: Props) {
  const qr = useMemo(() => {
    try {
      return encodeQR(value);
    } catch {
      return null;
    }
  }, [value]);

  if (!qr || qr.size === 0) return null;

  const matrixSize = qr.size;
  const moduleSize = size / matrixSize;

  // Center emblem clearance zone (approx 5x5 modules in the exact center)
  const centerRadius = 2.5;
  const centerCoord = matrixSize / 2;

  const isFinderPattern = (r: number, c: number) => {
    // Top-left 7x7
    if (r < 7 && c < 7) return true;
    // Top-right 7x7
    if (r < 7 && c >= matrixSize - 7) return true;
    // Bottom-left 7x7
    if (r >= matrixSize - 7 && c < 7) return true;
    return false;
  };

  const isCenterZone = (r: number, c: number) => {
    return (
      Math.abs(r - centerCoord + 0.5) <= centerRadius &&
      Math.abs(c - centerCoord + 0.5) <= centerRadius
    );
  };

  // Render individual data modules with smooth rounded squircles
  const dataCells: React.ReactNode[] = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c) || isCenterZone(r, c)) {
        continue;
      }
      if (qr.matrix[r][c]) {
        const x = c * moduleSize;
        const y = r * moduleSize;
        const radius = moduleSize * 0.36;

        dataCells.push(
          <Rect
            key={`${r}-${c}`}
            x={x + 0.3}
            y={y + 0.3}
            width={moduleSize - 0.6}
            height={moduleSize - 0.6}
            rx={radius}
            ry={radius}
            fill={foregroundColor}
          />
        );
      }
    }
  }

  // Helper to render high-fidelity Apple-style Finder Eye Patterns (7x7)
  const renderFinderEye = (startX: number, startY: number, key: string) => {
    const eyeSize = 7 * moduleSize;
    const outerRx = moduleSize * 1.8;
    const innerRx = moduleSize * 1.2;
    const centerDotRx = moduleSize * 0.9;

    return (
      <G key={key}>
        {/* Outer Solid Rounded Square */}
        <Rect
          x={startX}
          y={startY}
          width={eyeSize}
          height={eyeSize}
          rx={outerRx}
          ry={outerRx}
          fill={foregroundColor}
        />
        {/* Middle Clear Cutout */}
        <Rect
          x={startX + moduleSize}
          y={startY + moduleSize}
          width={eyeSize - 2 * moduleSize}
          height={eyeSize - 2 * moduleSize}
          rx={innerRx}
          ry={innerRx}
          fill={backgroundColor}
        />
        {/* Center Solid Rounded Squircle */}
        <Rect
          x={startX + 2 * moduleSize}
          y={startY + 2 * moduleSize}
          width={eyeSize - 4 * moduleSize}
          height={eyeSize - 4 * moduleSize}
          rx={centerDotRx}
          ry={centerDotRx}
          fill={foregroundColor}
        />
      </G>
    );
  };

  const finderEyes = [
    renderFinderEye(0, 0, 'eye-tl'),
    renderFinderEye((matrixSize - 7) * moduleSize, 0, 'eye-tr'),
    renderFinderEye(0, (matrixSize - 7) * moduleSize, 'eye-bl'),
  ];

  // Center Emblem dimensions
  const centerBadgeSize = Math.max(38, Math.round(size * 0.18));
  const centerOffset = (size - centerBadgeSize) / 2;

  // Viewfinder bracket dimension
  const bracketLen = 16;
  const bracketOffset = 10;
  const cardTotalSize = size + 36;

  return (
    <View style={styles.outerContainer}>
      {/* Decorative Optical Viewfinder Framing Brackets */}
      {showViewfinderCorners && (
        <Svg width={cardTotalSize} height={cardTotalSize} style={styles.viewfinderSvg}>
          {/* Top-Left Bracket */}
          <Path
            d={`M${bracketOffset + bracketLen} ${bracketOffset} H${bracketOffset} V${bracketOffset + bracketLen}`}
            stroke={foregroundColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
          {/* Top-Right Bracket */}
          <Path
            d={`M${cardTotalSize - bracketOffset - bracketLen} ${bracketOffset} H${cardTotalSize - bracketOffset} V${bracketOffset + bracketLen}`}
            stroke={foregroundColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
          {/* Bottom-Left Bracket */}
          <Path
            d={`M${bracketOffset + bracketLen} ${cardTotalSize - bracketOffset} H${bracketOffset} V${cardTotalSize - bracketOffset - bracketLen}`}
            stroke={foregroundColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
          {/* Bottom-Right Bracket */}
          <Path
            d={`M${cardTotalSize - bracketOffset - bracketLen} ${cardTotalSize - bracketOffset} H${cardTotalSize - bracketOffset} V${cardTotalSize - bracketOffset - bracketLen}`}
            stroke={foregroundColor}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.35}
          />
        </Svg>
      )}

      {/* Main QR Card */}
      <View style={[styles.qrCanvas, { width: size + 24, height: size + 24, backgroundColor }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {finderEyes}
          {dataCells}
        </Svg>

        {/* Floating Center Brand Plate */}
        <View
          style={[
            styles.centerEmblemBadge,
            {
              width: centerBadgeSize,
              height: centerBadgeSize,
              borderRadius: centerBadgeSize / 2,
              backgroundColor,
              left: centerOffset + 12,
              top: centerOffset + 12,
            },
          ]}
        >
          {centerLogo ? (
            centerLogo
          ) : (
            <View style={[styles.defaultTokenPill, { backgroundColor: foregroundColor }]}>
              <Text style={[styles.defaultTokenText, { color: backgroundColor }]}>
                {centerSymbol.slice(0, 4)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
    padding: 6,
  },
  viewfinderSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  qrCanvas: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  centerEmblemBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  defaultTokenPill: {
    width: '82%',
    height: '82%',
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultTokenText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
