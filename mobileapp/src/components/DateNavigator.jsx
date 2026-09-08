import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatShort = (dateString) => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('fr-TN', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatLong = (dateString) => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('ar-TN-u-nu-latn', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function DateNavigator({ selectedDate, onPreviousDay, onNextDay, onAddPress, onDatePress }) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.navBtn} onPress={onNextDay}>
        <MaterialIcons name="arrow-forward" size={22} color="#fff" />
      </Pressable>

      <Pressable style={styles.dateBox} onPress={onDatePress} accessibilityLabel="اختيار التاريخ">
        <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
        <Text style={styles.dateInputText}>{formatShort(selectedDate)}</Text>
      </Pressable>

      <Pressable style={styles.navBtn} onPress={onPreviousDay}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
      </Pressable>

      <Pressable style={styles.addBtn} onPress={onAddPress}>
        <Text style={styles.addText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  dateBox: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 138,
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 12,
    gap: 8,
  },
  dateInputText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 2,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 26,
    lineHeight: 28,
  },
});
