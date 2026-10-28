from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# Set default font
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

# Title Page
doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()
title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("CryptoVaultAI: AI-Powered Non-Custodial Crypto Wallet")
run.bold = True
run.font.size = Pt(24)

doc.add_paragraph()
subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run("Project Documentation and Report")
run.font.size = Pt(18)

doc.add_paragraph()
doc.add_paragraph()
info = doc.add_paragraph()
info.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = info.add_run("Developed with React Native and Expo\nIntegration of Artificial Intelligence for Enhanced Crypto Management")
run.font.size = Pt(12)

doc.add_page_break()

# Certificate
doc.add_heading('Certificate', level=1)
doc.add_paragraph("This is to certify that the project report titled \"CryptoVaultAI: AI-Powered Non-Custodial Crypto Wallet\" has been successfully completed by the developer(s) in partial fulfillment of the requirements for the award of the degree. The project work has been carried out under our guidance and supervision. The project embodies original thought, systematic investigation, and technical rigor.")

doc.add_paragraph("Submitted By: CryptoVaultAI Development Team")
doc.add_paragraph("Guide: Faculty Mentor")
doc.add_paragraph("Department: Computer Science and Blockchain Technology")

doc.add_page_break()

# Acknowledgement
doc.add_heading('Acknowledgement', level=1)
doc.add_paragraph("The developer(s) wish to express deep sense of gratitude and indebtedness to all those who helped in the successful completion of this project. Special thanks to the open-source community for providing excellent libraries and tools that made this project possible. Gratitude is also extended to the Expo and React Native communities for their continuous support and documentation. The guidance provided by mentors and peers has been invaluable in shaping the direction and implementation of this project. Finally, sincere thanks to all users and contributors who provided feedback and feature requests that helped shape the evolution of CryptoVaultAI.")

doc.add_page_break()

# Abstract
doc.add_heading('Abstract', level=1)
doc.add_paragraph("CryptoVaultAI is a decentralized, non-custodial cryptocurrency wallet mobile application built with React Native and Expo, designed to provide secure digital asset management while integrating artificial intelligence capabilities. The application supports 15+ EVM-compatible blockchains and Solana, enabling users to create, import, and manage wallets with biometric protection. CryptoVaultAI differentiates itself by incorporating AI-powered features throughout the user experience, including transaction explanation, portfolio analysis, risk assessment, scam detection, and AI chatbot assistance. The system leverages OpenRouter API with multiple large language models to provide personalized financial insights, educational content, and real-time market analysis. By combining traditional wallet functionality with advanced AI assistance, CryptoVaultAI aims to lower the barrier to entry for cryptocurrency users while maintaining the highest standards of security and privacy.")

doc.add_page_break()

# Table of Contents
doc.add_heading('Table of Contents', level=1)
toc_items = [
    "1. Title Page",
    "2. Certificate",
    "3. Acknowledgement",
    "4. Abstract",
    "5. Table of Contents",
    "6. List of Figures",
    "7. List of Tables",
    "8. Introduction",
    "9. Problem Statement",
    "10. Existing System",
    "11. Limitations of Existing System",
    "12. Proposed System",
    "13. Objectives",
    "14. Scope of the Project",
    "15. System Requirements",
    "16. Hardware Requirements",
    "17. Software Requirements",
    "18. Technologies Used",
    "19. System Architecture",
    "20. Methodology",
    "21. System Design"
]
for item in toc_items:
    p = doc.add_paragraph(item)
    p.paragraph_format.space_after = Pt(4)

doc.add_page_break()

# List of Figures
doc.add_heading('List of Figures', level=1)
doc.add_paragraph("(To be populated with actual figures from the project)")

doc.add_page_break()

# List of Tables
doc.add_heading('List of Tables', level=1)
doc.add_paragraph("(To be populated with actual tables from the project)")

doc.add_page_break()

