// App.tsx - Trust Wallet Minimal Navigation
import './src/polyfills';

import React, { useEffect } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useWalletStore } from './src/store/walletStore';
import { useProfileStore } from './src/store/profileStore';
import { useAppLock } from './src/hooks/useAppLock';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Onboarding screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import SeedPhraseScreen from './src/screens/onboarding/SeedPhraseScreen';
import LockScreen from './src/screens/LockScreen';

// Main app screens
import HomeScreen from './src/screens/HomeScreen';
import MarketScreen from './src/screens/MarketScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SendScreen from './src/screens/SendScreen';
import ReceiveScreen from './src/screens/ReceiveScreen';
import SwapScreen from './src/screens/SwapScreen';
import AIChatbotScreen from './src/screens/AIChatbotScreen';
import AssetDetailScreen from './src/screens/AssetDetailScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import RiskReviewScreen from './src/screens/RiskReviewScreen';
import NewsScreen from './src/screens/NewsScreen';
import TokenDetailScreen from './src/screens/TokenDetailScreen';
import ChainDetailScreen from './src/screens/ChainDetailScreen';
import BuyScreen from './src/screens/BuyScreen';
import CustomTokenScreen from './src/screens/CustomTokenScreen';
import {
  ConnectedAppsScreen,
  WalletsScreen,
  PrivacySettingsScreen,
  NetworkSettingsScreen,
  HelpScreen,
  FeedbackScreen,
  AboutScreen,
} from './src/screens/SubScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type RootStackParamList = {
  Lock: undefined;
  Welcome: undefined;
  SeedPhrase: { mode: 'create' | 'import' } | undefined;
  Main: undefined;
  Market: undefined;
  Portfolio: { initialTab?: 'assets' | 'transactions' } | undefined;
  LiveDesk: undefined;
  Community: undefined;
  Explore: undefined;
  Assets: undefined;
  Send: undefined;
  Receive: undefined;
  Swap: undefined;
  Buy: undefined;
  History: undefined;
  Activity: undefined;
  AssetDetail: { asset: any };
  TransactionDetail: { tx: any };
  RiskReview: { tx: any };
  News: undefined;
  Settings: undefined;
  AIChatbot: undefined;
  AIAssistant: { context?: string; asset?: any; tx?: any } | undefined;
  TokenDetail: { symbol: string; name: string; price: string; change: string };
  ChainDetail: { chain: any };
  CustomToken: undefined;
  ConnectedApps: undefined;
  Wallets: undefined;
  PrivacySettings: undefined;
  NetworkSettings: undefined;
  DefaultNetwork: undefined;
  Help: undefined;
  Feedback: undefined;
  About: undefined;
};

type TabParamList = {
  Home: undefined;
  Market: undefined;
  Swap: undefined;
  Community: undefined;
  Settings: undefined;
};

// Institutional Fintech Tab Icons
const TabIcon = ({ name, focused, color, size = 22 }: { name: string; focused: boolean; color: string; size?: number }) => {
  const strokeW = focused ? 2.2 : 1.7;
  const icons: Record<string, React.ReactNode> = {
    Home: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9.5L12 3l9 6.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" />
        <Path d="M9 22V12h6v10" />
      </Svg>
    ),
    Market: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M18 20V10M12 20V4M6 20v-6" />
      </Svg>
    ),
    Community: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </Svg>
    ),
    Portfolio: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" />
        <Path d="M2 17l10 5 10-5" />
        <Path d="M2 12l10 5 10-5" />
      </Svg>
    ),
    Assets: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 2L2 7l10 5 10-5-10-5z" />
        <Path d="M2 17l10 5 10-5" />
        <Path d="M2 12l10 5 10-5" />
      </Svg>
    ),
    Swap: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4" />
      </Svg>
    ),
    Activity: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M12 6v6l4 2" />
      </Svg>
    ),
    Settings: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="3" />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </Svg>
    ),
  };
  return icons[name] || null;
};

