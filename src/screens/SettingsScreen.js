import { ScrollView, Text, View } from 'react-native';
import { Action, styles } from '../components/ui';
import { useReminder } from '../contexts/NotificationContext';
import { aiProxyUrl, firebaseConfigured } from '../config';
export default function SettingsScreen() {
  const reminder = useReminder();
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <View style={styles.card}>
      <Text style={styles.title}>Nhắc giỏ hàng</Text>
      <Text style={styles.body}>Thông báo local sau 60 giây khi giỏ có hàng. Chạm thông báo để mở giỏ. Máy ảo có thể trì hoãn thông báo; cần kiểm tra lại trên bản release.</Text>
      <Text accessibilityLiveRegion="polite" style={styles.body}>{reminder.status}</Text>
      {!!reminder.error && <Text style={styles.error}>{reminder.error}</Text>}
      <Action title={reminder.enabled ? 'Tắt nhắc giỏ hàng' : 'Cho phép và bật nhắc'} disabled={reminder.busy} onPress={reminder.toggle} />
      <Action title="Kiểm tra quyền và đặt lại lịch" secondary onPress={reminder.retry} disabled={reminder.busy} />
    </View>
    <View style={styles.card}>
      <Text style={styles.title}>Trạng thái cấu hình</Text>
      <Text style={styles.body}>Firebase: {firebaseConfigured ? 'Có cấu hình; kiểm tra kết nối ở Yêu thích' : 'Chưa cấu hình'}</Text>
      <Text style={styles.body}>Gemini proxy: {aiProxyUrl ? 'Có địa chỉ; cần server đang chạy' : 'Chưa cấu hình'}</Text>
      <Text style={styles.body}>Không hiển thị key hoặc token tại đây. Hướng dẫn cấu hình nằm trong README.</Text>
    </View>
  </ScrollView>;
}