# Introduction
doc.add_heading('Introduction', level=1)
doc.add_paragraph("Cryptocurrency has revolutionized the financial landscape, offering decentralized, borderless, and trustless transactions. However, the widespread adoption of cryptocurrencies has been hindered by significant usability and security challenges. The management of private keys, recovery seed phrases, and the complexity of interacting with multiple blockchain networks present significant obstacles for average users. While numerous wallet solutions exist, most fall into two categories: custodial wallets that hold user private keys on their servers (introducing centralization risk) or non-custodial wallets that require users to manually manage their security credentials without any intelligent assistance. CryptoVaultAI addresses these challenges by proposing a non-custodial wallet framework integrated with artificial intelligence to enhance security, usability, and user education.")

doc.add_page_break()

# Problem Statement
doc.add_heading('Problem Statement', level=1)
doc.add_paragraph("Despite the growing popularity of cryptocurrencies, several critical problems persist for users:")
doc.add_paragraph("1. Security Management: Users must safely store and backup seed phrases, with permanent loss resulting in irreversible fund loss.")
doc.add_paragraph("2. Usability Barriers: Complex blockchain interactions, gas fee management, and multi-chain support require technical expertise.")
doc.add_paragraph("3. Lack of Assistance: Users have no intelligent guidance for transaction validation, risk assessment, or portfolio management.")
doc.add_paragraph("4. Educational Gap: New users lack accessible resources to understand blockchain concepts, token functions, and safe practices.")
doc.add_paragraph("5. Multi-chain Fragmentation: Managing assets across different blockchain networks requires separate interfaces or extensive technical knowledge.")

doc.add_paragraph("Existing wallet solutions either compromise on security (custodial models) or usability (purely non-custodial models without intelligent assistance). There is a need for a solution that maintains self-custody while providing AI-driven support for security, education, and portfolio management.")

doc.add_page_break()

# Existing System
doc.add_heading('Existing System', level=1)
doc.add_paragraph("The existing cryptocurrency wallet ecosystem includes several prominent solutions:")

doc.add_heading("1. Custodial Wallets", level=2)
doc.add_paragraph("Examples: Exchange-integrated wallets (Binance, Coinbase Wallet). Characteristics: Private keys held by service provider; convenient access; counterparty risk. Limitations: Users do not have full control over private keys; risk of platform insolvency or freeze.")

doc.add_heading("2. Non-Custodial Wallets", level=2)
doc.add_paragraph("Examples: MetaMask, Trust Wallet, Coinbase Wallet (standalone). Characteristics: User-controlled private keys; seed phrase backup; direct blockchain interaction. Limitations: No intelligent assistance; users responsible for all security decisions; steep learning curve for DeFi interactions.")

doc.add_heading("3. Specialized Crypto Tools", level=2)
doc.add_paragraph("Examples: Block explorers, price tracking apps, DEX interfaces. Characteristics: Focused on specific blockchain functions. Limitations: Siloed functionality; no integrated wallet management; lack of unified experience.")

doc.add_heading("4. AI-Enhanced Crypto Projects", level=2)
doc.add_paragraph("Examples: Limited AI-assisted trading bots, analytics platforms. Characteristics: AI for market analysis, price prediction, trading signals. Limitations: Often require API keys; security concerns; limited to analysis rather than wallet management.")

doc.add_paragraph("None of the existing solutions combine non-custodial security with comprehensive AI assistance across wallet management, security education, portfolio analysis, and transaction explanation in a single unified interface.")

doc.add_page_break()

# Limitations of Existing System
doc.add_heading('Limitations of Existing System', level=1)
doc.add_paragraph("1. Security Usability Gap: Non-custodial wallets require users to manage complex seed phrases, leading to permanent fund loss if mishandled")
doc.add_paragraph("2. No Intelligent Security Assistance: Users cannot receive real-time scam detection, risk assessment, or security guidance within their wallet interface")
doc.add_paragraph("3. Limited Educational Support: No on-demand explanation of transactions, smart contracts, or blockchain concepts within the wallet experience")
doc.add_paragraph("4. Multi-chain Management Fragmentation: Users need different interfaces or extensive knowledge to manage assets across multiple blockchains")
doc.add_paragraph("5. Portfolio Analysis Deficits: Manual tracking of balances, performance, and asset allocation across chains is time-consuming and error-prone")
doc.add_paragraph("6. Transaction Validation: Users cannot easily understand transaction details, gas fees, or potential risks before signing")
doc.add_paragraph("7. No Personalized Learning: Existing wallets do not adapt to user behavior or provide personalized insights about usage patterns and preferences")

