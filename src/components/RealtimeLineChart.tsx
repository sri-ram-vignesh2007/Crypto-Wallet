// src/components/RealtimeLineChart.tsx
// Realtime line chart for live 1s / 1m price ticks.
// Accumulates ticks passed in via props, renders a smooth gradient line.
// Optimised for fast re-renders (no SVG path animation — just redraw).

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../theme/Theme';

export interface Tick {
  price: number;
  ts: number; // ms epoch
}

interface Props {
  ticks: Tick[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  showAxis?: boolean;
  /** Insert a synthetic tick every 1s if no new poll arrived. */
  interpolate?: boolean;
}

export function RealtimeLineChart({
  ticks,
  width = 340,
  height = 220,
  color = theme.colors.primary.DEFAULT,
  showAxis = true,
}: Props) {
  const computed = useMemo(() => {
    if (!ticks || ticks.length < 2) return null;

    const padding = { top: 12, right: 56, bottom: 22, left: 6 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const prices = ticks.map(t => t.price);
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const range = (max - min) || (max * 0.001) || 1;

    const tsMin = ticks[0].ts;
    const tsMax = ticks[ticks.length - 1].ts;
    const tsRange = Math.max(1000, tsMax - tsMin);

    const xFor = (ts: number) => padding.left + ((ts - tsMin) / tsRange) * innerW;
    const yFor = (price: number) => padding.top + (1 - (price - min) / range) * innerH;

    // Line path
    const mainPath = ticks.map((t, i) => {
      const x = xFor(t.ts);
      const y = yFor(t.price);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');

    // Gradient fill under the line
    const fillPath = mainPath +
      ` L${xFor(ticks[ticks.length - 1].ts).toFixed(2)} ${(padding.top + innerH).toFixed(2)}` +
      ` L${xFor(ticks[0].ts).toFixed(2)} ${(padding.top + innerH).toFixed(2)} Z`;

    const gid = 'rtlc-grad';

    // Y-axis ticks
    const axisEls = showAxis ? [max, (max + min) / 2, min].map((v, i) => (
      <SvgText
        key={`a-${i}`}
        x={width - padding.right + 6}
        y={yFor(v) + 4}
        fontSize={10}
        fill={theme.colors.text.muted}
        fontFamily="monospace"
      >
        {formatPrice(v)}
      </SvgText>
    )) : [];

    // Latest price dot
    const dotCx = xFor(ticks[ticks.length - 1].ts);
    const dotCy = yFor(ticks[ticks.length - 1].price);

    // Previous price for color direction
    const prev = ticks.length > 1 ? ticks[ticks.length - 2].price : ticks[0].price;
    const last = ticks[ticks.length - 1].price;
    const isUp = last >= prev;

    return { mainPath, fillPath, gid, axisEls, dotCx, dotCy, padding, isUp };
  }, [ticks, width, height, color]);

  if (!computed) {
    return (
      <View style={[styles.placeholder, { width, height }]}>
        <SvgText x={width / 2} y={height / 2} fontSize={12} fill={theme.colors.text.muted} textAnchor="middle">
          Awaiting live ticks…
        </SvgText>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={computed.gid} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Gradient fill under curve */}
        <Path d={computed.fillPath} fill={`url(#${computed.gid})`} />

        {/* Main price line */}
        <Path
          d={computed.mainPath}
          stroke={computed.isUp ? theme.colors.success.DEFAULT : theme.colors.danger.DEFAULT}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Latest price dot */}
        <Rect x={computed.dotCx - 4} y={computed.dotCy - 4} width={8} height={8} rx={4}
          fill={computed.isUp ? theme.colors.success.DEFAULT : theme.colors.danger.DEFAULT} />

        {/* Y-axis labels */}
        {computed.axisEls}
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
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
