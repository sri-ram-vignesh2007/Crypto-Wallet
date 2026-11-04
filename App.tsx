// App.tsx - Clean Apple-style Navigation
import './src/polyfills';

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { useWalletStore } from './src/store/walletStore';
import { useProfileStore } from './src/store/profileStore';
import { useAppLock } from './src/hooks/useAppLock';
import Svg, { Path, Circle } from 'react-native-svg';

// Onboarding screens
import WelcomeScreen from './src/screens/onboarding/WelcomeScreen';
import EmailScreen from './src/screens/onboarding/EmailScreen';
import OTPScreen from './src/screens/onboarding/OTPScreen';
import NameScreen from './src/screens/onboarding/NameScreen';
import ProfileSetupScreen from './src/screens/onboarding/ProfileSetupScreen';
import CreateWalletScreen from './src/screens/onboarding/CreateWalletScreen';
import SeedPhraseScreen from './src/screens/onboarding/SeedPhraseScreen';
import LockScreen from './src/screens/LockScreen';

// Main app screens
import HomeScreen from './src/screens/HomeScreen';
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
import {
  ConnectedAppsScreen,
  WalletsScreen,
  PrivacySettingsScreen,
  NetworkSettingsScreen,
  HelpScreen,
  FeedbackScreen,
  AboutScreen,
} from './src/screens/SubScreens';
import { AIAssistantFAB } from './src/components';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Type definitions
type RootStackParamList = {
  Lock: undefined;
  Welcome: undefined;
  Email: undefined;
  OTP: { otpCode: string; email: string };
  Name: undefined;
  ProfileSetup: undefined;
  CreateWallet: undefined;
  SeedPhrase: { mode: 'create' | 'import' };
  Main: undefined;
  Send: undefined;
  Receive: undefined;
  Swap: undefined;
  History: undefined;
  AssetDetail: { asset: any };
  TransactionDetail: { tx: any };
  RiskReview: { tx: any };
  News: undefined;
  Settings: undefined;
  AIChatbot: undefined;
  TokenDetail: { symbol: string; name: string; price: string; change: string };
  ChainDetail: { chain: any };
  ConnectedApps: undefined;
  Wallets: undefined;
  PrivacySettings: undefined;
  NetworkSettings: undefined;
  Help: undefined;
  Feedback: undefined;
  About: undefined;
};

type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Activity: undefined;
  Settings: undefined;
};

function LockGateScreen() {
  return <LockScreen />;
}

// Tab Bar Icons - Apple style
const TabIcon = ({ name, focused, color, size = 24 }: { name: string; focused: boolean; color: string; size?: number }) => {
  const icons: Record<string, React.ReactNode> = {
    Home: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <Path d="M9 22V12h6v10" />
      </Svg>
    ),
    Explore: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="10" />
        <Path d="M2 12h20" />
        <Path d="M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z" />
      </Svg>
    ),
    Activity: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <Path d="M16 2v4" />
        <Path d="M8 2v4" />
        <Path d="M3 10h18" />
        <Path d="M16 14h-8" />
        <Path d="M16 18h-8" />
      </Svg>
    ),
    Settings: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="12" r="3" />
        <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </Svg>
    ),
  };
  return icons[name] || null;
};

// Main Tab Navigator - Apple Style
function MainTabs() {
  const { theme } = useTheme();
  const { hasWallet } = useWalletStore();
  const { isSignedIn } = useProfileStore();
  const { isUnlocked } = useAppLock();
  const colors = useTheme().theme.colors;

  if (!isSignedIn || !hasWallet || !isUnlocked) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border.subtle,
          borderTopWidth: 0.5,
          height: 56,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Home" focused={focused} color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Explore" focused={focused} color={color} />,
          tabBarLabel: 'Explore',
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Activity" focused={focused} color={color} />,
          tabBarLabel: 'Activity',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => <TabIcon name="Settings" focused={focused} color={color} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Content
function AppContent() {
  const { loadWallet, hasWallet } = useWalletStore();
  const { loadProfile, isSignedIn, hasCompletedOnboarding } = useProfileStore();
  const { state: lockState } = useAppLock();
  const { theme } = useTheme();

  const isLocked = hasWallet && lockState !== 'unlocked';

  useEffect(() => {
    loadProfile();
    loadWallet();
  }, [loadProfile, loadWallet]);

  return (
    <PaperProvider theme={{ colors: { primary: theme.colors.primary.DEFAULT, background: theme.colors.bg.canvas } }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.bg.canvas },
            gestureEnabled: true,
          }}
        >
          {isLocked ? (
            <Stack.Screen name="Lock" component={LockScreen} />
          ) : !isSignedIn ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Email" component={EmailScreen} />
              <Stack.Screen name="OTP" component={OTPScreen} />
              <Stack.Screen name="Name" component={NameScreen} />
              <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
            </>
          ) : !hasCompletedOnboarding ? (
            <>
              <Stack.Screen name="CreateWallet" component={CreateWalletScreen} />
              <Stack.Screen name="SeedPhrase" component={SeedPhraseScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen name="Send" component={SendScreen} options={{ title: 'Send' }} />
              <Stack.Screen name="Receive" component={ReceiveScreen} options={{ title: 'Receive' }} />
              <Stack.Screen name="Swap" component={SwapScreen} options={{ title: 'Swap' }} />
              <Stack.Screen name="History" component={ActivityScreen} options={{ title: 'History' }} />
              <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Asset' }} />
              <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Transaction' }} />
              <Stack.Screen name="RiskReview" component={RiskReviewScreen} options={{ title: 'Risk Review' }} />
              <Stack.Screen name="News" component={NewsScreen} options={{ title: 'News' }} />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
              <Stack.Screen name="AIChatbot" component={AIChatbotScreen} options={{ title: 'AI Assistant' }} />
              <Stack.Screen name="TokenDetail" component={TokenDetailScreen} options={{ title: 'Token' }} />
              <Stack.Screen name="ChainDetail" component={ChainDetailScreen} options={{ title: 'Chain' }} />
              <Stack.Screen name="ConnectedApps" component={ConnectedAppsScreen} options={{ title: 'Connected Apps' }} />
              <Stack.Screen name="Wallets" component={WalletsScreen} options={{ title: 'Wallets' }} />
              <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacy' }} />
              <Stack.Screen name="NetworkSettings" component={NetworkSettingsScreen} options={{ title: 'Networks' }} />
              <Stack.Screen name="DefaultNetwork" component={NetworkSettingsScreen} options={{ title: 'Default Network' }} />
              <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help' }} />
              <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ title: 'Feedback' }} />
              <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
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