doc.add_page_break()

# Proposed System
doc.add_heading('Proposed System', level=1)
doc.add_paragraph("CryptoVaultAI proposes a novel approach by combining non-custodial wallet security with integrated artificial intelligence capabilities:")

doc.add_heading("Core Features:", level=2)
doc.add_paragraph("1. Biometric-Protected Non-Custodial Wallet: Secure wallet creation and import with BIP39 mnemonic storage encrypted behind biometric authentication")
doc.add_paragraph("2. AI-Powered Transaction Explanation: AI explains transaction details, destination addresses, gas fees, and potential risks in user-friendly language")
doc.add_paragraph("3. Portfolio AI Analysis: Intelligent portfolio assessment, performance tracking, and asset allocation recommendations across supported chains")
doc.add_paragraph("4. Risk Assessment & Scam Detection: Real-time analysis of destination addresses, smart contract interactions, and transaction patterns to warn of potential threats")
doc.add_paragraph("5. AI Chatbot Assistant: Conversational interface for crypto education, answering questions, and guiding users through wallet operations")
doc.add_paragraph("6. Memory & Personalization: AI learns user preferences (favorite chains, DEXs, risk tolerance, contacts) to provide contextual assistance")
doc.add_paragraph("7. Multi-chain Support: Unified interface for 15+ EVM chains plus Solana asset monitoring")
doc.add_paragraph("8. Smart Swap & Trading Assistance: AI-assisted token swapping with price impact analysis, slippage optimization, and timing recommendations")

doc.add_page_break()

# Objectives
doc.add_heading('Objectives', level=1)
doc.add_paragraph("The primary objectives of the CryptoVaultAI project are:")
doc.add_paragraph("1. Develop a Secure Non-Custodial Wallet: Create a wallet where users maintain full control of private keys with biometric-enhanced security")
doc.add_paragraph("2. Integrate AI Assistance: Incorporate artificial intelligence to provide transaction explanation, risk analysis, and portfolio insights")
doc.add_paragraph("3. Support Multi-chain Asset Management: Enable unified management of assets across 15+ EVM-compatible blockchains and Solana")
doc.add_paragraph("4. Enhance User Education: Provide on-demand educational content and explanations about blockchain concepts and operations")
doc.add_paragraph("5. Implement Smart Risk Detection: Develop AI-driven mechanisms to identify potential scams, risky transactions, and security threats")
doc.add_paragraph("6. Create Personalized User Experience: Leverage AI memory services to learn user preferences and provide contextual assistance")
doc.add_paragraph("7. Ensure Cross-Platform Compatibility: Deploy the application on iOS, Android, and web platforms using React Native and Expo")
doc.add_paragraph("8. Maintain Decentralization Principles: Uphold non-custodial philosophy while integrating centralized AI services transparently")

doc.add_page_break()

# Scope of the Project
doc.add_heading('Scope of the Project', level=1)
doc.add_paragraph("The scope of CryptoVaultAI encompasses:")

doc.add_heading("Technical Scope:", level=2)
doc.add_paragraph("- Blockchain Networks: Support for 15 EVM-compatible chains (Ethereum, BSC, Polygon, Base, Arbitrum, Avalanche, Optimism, Fantom, Cronos, and testnets) plus Solana")
doc.add_paragraph("- Wallet Functions: Create, import, export, delete, and backup wallets with BIP39 mnemonic support")
doc.add_paragraph("- Transaction Operations: Send, receive, and swap tokens across supported chains")
doc.add_paragraph("- AI Integration: OpenRouter API integration with multiple LLM models and specialized agent coordination")
doc.add_paragraph("- Storage Solutions: Expo Secure Store for mnemonic encryption, AsyncStorage for user preferences")

