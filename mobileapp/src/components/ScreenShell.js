import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function ScreenShell({ children }) {
  return (
    <View style={styles.root}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
