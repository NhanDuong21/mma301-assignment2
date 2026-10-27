import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
const CHANNEL = 'cart-reminders';
const IDENTIFIER = 'nyan-cart-reminder';
let notifications;
let unavailable = false;
function getNotifications() {
  if (unavailable)
    throw new Error(
      'Expo Go hiện tại thiếu module thông báo. Hãy dùng bản preview APK có expo-notifications; catalog và giỏ hàng vẫn hoạt động.',
    );
  if (notifications) return notifications;
  if (Platform.OS === 'android' && !requireOptionalNativeModule('ExpoTopicSubscriptionModule')) {
    unavailable = true;
    throw new Error(
      'Expo Go hiện tại thiếu module thông báo. Dùng bản preview APK để kiểm tra tính năng này.',
    );
  }
  try {
    // Loading at startup used to crash older Expo Go builds before any UI could
    // render. Keep the native boundary optional, without simulating success.
    notifications = require('expo-notifications');
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return notifications;
  } catch {
    unavailable = true;
    throw new Error(
      'Expo Go hiện tại thiếu module thông báo. Dùng bản preview APK để kiểm tra tính năng này.',
    );
  }
}
export async function permissionStatus(request = false) {
  const Notifications = getNotifications();
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Nhắc giỏ hàng',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  let result = await Notifications.getPermissionsAsync();
  if (request && !result.granted && result.canAskAgain)
    result = await Notifications.requestPermissionsAsync();
  return result;
}
export async function syncReminder(items, enabled) {
  let Notifications;
  try {
    Notifications = getNotifications();
  } catch (error) {
    if (!enabled) return { scheduled: false };
    throw error;
  }
  await Notifications.cancelScheduledNotificationAsync(IDENTIFIER);
  if (!enabled || !items.length) return { scheduled: false };
  const permission = await permissionStatus();
  if (!permission.granted)
    throw new Error(
      'Chưa có quyền thông báo. Bạn có thể bật quyền trong cài đặt Android; app vẫn dùng được bình thường.',
    );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  await Notifications.scheduleNotificationAsync({
    identifier: IDENTIFIER,
    content: {
      title: 'Bạn còn sản phẩm trong giỏ',
      body: `${count} sản phẩm đang chờ bạn xem lại.`,
      data: { screen: 'Cart' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60,
      repeats: false,
      channelId: CHANNEL,
    },
  });
  return { scheduled: true };
}
export function listenForCartNotification(openCart) {
  let Notifications;
  try {
    Notifications = getNotifications();
  } catch {
    return () => {};
  }
  let live = true;
  const handle = (response) => {
    if (!live || response?.notification?.request?.content?.data?.screen !== 'Cart') return;
    openCart();
    Notifications.clearLastNotificationResponseAsync().catch(() => {});
  };
  Notifications.getLastNotificationResponseAsync()
    .then(handle)
    .catch(() => {});
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => {
    live = false;
    subscription.remove();
  };
}