doc.add_heading("Functional Scope:", level=2)
doc.add_paragraph("- Real-time balance tracking with USD valuation")
doc.add_paragraph("- QR code-based address sharing")
doc.add_paragraph("- Floating bottom navigation with 5 main tabs")
doc.add_paragraph("- Onboarding flow for new users")
doc.add_paragraph("- App locking mechanism with biometric authentication")
doc.add_paragraph("- AI chatbot with streaming responses")
doc.add_paragraph("- Portfolio overview with performance metrics")
doc.add_paragraph("- Market data integration via CoinGecko")

doc.add_heading("Excluded Scope:", level=2)
doc.add_paragraph("- Direct fiat-to-crypto purchase (handled via third-party ramps)")
doc.add_paragraph("- Node operation or validator participation")
doc.add_paragraph("- L1 blockchain development or consensus mechanism design")
doc.add_paragraph("- Creation of new cryptocurrency tokens")
doc.add_paragraph("- Regulatory compliance consulting")

doc.add_page_break()

# System Requirements
doc.add_heading('System Requirements', level=1)

doc.add_heading("Functional Requirements:", level=2)
doc.add_paragraph("1. Wallet Creation: Support for generating new BIP39 mnemonic seed phrases")
doc.add_paragraph("2. Wallet Import: Validation and import of existing seed phrases")
doc.add_paragraph("3. Biometric Authentication: Face ID/Touch ID or PIN-based app locking")
doc.add_paragraph("4. Multi-chain Balance Query: Real-time balance retrieval for all supported chains")
doc.add_paragraph("5. Token Transfer: Send functionality with gas fee estimation and validation")
doc.add_paragraph("6. Token Reception: Receive addresses with QR code generation")
doc.add_paragraph("7. Token Swap: Smart swap functionality with price impact analysis")
doc.add_paragraph("8. AI Chat: Conversational interface with streaming responses")
doc.add_paragraph("9. Portfolio Overview: Visual representation of asset distribution and values")
doc.add_paragraph("10. Risk Analysis: AI-powered scam detection and transaction risk assessment")

doc.add_heading("Non-Functional Requirements:", level=2)
doc.add_paragraph("1. Security: Private keys never leave device; mnemonics encrypted with biometric protection")
doc.add_paragraph("2. Performance: Balance queries under 2 seconds; AI responses under 5 seconds")
doc.add_paragraph("3. Reliability: 99.9% uptime for API services; graceful degradation for offline mode")
doc.add_paragraph("4. Usability: Intuitive interface requiring minimal blockchain knowledge")
doc.add_paragraph("5. Compatibility: iOS 14+/Android 8+/Web browsers support")
doc.add_paragraph("6. Privacy: No user data transmitted without explicit consent; optional Supabase sync")

doc.add_page_break()

# Hardware Requirements
doc.add_heading('Hardware Requirements', level=1)
doc.add_paragraph("Mobile Devices:")
doc.add_paragraph("- iPhone 8 or newer (iOS 14+)")
doc.add_paragraph("- Android devices with 3GB RAM or higher (Android 8+)")
doc.add_paragraph("- Minimum screen resolution: 720p (1280x720)")

doc.add_paragraph("Development Environment:")
doc.add_paragraph("- CPU: 2+ GHz processor recommended")
doc.add_paragraph("- RAM: 4GB minimum for development and testing")
doc.add_paragraph("- Storage: 2GB available space for development environment")

doc.add_paragraph("Peripherals:")
doc.add_paragraph("- Camera: For QR code scanning (receive functionality)")
doc.add_paragraph("- Biometric sensors: Face ID or Touch ID for app locking (optional, fallback to PIN)")
doc.add_paragraph("- Network: Stable internet connection for blockchain RPC calls and AI services")

doc.add_page_break()

# Software Requirements
doc.add_heading('Software Requirements', level=1)

