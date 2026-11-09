// src/components/TokenLogo.tsx - Consistent Institutional Vector Badges for Cura Wallet

import React from 'react';
import Svg, { Circle, Path, Rect, Polygon, Text as SvgText } from 'react-native-svg';

interface TokenLogoProps {
  symbol: string;
  size?: number;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ symbol, size = 36 }) => {
  const sym = (symbol || '').toUpperCase().trim();

  switch (sym) {
    case 'BTC':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#F7931A" />
          <Path
            d="M23.18 15.28c.41-2.73-1.67-4.2-4.52-5.18l.92-3.7-2.25-.56-.9 3.6c-.59-.15-1.2-.29-1.8-.43l.9-3.62-2.24-.56-.93 3.72c-.49-.11-.97-.22-1.42-.34l-3.1-.77-.6 2.4s1.67.38 1.63.41c.91.23 1.08.83 1.05 1.3l-1.05 4.22c.06.02.14.04.23.07-.07-.02-.15-.05-.23-.07l-1.48 5.92c-.11.28-.4.7-.1.05 0 0-1.64-.41-1.64-.41l-1.12 2.6 2.92.73c.54.14 1.07.28 1.6.41l-.94 3.77 2.25.56.93-3.73c.61.17 1.21.32 1.79.46l-.92 3.7 2.25.56.94-3.75c3.84.73 6.73.43 7.95-3.04.98-2.79-.05-4.4-2.07-5.45 1.47-.34 2.58-1.31 2.88-3.32zm-5.14 7.25c-.7 2.79-5.41 1.28-6.93.9l1.24-4.96c1.52.38 6.42 1.13 5.69 4.06zm.7-7.29c-.64 2.55-4.57 1.26-5.85.94l1.12-4.5c1.28.32 5.39.92 4.73 3.56z"
            fill="#FFFFFF"
          />
        </Svg>
      );

    case 'ETH':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#627EEA" />
          <Path d="M18 6.5v11.1l7.8 3.5L18 6.5z" fill="#DDE2FB" />
          <Path d="M18 6.5L10.2 21.1l7.8-3.5V6.5z" fill="#FFFFFF" />
          <Path d="M18 22.8v6.7l7.8-10.7L18 22.8z" fill="#DDE2FB" />
          <Path d="M18 29.5v-6.7L10.2 18.8 18 29.5z" fill="#FFFFFF" />
        </Svg>
      );

    case 'SOL':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#111111" />
          <Path d="M10 23.5l3.2-3.2h12.8l-3.2 3.2H10z" fill="#14F195" />
          <Path d="M13.2 18l-3.2-3.2h12.8l3.2 3.2H13.2z" fill="#9945FF" />
          <Path d="M10 12.5l3.2-3.2h12.8l-3.2 3.2H10z" fill="#00FFA3" />
        </Svg>
      );

    case 'USDC':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#2775CA" />
          <Circle cx="18" cy="18" r="11" stroke="#FFFFFF" strokeWidth="1.8" strokeDasharray="3 3" />
          <SvgText x="18" y="24" fontSize="16" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
            $
          </SvgText>
        </Svg>
      );

    case 'AVAX':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#E84142" />
          <Path
            d="M18 9l8.5 15h-4.2L18 16.2 13.7 24H9.5L18 9z"
            fill="#FFFFFF"
          />
          <Polygon points="18,17.5 21.5,23.5 14.5,23.5" fill="#E84142" />
        </Svg>
      );

    case 'NEAR':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#000000" />
          <Path
            d="M12 25.5V10.5h3.6l7.4 10.8V10.5h3v15h-3.6L15 14.7v10.8H12z"
            fill="#00E699"
          />
        </Svg>
      );

    case 'RENDER':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#D32F2F" />
          <Circle cx="18" cy="18" r="6" stroke="#FFFFFF" strokeWidth="2.5" />
          <Circle cx="18" cy="10" r="2.2" fill="#FFFFFF" />
          <Circle cx="24.9" cy="22" r="2.2" fill="#FFFFFF" />
          <Circle cx="11.1" cy="22" r="2.2" fill="#FFFFFF" />
        </Svg>
      );

    case 'ARB':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#28A0F0" />
          <Path
            d="M18 9l6.5 14.5h-4L18 18.2l-2.5 5.3h-4L18 9z"
            fill="#FFFFFF"
          />
          <Polygon points="18,13 21,20 15,20" fill="#28A0F0" />
        </Svg>
      );

    case 'MATIC':
    case 'POL':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#8247E5" />
          <Path
            d="M21.5 15.5l-3.5-2-3.5 2v4l3.5 2 3.5-2v-4zM18 10l6.5 3.8v7.5L18 25l-6.5-3.7v-7.5L18 10z"
            fill="#FFFFFF"
          />
        </Svg>
      );

    case 'OP':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#FF0420" />
          <Circle cx="14" cy="18" r="4.5" stroke="#FFFFFF" strokeWidth="2.5" />
          <Path d="M21 13.5h3a4 4 0 0 1 0 8h-3v-8z" stroke="#FFFFFF" strokeWidth="2.5" />
        </Svg>
      );

    case 'LINK':
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#375BD2" />
          <Polygon
            points="18,10 24.5,14 24.5,22 18,26 11.5,22 11.5,14"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            fill="none"
          />
          <Circle cx="18" cy="18" r="2.8" fill="#FFFFFF" />
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
          <Circle cx="18" cy="18" r="18" fill="#262626" />
          <SvgText
            x="18"
            y="22"
            fontSize="12"
            fontWeight="bold"
            fill="#FFFFFF"
            textAnchor="middle"
          >
            {sym.slice(0, 3)}
          </SvgText>
        </Svg>
      );
  }
};

