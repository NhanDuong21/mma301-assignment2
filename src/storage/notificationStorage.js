import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = '@nyan-shop/reminders/v1';
export async function readReminderPreference() {
  return (await AsyncStorage.getItem(KEY)) === 'true';
}
export async function saveReminderPreference(enabled) {
  await AsyncStorage.setItem(KEY, String(enabled));
}