doc.add_heading("Operating Systems:", level=2)
doc.add_paragraph("- iOS 14.0 or later")
doc.add_paragraph("- Android 8.0 (Oreo) or later")
doc.add_paragraph("- Web browsers: Chrome 80+, Firefox 75+, Safari 14+")

doc.add_heading("Dependencies and Libraries:", level=2)
doc.add_paragraph("- React Native: 0.86.2")
doc.add_paragraph("- Expo: 57.0.10")
doc.add_paragraph("- TypeScript: 5.7+ (strict mode)")
doc.add_paragraph("- React Navigation: 6.x+")
doc.add_paragraph("- Zustand: 5.x+ (state management)")
doc.add_paragraph("- Expo Secure Store: For encrypted mnemonic storage")
doc.add_paragraph("- Async Storage: For user preferences and settings")
doc.add_paragraph("- Ethers.js: 6.x+ (EVM blockchain interaction)")
doc.add_paragraph("- Expo Local Authentication: For biometric verification")
doc.add_paragraph("- React Native Paper: UI component library")
doc.add_paragraph("- OpenRouter API: AI service integration")
doc.add_paragraph("- CoinGecko API: Market data and price tracking")
doc.add_paragraph("- BIP39 & BIP32: Mnemonic and derivation path standards")

doc.add_heading("Development Tools:", level=2)
doc.add_paragraph("- Node.js: 18.0 or later")
doc.add_paragraph("- npm or yarn: Package management")
doc.add_paragraph("- Xcode: iOS development (version 15.0+)")
doc.add_paragraph("- Android Studio: Android development (version 2023.2.1+)")
doc.add_paragraph("- Visual Studio Code: Recommended code editor")

doc.add_page_break()

# Technologies Used
doc.add_heading('Technologies Used', level=1)

doc.add_heading("Framework and Language:", level=2)
doc.add_paragraph("- React Native: 0.86.2 - Cross-platform mobile framework")
doc.add_paragraph("- Expo: 57.0.10 - Development platform and SDK")
doc.add_paragraph("- TypeScript: 5.7+ - Typed JavaScript for robust development")

doc.add_heading("State Management:", level=2)
doc.add_paragraph("- Zustand: 5.x+ - Lightweight state management with persistence")
doc.add_paragraph("- React Context API: Theme and authentication state management")

doc.add_heading("Blockchain and Crypto:", level=2)
doc.add_paragraph("- ethers.js: 6.x - EVM blockchain interaction library")
doc.add_paragraph("- BIP39: Mnemonic sentence generation and validation")
doc.add_paragraph("- BIP32: Hierarchical deterministic wallet derivation")
doc.add_paragraph("- ChainConfig: Custom chain configurations for 15+ EVM networks + Solana")

doc.add_heading("AI and Machine Learning:", level=2)
doc.add_paragraph("- OpenRouter API: Aggregated LLM access with 30+ free-tier models")
doc.add_paragraph("- Model Fallback Chain: Intelligent model selection and fallback strategies")
doc.add_paragraph("- Multi-Agent Coordination: 9 specialized AI agents for different domains")
doc.add_paragraph("- AIMemoryService: User preference learning and behavior analysis")

doc.add_heading("UI and Design:", level=2)
doc.add_paragraph("- React Native Paper: Material Design components")
doc.add_paragraph("- Custom Claymorphism: Unique design system with soft shadows, gradients, and rounded corners")
doc.add_paragraph("- Theme System: Light/dark mode with system synchronization")
doc.add_paragraph("- Icon System: Theme-aware vector icons")

doc.add_heading("APIs and Services:", level=2)
doc.add_paragraph("- CoinGecko API: Cryptocurrency price data, market caps, volume tracking")
doc.add_paragraph("- OpenRouter API: AI model routing and chat completions")
doc.add_paragraph("- Supabase: Optional backend for cloud sync and user preferences")
doc.add_paragraph("- RPC Providers: Alchemy premium URLs with public fallback networks")

doc.add_heading("Development Infrastructure:", level=2)
doc.add_paragraph("- Git: Version control")
doc.add_paragraph("- npm: Package manager")
doc.add_paragraph("- PowerShell/Bash: Build and automation scripts")
doc.add_paragraph("- Expo CLI: Development server and build tools")

