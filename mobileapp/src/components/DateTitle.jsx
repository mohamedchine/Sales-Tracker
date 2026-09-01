import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const parseDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateTitle = (dateString) => {
  const date = parseDate(dateString);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { weekday, monthDay };
};

export default function DateTitle({ selectedDate }) {
  const { weekday, monthDay } = formatDateTitle(selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.weekday}>{weekday}</Text>
      <Text style={styles.date}>{monthDay}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  weekday: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
});
