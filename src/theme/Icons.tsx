// src/theme/Icons.tsx
// Vault System — Consistent Lucide-style rounded outline icon family
// One icon family, one optical weight, one semantic mapping.
// Stroke: 1.8–2 px consistent throughout. Default inherits text.secondary.
// Active/primary action icons use action.primary; destructive icons use status.danger only in destructive contexts.

import React from 'react';
import Svg, { Path, Circle, Line, Rect, Polyline } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const STROKE_WIDTH = 1.8; // Consistent optical weight per spec

const defaultProps = { size: 24, color: 'currentColor', strokeWidth: STROKE_WIDTH };

// Map common concepts consistently per spec:
// Home = House; Explore = Compass; Actions = Plus; Send = ArrowUpRight;
// Receive = ArrowDownLeft; Swap = ArrowLeftRight; Scan = ScanLine;
// Activity = ReceiptText/Clock3; Security = ShieldCheck; Risk = ShieldAlert or TriangleAlert;
// AI = Sparkles or MessageSquareSparkle; Wallet = WalletCards; Copy = Copy; Share = Share2;
// Network = Network; Settings = Settings2; Help = CircleHelp; Back = ChevronLeft.

// Utility to create a consistent icon
const createIcon = (props: IconProps, d: string) => (
  <Svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke={props.color} strokeWidth={props.strokeWidth || STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round">
    <Path d={d} />
  </Svg>
);

// Home = House
export function HomeIcon({ size = 24, color }: { size?: number; color?: string }) {
  return createIcon({ size, color }, 'M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z');
}

// Explore = Compass
export function ExploreIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 2a20 20 0 1 0 0 40 20 20 0 0 0 0-40z');
}

// Actions = Plus (center circular button)
export function ActionsIcon({ size = 28, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 5v14M5 12h14');
}

// Send = ArrowUpRight
export function SendIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 19l-7-7 7-7');
}

// Receive = ArrowDownLeft
export function ReceiveIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M5 12h14M12 5l7 7M5 12l7 7');
}

// Swap = ArrowLeftRight
export function SwapIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M7 16h10M11 12v4M17 8v8a5 5 0 0 1-10 0M17 8a5 5 0 0 1-10 0');
}

// Scan = ScanLine
export function ScanIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M3 7V5a2 2 0 0 1 2-2h2M17 5h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2');
}

// Activity = Clock3
export function ActivityIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z');
}

// Security = ShieldCheck
export function ShieldCheckIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
}

// Risk = ShieldAlert or TriangleAlert
export function ShieldAlertIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
}

// AI = Sparkles
export function SparklesIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83');
}

// Wallet = WalletCards
export function WalletIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z');
}

// Copy = Copy
export function CopyIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1');
}

// Share = Share2
export function ShareIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6');
}

// Network = Network
export function NetworkIcon({ size = 16, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M2 12h20M12 2a20 20 0 1 0 0 40 20 20 0 0 0 0-40z');
}

// Settings = Settings2
export function SettingsIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 2v4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2vz');
}

// Help = CircleHelp
export function HelpIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
}

// Back = ChevronLeft
export function ChevronLeftIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M15 18l-6-6-6 6');
}

// Alert triangle (for warning risk state)
export function TriangleAlertIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 2l.8-1.9-5 5.3L19 9l-5 4.5 5 5.3-.8 1.9H12z');
}

// Lock (for biometrics/security)
export function LockIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M7 11V7a5 5 0 0 1 10 0v4');
}

// Unlock
export function UnlockIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M7 11V7a5 5 0 0 1 10 0v4');
}

// Fingerprint
export function FingerprintIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M22.68 14a15 15 0 0 1-2.79 2M20.92 11a11 11 0 0 1-1.96 1.5M18.3 8.5a7 7 0 0 1-1.34 1M15.32 6.5a4 4 0 0 1-.68.5M12.5 5.5a2 2 0 0 1-.4.5');
}

// Alert (general)
export function AlertIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9l1.71 1.71M12 17l1.71 1.71');
}

// Success
export function SuccessIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M22 11.08V12a10 10 0 1 1-5.93-9.14Polyline points="22 4 12 14.01 9 11.01"');
}

// Error
export function ErrorIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 12a10 10 0 1 1-10-10M12 8v4l3 3');
}

// Clock
export function Clock2Icon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 6v6l4 2');
}

// More vertical
export function MoreVerticalIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
}

// More horizontal
export function MoreHorizontalIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z');
}

// File
export function FileIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2h6a2 2 0 0 1 2 2v16a2 2 0 0 0 2-2h-6');
}

// File Text
export function FileTextIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2h6a2 2 0 0 1 2 2v16a2 2 0 0 0 2-2h-6M10 13h4v7H6v-7z');
}

// Token
export function TokenIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M12 8v8M8 12h8');
}

// Chain
export function ChainIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14H4M10 18H4');
}

// Seed phrase
export function SeedPhraseIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M3 3h18M3 9h18M3 15h18');
}

// Biometric
export function BiometricIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M7 11V7a5 5 0 0 1 10 0v4');
}

// Warning
export function WarningIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9l.8.8-5 5.3L19 9l-5 4.5 5 5.3-.8.8H12z');
}

// Success check
export function CheckmarkIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M20 6L9 17l5 5');
}

// Back
export function BackIcon({ size = 24, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, 'M15 18l-6-6-6 6');
}

// 20px inline action icon
export function InlineActionIcon({ size = 20, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, '');
}

// 28px primary action shortcut icon
export function PrimaryActionIcon({ size = 28, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, '');
}

// 16px compact metadata icon
export function CompactMetadataIcon({ size = 16, color }: { size?: number; color: string }) {
  return createIcon({ size, color }, '');
}