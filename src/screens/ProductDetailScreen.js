import { useEffect, useState } from 'react';
import { Image, ScrollView, Text } from 'react-native';
import { Action, Message, styles } from '../components/ui';
import { getProduct } from '../services/productService';
import { money } from '../theme';
export default function ProductDetailScreen({ route }) {
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
    <Action title="Giỏ hàng sẽ được nối ở phase 3" disabled />
  </ScrollView>;
}
