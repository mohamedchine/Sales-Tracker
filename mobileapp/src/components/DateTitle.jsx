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
      <Text style={styles.weekday}>{weekday},</Text>
      <Text style={styles.date}>{monthDay}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  weekday: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
});