// Main Tab Navigator
function MainTabs() {
  const insets = useSafeAreaInsets();
  const { hasWallet } = useWalletStore();
  const { isUnlocked } = useAppLock();
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!hasWallet || !isUnlocked) {
    return null;
  }

  // Adaptive safe area bottom padding across all iPhone & Android models
  const isAndroid = Platform.OS === 'android';
  const bottomPadding = insets.bottom > 0 ? insets.bottom + 4 : (isAndroid ? 10 : 8);
  const tabHeight = 62 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 0.5,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          overflow: 'hidden',
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '600',
          letterSpacing: -0.2,
          lineHeight: 14,
          includeFontPadding: false,
          paddingBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 1,
          marginBottom: 1,
        },
        tabBarButton: (props) => (
          <Pressable
            {...props}
            android_ripple={{
              color: theme.isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              borderless: true,
              radius: 28,
            }}
            style={({ pressed }) => [
              props.style,
              {
                borderRadius: 24,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Home" focused={focused} color={color} size={23} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Market" focused={focused} color={color} size={23} />,
          tabBarLabel: 'Market',
        }}
      />
      <Tab.Screen
        name="Swap"
        component={SwapScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Swap" focused={focused} color={color} size={23} />,
          tabBarLabel: 'Swap',
        }}
      />
      <Tab.Screen
        name="Community"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Community" focused={focused} color={color} size={23} />,
          tabBarLabel: 'Community',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Settings" focused={focused} color={color} size={23} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Content
function AppContent() {
  const { loadWallet, hasWallet } = useWalletStore();
  const { loadProfile } = useProfileStore();
  const { state: lockState } = useAppLock();
  const { theme } = useTheme();

  const isLocked = hasWallet && lockState !== 'unlocked';

  useEffect(() => {
    loadProfile();
    loadWallet();
  }, [loadProfile, loadWallet]);

  const baseNavTheme = theme.isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...baseNavTheme,
    dark: theme.isDark,
    colors: {
      ...baseNavTheme.colors,
      primary: theme.colors.primary.DEFAULT,
      background: theme.colors.bg.canvas,
      card: theme.colors.bg.surface,
      text: theme.colors.text.primary,
      border: theme.colors.border.subtle,
      notification: theme.colors.primary.DEFAULT,
    },
  };

  return (
    <PaperProvider theme={{ colors: { primary: theme.colors.primary.DEFAULT, background: theme.colors.bg.canvas } }}>
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg.canvas },
            animation: 'slide_from_right',
            animationDuration: 220,
            gestureEnabled: true,
          }}
        >
          {isLocked ? (
            <Stack.Screen name="Lock" component={LockScreen} />
          ) : !hasWallet ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Market" component={MarketScreen} options={{ title: 'Markets' }} />
              <Stack.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio' }} />
              <Stack.Screen name="LiveDesk" component={ExploreScreen} options={{ title: 'Live Desk' }} />
              <Stack.Screen name="Community" component={ExploreScreen} options={{ title: 'Live Desk' }} />
              <Stack.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
              <Stack.Screen name="Assets" component={ExploreScreen} options={{ title: 'Assets' }} />
              <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send' }} />
              <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive' }} />
              <Stack.Screen name="Swap" component={SwapScreen} options={{ title: 'Swap' }} />
              <Stack.Screen name="Buy" component={BuyScreen} options={{ title: 'Buy Crypto' }} />
              <Stack.Screen name="History" component={ActivityScreen} options={{ title: 'History' }} />
              <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Asset' }} />
              <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction' }} />
              <Stack.Screen name="RiskReview" component={RiskReviewScreen} options={{ title: 'Risk Review' }} />
              <Stack.Screen name="News" component={NewsScreen} options={{ title: 'News' }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              <Stack.Screen name="AIChatbot" component={AIChatbotScreen} options={{ title: 'AI Assistant' }} />
              <Stack.Screen name="AIAssistant" component={AIChatbotScreen} options={{ title: 'AI Assistant' }} />
              <Stack.Screen name="TokenDetail" component={TokenDetailScreen} options={{ title: 'Token' }} />
              <Stack.Screen name="ChainDetail" component={ChainDetailScreen} options={{ title: 'Chain' }} />
              <Stack.Screen name="CustomToken" component={CustomTokenScreen} options={{ title: 'Import Token' }} />
              <Stack.Screen name="ConnectedApps" component={ConnectedAppsScreen} options={{ title: 'Connected Apps' }} />
              <Stack.Screen name="Wallets" component={WalletsScreen} options={{ title: 'Wallets' }} />
              <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacy' }} />
              <Stack.Screen name="NetworkSettings" component={NetworkSettingsScreen} options={{ title: 'Networks' }} />
              <Stack.Screen name="DefaultNetwork" component={NetworkSettingsScreen} options={{ title: 'Default Network' }} />
              <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
              <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
              <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
              <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
