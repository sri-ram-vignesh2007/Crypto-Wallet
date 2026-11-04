# Crypto Wallet 🛡️⚡

An AI-powered, multi-chain, non-custodial cryptocurrency wallet built with React Native and Expo (SDK 57).

[![Expo SDK 57](https://img.shields.io/badge/Expo-v57.0.0-blue.svg)](https://docs.expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## ✨ Features

- **🌐 Multi-Chain EVM & Non-EVM Support**:
  - Ethereum, Arbitrum, Optimism, Base, Polygon, BNB Smart Chain, Avalanche, Solana, and Bitcoin.
  - Multi-RPC failover manager with auto-switching for 99.99% uptime.
- **🔐 True Non-Custodial Security**:
  - Hierarchical Deterministic (HD) BIP-39 12/24-word seed phrase generation and import.
  - AES-256 hardware-backed encryption using `expo-secure-store`.
  - Biometric authentication (`expo-local-authentication` Face ID / Fingerprint) & PIN auto-lock.
- **🤖 Autonomous AI Multi-Agent Coordinator**:
  - **AI Assistant Chatbot**: Natural language interaction for gas analysis, transaction explanations, and DeFi guidance.
  - **Transaction Risk Analyzer**: Real-time scoring (0–100) flagging honeypots, unlimited token approvals, and drainer contracts before broadcast.
  - **AI Scam Detector**: Comprehensive contract and address scanning.
  - **Portfolio AI & Tax Insights**: Rebalancing recommendations, P/L analytics, and CSV tax export.
  - **Trading & Intelligence Agents**: Whale tracking, smart money signals, and token metrics.
- **🔄 On-Chain Swaps & Fiat On-Ramp**:
  - Integrated token swap interface with custom slippage protection.
  - Fiat crypto purchases via MoonPay and Transak.
- **🎨 Apple-Inspired Design System**:
  - Clean, minimalist aesthetic with fluid light and dark mode adaptations.
  - Interactive SVG financial charts and candlestick visualizations.

---

## 🏗️ Architecture & Project Structure

```
Crypto-Wallet/
├── App.tsx                     # Main navigation container & tab navigator
├── app.json                    # Expo configuration
├── package.json                # Project dependencies and scripts
├── metro.config.js             # Metro bundler configuration
├── tsconfig.json               # TypeScript configuration
├── assets/                     # App icons, splash screens, favicons
├── backend/                    # Optional Python FastAPI AI backend service
│   ├── main.py
│   ├── config.py
│   ├── requirements.txt
│   └── routers/                # AI, market, swap, and wallet endpoints
└── src/
    ├── components/             # Reusable UI components (ClayButton, Card, Charts, FAB)
    ├── core/                   # Core Web3 logic (ChainConfig, RPCManager, KeyManager)
    ├── hooks/                  # Custom React hooks (useAppLock)
    ├── polyfills.ts            # Crypto shims (ethers, buffer, bip39)
    ├── screens/                # Modular application screens
    │   ├── onboarding/         # Welcome, Email, OTP, Name, Profile, SeedPhrase
    │   ├── HomeScreen.tsx      # Dashboard & asset overview
    │   ├── ExploreScreen.tsx   # Markets, trending coins, news
    │   ├── ActivityScreen.tsx  # Transaction history & receipts
    │   ├── SettingsScreen.tsx  # App settings, security, preferences
    │   ├── SendScreen.tsx      # Multi-asset send flow with QR scanner
    │   ├── ReceiveScreen.tsx   # QR code address generator
    │   ├── SwapScreen.tsx      # Token swap interface
    │   ├── BuyScreen.tsx       # Fiat on-ramp integration
    │   └── AIChatbotScreen.tsx # AI Web3 conversational assistant
    ├── services/               # Background services (AI, Price, Security, Swap, Supabase)
    ├── store/                  # Zustand state stores (walletStore, profileStore)
    └── theme/                  # Design tokens, color palettes, and typography
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS or Android)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sri-ram-vignesh2007/Crypto-Wallet.git
   cd Crypto-Wallet
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Launch on Device / Simulator:**
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Press `w` for Web
   - Scan the QR code using the Expo Go app on your phone

---

## 🔒 Security Best Practices

- **Never commit private keys, seed phrases, or sensitive API secrets.**
- All sensitive mnemonic material is stored encrypted on-device via `expo-secure-store`.
- Transactions require explicit user authentication before signing.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
