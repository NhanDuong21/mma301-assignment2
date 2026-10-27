import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react';
import { View } from 'react-native';
import { cartReducer, cartTotals } from '../domain/cart';
import { readCart, saveCart } from '../storage/cartStorage';
import { Action, Message, styles } from '../components/ui';
const CartContext = createContext(null);
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const writeVersion = useRef(0);
  useEffect(() => {
    let live = true;
    setLoadError('');
    readCart().then((saved) => {
      if (live) { dispatch({ type: 'restore', items: saved }); setReady(true); }
    }).catch(() => { if (live) setLoadError('Không đọc được giỏ hàng đã lưu. Bạn có thể thử lại hoặc chủ động tạo giỏ rỗng.'); });
    return () => { live = false; };
  }, [attempt]);
  const persist = () => {
    const version = ++writeVersion.current;
    return saveCart(items).then(() => { if (version === writeVersion.current) setStorageError(''); })
      .catch(() => { if (version === writeVersion.current) setStorageError('Chưa lưu được giỏ hàng trên máy. Thử lưu lại trước khi đóng app.'); });
  };
  useEffect(() => { if (ready) persist(); }, [items, ready]);
  if (!ready) return <View style={styles.page}>
    <Message loading={!loadError} title={loadError ? 'Chưa khôi phục được giỏ hàng' : 'Đang khôi phục giỏ hàng…'} detail={loadError}
      action={loadError ? 'Thử lại' : undefined} onAction={() => setAttempt((v) => v + 1)} />
    {!!loadError && <Action title="Bỏ giỏ cũ, bắt đầu giỏ rỗng" secondary onPress={() => { dispatch({ type: 'restore', items: [] }); setReady(true); }} />}
  </View>;
  return <CartContext.Provider value={{ items, ...cartTotals(items), storageError, retrySave: persist,
    add: (product) => dispatch({ type: 'add', product }),
    changeQuantity: (id, quantity) => dispatch({ type: 'quantity', id, quantity }),
    remove: (id) => dispatch({ type: 'remove', id }) }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