doc.add_page_break()

# System Architecture
doc.add_heading('System Architecture', level=1)
doc.add_paragraph("CryptoVaultAI employs a client-first architecture where the mobile device serves as the primary authority for wallet operations and security critical functions. The system is designed with separation of concerns between UI, business logic, blockchain interaction, and AI services.")

doc.add_heading("Overall System Design:", level=2)
doc.add_paragraph("The architecture follows a layered approach:")
doc.add_paragraph("1. Presentation Layer: React Native Components → Claymorphism UI → React Navigation")
doc.add_paragraph("2. Application Layer: Zustand Stores → Wallet Store → Profile Store → WalletManager → SecureKeyManager")
doc.add_paragraph("3. Core Layer: ChainConfig → RPCManager → SecureKeyManager")
doc.add_paragraph("4. AI Services Layer: AIService → AIMemoryService → MultiAgentCoordinator → 9 Specialized Agents")
doc.add_paragraph("5. External Services: OpenRouter API → CoinGecko API → Supabase")

doc.add_page_break()

# Methodology
doc.add_heading('Methodology', level=1)

doc.add_heading("Development Methodology:", level=2)
doc.add_paragraph("The CryptoVaultAI project follows an Agile Scrum methodology with iterative development cycles. The project is structured into sprints focusing on incremental feature delivery, continuous integration, and regular feedback integration.")

doc.add_heading("Phases:", level=3)
doc.add_paragraph("1. Requirements & Planning Phase: Stakeholder analysis, technical feasibility assessment, MVP feature definition, technology stack selection")
doc.add_paragraph("2. Design Phase: UI/UX wireframing, information architecture, database design, AI architecture design")
doc.add_paragraph("3. Implementation Phase (6 Sprints): Core wallet functionality, multi-chain support, AI integration, agent coordination, UX refinements, testing and release preparation")
doc.add_paragraph("4. Testing Phase: Unit tests, integration tests, UI tests, security tests, performance tests")
doc.add_paragraph("5. Deployment Phase: Expo Application Services build configuration, App Store submission, CDN configuration, monitoring setup")

doc.add_heading("Research Methodology:", level=2)
doc.add_paragraph("- Literature Review: Analysis of existing cryptocurrency wallet architectures and AI integration patterns")
doc.add_paragraph("- Benchmark Testing: Performance comparison against existing wallets (MetaMask, Trust Wallet)")
doc.add_paragraph("- User Testing: Usability studies with target audience for feedback incorporation")
doc.add_paragraph("- AI Model Evaluation: Testing multiple LLM providers through OpenRouter for optimal performance/cost balance")

doc.add_heading("Security Methodology:", level=2)
doc.add_paragraph("- Zero-Knowledge Principle: Private keys never transmitted or stored on servers")
doc.add_paragraph("- Biometric Encryption: Mnemonic phrases encrypted with biometric-derived keys")
doc.add_paragraph("- Secure Enclave Utilization: Leveraging device-specific secure storage")
doc.add_paragraph("- Error Handling: Graceful failure modes that never expose sensitive data")
doc.add_paragraph("- Audit Logging: Optional, user-consented activity logging for troubleshooting")

doc.add_page_break()

# System Design
doc.add_heading('System Design', level=1)

doc.add_heading("1. Overall System Design:", level=2)
doc.add_paragraph("CryptoVaultAI employs a client-first architecture where the mobile device serves as the primary authority for wallet operations and security critical functions. The system is designed with separation of concerns between UI, business logic, blockchain interaction, and AI services.")

doc.add_heading("2. Component Design:", level=2)

doc.add_heading("A. Wallet Management Design:", level=3)
doc.add_paragraph("Wallet Creation Process: User selects 'Create Wallet' → BIP39 mnemonic generation (12/24 words) → mnemonic entropy validation → Ethereum wallet derivation via BIP32 (m/44'/60'/0'/0/0) → mnemonic encryption with biometric key (Expo Secure Store) → Wallet address display and QR code generation → Onboarding completion and profile storage")

