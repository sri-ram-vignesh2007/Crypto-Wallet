// src/components/CandlestickChart.tsx
// Lightweight candlestick chart rendered with react-native-svg (already installed).
// Props:
//   candles: number[][] in CoinGecko OHLC format [timestampMs, open, high, low, close]
//   positiveColor / negativeColor: candle fills for up/down candles.

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../theme/Theme';

interface Props {
  candles: number[][];
  width?: number;
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  axisColor?: string;
}

export function CandlestickChart({
  candles,
  width = 340,
  height = 220,
  positiveColor = theme.colors.success.DEFAULT,
  negativeColor = theme.colors.danger.DEFAULT,
  axisColor = theme.colors.text.muted,
}: Props) {
  const computed = useMemo(() => {
    if (!candles || candles.length === 0) return null;

    const padding = { top: 12, right: 56, bottom: 22, left: 8 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const highs = candles.map(c => c[2]);
    const lows = candles.map(c => c[3]);
    const max = Math.max(...highs);
    const min = Math.min(...lows);
    const range = max - min || 1;

    const xStep = innerW / candles.length;
    const candleBodyW = Math.max(2, xStep * 0.6);

    const yFor = (price: number) =>
      padding.top + (1 - (price - min) / range) * innerH;

    const elements: React.ReactNode[] = [];
    let prevClose = candles[0][1];

    candles.forEach((c, i) => {
      const [_t, o, h, l, cl] = c;
      const x = padding.left + i * xStep + xStep / 2;
      const isUp = cl >= prevClose;
      const color = isUp ? positiveColor : negativeColor;

      // Wick (high → low)
      elements.push(
        <Line
          key={`w-${i}`}
          x1={x} x2={x}
          y1={yFor(h)} y2={yFor(l)}
          stroke={color} strokeWidth={1}
        />
      );

      // Body (open → close)
      const bodyTop = yFor(Math.max(o, cl));
      const bodyBottom = yFor(Math.min(o, cl));
      const bodyHeight = Math.max(1, bodyBottom - bodyTop);
      elements.push(
        <Rect
          key={`b-${i}`}
          x={x - candleBodyW / 2}
          y={bodyTop}
          width={candleBodyW}
          height={bodyHeight}
          fill={color}
          rx={1}
        />
      );

      prevClose = cl;
    });

    // Right-side price axis ticks (min, mid, max)
    const ticks = [max, (max + min) / 2, min];
    const tickEls = ticks.map((v, i) => {
      const y = yFor(v);
      return (
        <SvgText
          key={`t-${i}`}
          x={width - padding.right + 6}
          y={y + 4}
          fontSize={10}
          fill={axisColor}
          fontFamily="monospace"
        >
          {formatPrice(v)}
        </SvgText>
      );
    });

    return { elements, tickEls, padding, innerW, innerH, range, min, max };
  }, [candles, width, height, positiveColor, negativeColor, axisColor]);

  if (!computed) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        {/* No data */}
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        {computed.elements}
        {computed.tickEls}
      </Svg>
    </View>
  );
}

function formatPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (v >= 1)   return v.toFixed(2);
  return v.toFixed(4);
}

const styles = StyleSheet.create({
  wrap: { alignSelf: 'center', marginVertical: 8 },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
