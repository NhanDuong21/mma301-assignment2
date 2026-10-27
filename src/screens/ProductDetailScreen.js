import { useEffect, useState } from 'react';
import { Image, ScrollView, Text } from 'react-native';
import { Action, Message, styles } from '../components/ui';
import { getProduct } from '../services/productService';
import { money } from '../theme';
import { useCart } from '../contexts/CartContext';
import { quantityLimit } from '../domain/cart';
export default function ProductDetailScreen({ route, navigation }) {
  const cart = useCart();
  const [feedback, setFeedback] = useState('');
  const id = route.params?.productId;
  const [state, setState] = useState({ product: null, error: '', loading: true });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ product: null, error: '', loading: true });
    getProduct(id, controller.signal).then((product) => {
      if (!controller.signal.aborted) setState({ product, error: '', loading: false });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ product: null, error: error.message, loading: false });
    });
    return () => controller.abort();
  }, [id, retry]);
  if (!state.product) return <Message loading={state.loading} title={state.loading ? 'Đang tải chi tiết…' : 'Không tải được sản phẩm'} detail={state.error}
    action={!state.loading ? 'Thử lại' : undefined} onAction={() => setRetry((v) => v + 1)} />;
  const product = state.product;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    {product.thumbnail && <Image source={{ uri: product.thumbnail }} resizeMode="contain" style={{ height: 260, width: '100%' }} />}
    <Text style={styles.body}>{product.category} · ★ {product.rating}</Text>
    <Text style={styles.title}>{product.title}</Text>
    <Text style={styles.title}>{money(product.price)}</Text>
    <Text style={styles.body}>{product.description}</Text>
    <Text style={styles.body}>Tồn kho: {product.stock}</Text>
    <Action title={product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
      disabled={(cart.items.find((item) => item.id === product.id)?.quantity || 0) >= quantityLimit(product)}
      onPress={() => { cart.add(product); setFeedback('Đã thêm vào giỏ hàng.'); }} />
    {!!feedback && <Text accessibilityLiveRegion="polite" style={styles.body}>{feedback}</Text>}
    <Action title={`Xem giỏ hàng (${cart.itemCount})`} secondary onPress={() => navigation.navigate('Cart')} />
  </ScrollView>;
}