doc.add_paragraph("Wallet Import Process: User selects 'Import Wallet' → Mnemonic phrase input (12/24 words) → Validation against BIP39 standards → Derivation of master seed and child wallets → Encryption and secure storage → Biometric authentication setup → Immediate wallet accessibility")

doc.add_heading("B. AI Integration Design:", level=3)
doc.add_paragraph("Chat Flow: User Query → AIService (OpenRouter) → Model Selection → MultiAgentCoordinator → Agent Dispatch → Specialized Processing → Response Synthesis → Streaming Output")

doc.add_paragraph("Memory Learning Loop: User Interaction → Event Recording → Pattern Analysis → Preference Update → Contextual Suggestions → Enhanced UX")

doc.add_heading("C. Navigation Design:", level=3)
doc.add_paragraph("App Launch → isSignedIn = false → Onboarding Flow → Welcome → Email/OTP → Name → Profile → Wallet Setup → Main App → isSignedIn = true, wallet exists, backgrounded → Biometric Lock → Authentication → Main App (if successful) or Login Failed → isSignedIn = true, wallet exists, foreground → Main App Navigation → Bottom Tabs: Explore/Wallet, Wallet, Market/Swap, Academy, Profile")

doc.add_heading("D. Data Design:", level=3)
doc.add_paragraph("Storage Structure: AsyncStorage keys for onboardingCompleted, userProfile, appLockStatus; Expo Secure Store for mnemonic (encrypted), walletAddress, biometricAuthState; Zustand stores for walletStore (balances, transactions, network selection) and profileStore (user preferences, onboarding state)")

doc.add_heading("E. AI Agent Design:", level=3)
doc.add_paragraph("Nine Specialized Agents: Research Agent, Security Agent, Portfolio Agent, Trading Agent, Tax Agent, Wallet Agent, NFT Agent, DeFi Agent, Governance Agent - each providing domain-specific guidance and analysis")

doc.add_heading("3. Security Design:", level=2)
doc.add_paragraph("Biometric Protection Flow: User Attempts App Access → Check biometric enrollment → Request authentication (expo-local-authentication) → Success → Unlock SecureStore → Grant wallet access → Failure → Retry or fallback to PIN → Not Biometrically Enrolled → PIN authentication fallback")

doc.add_paragraph("Encryption Standards: Mnemonic phrases encrypted using AES-256 with biometric-derived key; No plaintext secrets stored in AsyncStorage or transmitted externally; All RPC communications over HTTPS; No logging of private key material in any form")

doc.add_heading("4. User Interface Design:", level=2)
doc.add_paragraph("Claymorphism Design System: Visual style with soft shadows, frosted glass effects, layered elements; Light mode gradients from #F8FAFC to #E2E8F0; Dark mode gradients from #0F0F23 to #1E293B; Typography with system font scaling; 8-point scale spacing system; Border radius: 16px primary, 8px secondary, 4px micro")

doc.add_paragraph("Component Library: ClayButton (primary/secondary variants), Card (Claymorphism-styled container), Chip (token symbol display with chain color coding), FloatingBottomNav (5-tab navigation), QRCodeView (scannable address display), CandlestickChart (technical analysis), RealtimeLineChart (portfolio performance)")

doc.add_heading("5. Error Handling Design:", level=2)
doc.add_paragraph("Graceful Degradation: Offline mode with local balances cached, AI features disabled; API failures with automatic fallback to public RPC endpoints; Biometric failure with PIN fallback and clear error messaging; Transaction failures with user-friendly error codes and retry options")

doc.add_paragraph("Logging & Monitoring: Anonymous error tracking (opt-in); Performance metrics collection; AI response quality assessment; No sensitive data in logs")

doc.add_paragraph()
doc.add_paragraph("--- END OF DOCUMENT ---")

# Save the document
doc.save('CryptoVaultAI_Project_Documentation.docx')
print("Document saved successfully!")