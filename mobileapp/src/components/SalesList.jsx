import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SaleCard from './SaleCard';
import colors from '../theme/colors';

export default function SalesList({ sales, isLoading, onEdit, onDelete, readOnly = false }) {
  if (isLoading) {
    return <Text style={styles.loading}>جار تحميل المبيعات...</Text>;
  }

  if (!sales || sales.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>لا توجد مبيعات لهذا التاريخ بعد.</Text>
        <Text style={styles.emptySubtext}>اضغط على زر + لإضافة أول عملية بيع.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sales.map((sale) => (
        <SaleCard key={sale._id} sale={sale} onEdit={onEdit} onDelete={onDelete} readOnly={readOnly} />
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
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: {
    gap: 12,
  },
});
