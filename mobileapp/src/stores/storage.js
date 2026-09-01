import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  sales: '@sales-tracker/sales',
  selectedDate: '@sales-tracker/selected-date',
};

export async function getJson(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function setJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
