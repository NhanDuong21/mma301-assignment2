import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useCart } from './CartContext';
import { permissionStatus, syncReminder } from '../services/notificationService';
import { readReminderPreference, saveReminderPreference } from '../storage/notificationStorage';
const NotificationContext = createContext(null);
export function NotificationProvider({ children }) {
  const { items } = useCart();
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Chưa kiểm tra');
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const queue = useRef(Promise.resolve());
  const serial = useRef(0);
  const toggleLock = useRef(false);
  useEffect(() => {
    let live = true;
    readReminderPreference()
      .then((value) => {
        if (live) setEnabled(value);
      })
      .catch(() => {
        if (live) setError('Không đọc được tùy chọn thông báo. Hãy bật lại khi cần.');
      })
      .finally(() => {
        if (live) setReady(true);
      });
    const sub = AppState.addEventListener('change', (value) => {
      if (value === 'active') setRevision((v) => v + 1);
    });
    return () => {
      live = false;
      sub.remove();
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const version = ++serial.current;
    queue.current = queue.current
      .catch(() => {})
      .then(async () => {
        if (version !== serial.current) return;
        const result = await syncReminder(items, enabled);
        if (version === serial.current) {
          setStatus(
            result.scheduled
              ? 'Đã đặt nhắc sau 60 giây. Giỏ thay đổi sẽ cập nhật lịch; giỏ trống sẽ hủy lịch.'
              : enabled
                ? 'Đang bật nhắc; giỏ trống nên chưa đặt lịch.'
                : 'Đã tắt nhắc giỏ hàng.',
          );
          setError('');
        }
      })
      .catch((cause) => {
        if (version === serial.current) {
          setStatus('Chưa đặt được lịch nhắc.');
          setError(cause.message);
        }
      });
  }, [items, enabled, ready, revision]);
  const toggle = async () => {
    if (toggleLock.current || !ready) return;
    toggleLock.current = true;
    setBusy(true);
    setError('');
    try {
      if (!enabled) {
        const permission = await permissionStatus(true);
        if (!permission.granted)
          throw new Error(
            'Bạn chưa cho phép thông báo. Không có lịch mới được tạo. Có thể bật lại trong cài đặt Android.',
          );
      }
      await saveReminderPreference(!enabled);
      setEnabled(!enabled);
    } catch (cause) {
      setError(cause.message);
    } finally {
      toggleLock.current = false;
      setBusy(false);
    }
  };
  return (
    <NotificationContext.Provider
      value={{
        enabled,
        busy: busy || !ready,
        status,
        error,
        toggle,
        retry: () => setRevision((v) => v + 1),
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
export const useReminder = () => useContext(NotificationContext);
