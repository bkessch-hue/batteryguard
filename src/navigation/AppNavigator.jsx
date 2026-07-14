import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SCREEN_NAMES } from '../utils/constants';

import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeDashboard from '../screens/HomeDashboard';
import ScanScreen from '../screens/ScanScreen';
import BatteryDetailScreen from '../screens/BatteryDetailScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MaintenanceTipsScreen from '../screens/MaintenanceTipsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VehicleManagerScreen from '../screens/VehicleManagerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.background, elevation: 0, shadowOpacity: 0 },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700' },
  cardStyle: { backgroundColor: COLORS.background, flex: 1 },
};

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Scan': iconName = 'bluetooth'; break;
            case 'History': iconName = 'history'; break;
            case 'Tips': iconName = 'lightbulb-outline'; break;
            case 'More': iconName = 'dots-horizontal-circle'; break;
            default: iconName = 'circle';
          }
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeDashboard} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Tips" component={MaintenanceTipsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

function MoreScreen({ navigation }) {
  return (
    <SettingsScreen navigation={navigation} />
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name={SCREEN_NAMES.WELCOME} component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name={SCREEN_NAMES.LOGIN} component={LoginScreen} options={{ title: 'Sign In' }} />
        <Stack.Screen name={SCREEN_NAMES.REGISTER} component={RegisterScreen} options={{ title: 'Create Account' }} />
        <Stack.Screen name="MainApp" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name={SCREEN_NAMES.BATTERY_DETAIL} component={BatteryDetailScreen} options={{ title: 'Battery Details' }} />
        <Stack.Screen name={SCREEN_NAMES.REPORTS} component={ReportsScreen} options={{ title: 'Reports' }} />
        <Stack.Screen name={SCREEN_NAMES.SUBSCRIPTION} component={SubscriptionScreen} options={{ title: 'Subscription' }} />
        <Stack.Screen name={SCREEN_NAMES.VEHICLE_MANAGER} component={VehicleManagerScreen} options={{ title: 'My Vehicles' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: 'Terms of Service' }} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} options={{ title: 'Help Center' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
