import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
const CHANNEL = 'cart-reminders';
const IDENTIFIER = 'nyan-cart-reminder';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export async function permissionStatus(request = false) {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Nhắc giỏ hàng', importance: Notifications.AndroidImportance.DEFAULT });
  let result = await Notifications.getPermissionsAsync();
  if (request && !result.granted && result.canAskAgain) result = await Notifications.requestPermissionsAsync();
  return result;
}
export async function syncReminder(items, enabled) {
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER);
  if (!enabled || !items.length) return { scheduled: false };
  const permission = await permissionStatus();
  if (!permission.granted) throw new Error('Chưa có quyền thông báo. Bạn có thể bật quyền trong cài đặt Android; app vẫn dùng được bình thường.');
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIER,
    content: { title: 'Bạn còn sản phẩm trong giỏ', body: `${count} sản phẩm đang chờ bạn xem lại.`, data: { screen: 'Cart' }, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 60, repeats: false, channelId: CHANNEL },
  });
  return { scheduled: true };
}
export { Notifications };
