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
      <Text style={styles.label}>Total:</Text>
      <Text style={styles.amount}>{formatTotal(total)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    width: '100%',
  },

  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});