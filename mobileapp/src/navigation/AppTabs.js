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
    borderTopColor: 'rgba(0,0,0,0.06)',
    elevation: 8,
    shadowColor: '#142028',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    paddingTop: 6,
  },
  tabItem: {
    minWidth: 44,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  tabItemActive: {
    backgroundColor: colors.accent,
  },
});
