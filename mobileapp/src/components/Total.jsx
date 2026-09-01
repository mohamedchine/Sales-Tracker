import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

export default function Total({ sales }) {
  const total = (sales || []).reduce(
    (sum, sale) => sum + (Number(sale.price) || 0),
    0
  );

  const formatTotal = (value) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  return (
    <View style={styles.total}>
      <Text style={styles.label}>Total</Text>
      <Text style={styles.amount}>{formatTotal(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    width: '100%',
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  amount: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
});