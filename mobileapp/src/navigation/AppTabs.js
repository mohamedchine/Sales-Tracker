import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import SalesScreen from '../screens/SalesScreen';
import BackupScreen from '../screens/BackupScreen';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Sales', component: SalesScreen, icon: 'receipt-long' },
  { name: 'Backup', component: BackupScreen, icon: 'save-alt' },
];

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG.find((tab) => tab.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <MaterialIcons
                name={config?.icon}
                size={24}
                color={focused ? '#fff' : '#555'}
              />
            </View>
          ),
          tabBarStyle: [
            styles.tabBar,
            { height: 60 + bottomPad, paddingBottom: bottomPad },
          ],
        };
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarGradientBottom,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  tabItem: {
    minWidth: 52,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  tabItemActive: {
    backgroundColor: colors.accent,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
});
