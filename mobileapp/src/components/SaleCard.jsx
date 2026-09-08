import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import formatCurrency from '../utils/formatCurrency';

export default function SaleCard({ sale, onEdit, onDelete, readOnly = false }) {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-TN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {sale.imageUri ? (
          <Image source={{ uri: sale.imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.placeholder}>لا توجد صورة</Text>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{sale.name}</Text>
          <View style={styles.actions}>
            {!readOnly ? (
              <>
                <Pressable style={styles.iconBtn} onPress={() => onEdit(sale)}>
                  <Text style={styles.iconText}>✏️</Text>
                </Pressable>
                <Pressable style={[styles.iconBtn, styles.deleteBtn]} onPress={() => onDelete(sale._id)}>
                  <Text style={styles.iconText}>🗑️</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>

        <Text style={styles.price}>{formatCurrency(sale.price)}</Text>
        <Text style={styles.time}>{formatTime(sale.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  imageWrap: {
    width: 78,
    height: 78,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  deleteBtn: {
    backgroundColor: colors.dangerSoft,
  },
  iconText: {
    fontSize: 14,
  },
  price: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  time: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },
});
