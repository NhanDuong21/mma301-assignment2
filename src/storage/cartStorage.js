import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreCart } from '../domain/cart';
const KEY = '@nyan-shop/cart/v1';
// Writes run in order. A slow write must never overwrite a newer cart snapshot.
let writes = Promise.resolve();
export async function readCart() {
  const text = await AsyncStorage.getItem(KEY);
  return text === null ? [] : restoreCart(JSON.parse(text));
}
export function saveCart(items) {
  writes = writes.catch(() => {}).then(() => AsyncStorage.setItem(KEY, JSON.stringify(items)));
  return writes;
}
