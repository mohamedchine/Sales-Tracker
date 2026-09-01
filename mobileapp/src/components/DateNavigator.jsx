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
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatLong = (dateString) => {
  const date = parseDate(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function DateNavigator({ selectedDate, onPreviousDay, onNextDay, onAddPress }) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.navBtn} onPress={onPreviousDay}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </Pressable>

      <View style={styles.dateBox}>
        <MaterialIcons name="calendar-today" size={18} color={colors.text} />
        <Text style={styles.dateInputText}>{formatShort(selectedDate)}</Text>
      </View>

      <Pressable style={styles.navBtn} onPress={onNextDay}>
        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
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
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 130,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    gap: 8,
  },
  dateInputText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  addText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
    lineHeight: 28,
  },
});
