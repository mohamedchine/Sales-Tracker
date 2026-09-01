import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SaleCard from './SaleCard';
import colors from '../theme/colors';

export default function SalesList({ sales, isLoading, onEdit, onDelete }) {
  if (isLoading) {
    return <Text style={styles.loading}>Loading sales...</Text>;
  }

  if (!sales || sales.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No sales for this date yet.</Text>
        <Text style={styles.emptySubtext}>Click + to create your first entry!</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sales.map((sale) => (
        <SaleCard key={sale._id} sale={sale} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999999',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#aaaaaa',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    marginTop: 12,
    gap: 8,
  },
});
