import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { Action, styles } from '../components/ui';
import ProductCard from '../components/ProductCard';
import { aiProxyUrl, firebaseConfigured } from '../config';
import { recommendProducts } from '../services/aiService';
export default function AIScreen({ navigation }) {
  const [query, setQuery] = useState('phone');
  const [need, setNeed] = useState('Tôi cần điện thoại dưới 500 USD để học tập.');
  const [state, setState] = useState({ loading: false, error: '', result: null });
  const active = useRef(null);
  const busy = useRef(false);
  useEffect(() => () => active.current?.abort(), []);
  const recommend = async () => {
    if (busy.current) return;
    busy.current = true;
    const controller = new AbortController();
    active.current = controller;
    setState({ loading: true, error: '', result: null });
    try {
      const result = await recommendProducts(query, need, controller.signal);
      if (!controller.signal.aborted) setState({ loading: false, error: '', result });
    } catch (error) {
      if (!controller.signal.aborted)
        setState({ loading: false, error: error.message, result: null });
    } finally {
      if (active.current === controller) busy.current = false;
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Chọn sản phẩm theo nhu cầu</Text>
        <Text style={styles.body}>
          Gemini xét tối đa 24 kết quả đầu tiên của từ khóa. Đây không phải tư vấn trên toàn bộ
          catalog. Giá và tồn kho lấy từ API; lý do do AI tạo, bạn cần kiểm tra lại.
        </Text>
        {(!aiProxyUrl || !firebaseConfigured) && (
          <Text style={styles.error}>
            Chưa cấu hình Firebase hoặc AI proxy. Tính năng này chưa gọi Gemini thật; xem hướng dẫn
            setup.
          </Text>
        )}
        <Text style={styles.body}>Từ khóa catalog (tiếng Anh)</Text>
        <TextInput
          accessibilityLabel="Từ khóa cho catalog AI"
          style={styles.input}
          value={query}
          onChangeText={(value) => {
            setQuery(value);
            setState({ loading: false, error: '', result: null });
          }}
          maxLength={100}
          editable={!state.loading}
          autoCapitalize="none"
        />
        <Text style={styles.body}>Nhu cầu và ngân sách (USD)</Text>
        <TextInput
          accessibilityLabel="Nhu cầu tư vấn"
          multiline
          style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]}
          value={need}
          onChangeText={(value) => {
            setNeed(value);
            setState({ loading: false, error: '', result: null });
          }}
          maxLength={600}
          editable={!state.loading}
        />
        <Action
          title={state.loading ? 'Gemini đang phân tích…' : 'Gợi ý với Gemini'}
          disabled={state.loading || !need.trim() || !aiProxyUrl || !firebaseConfigured}
          onPress={recommend}
        />
        {state.loading && (
          <Action
            title="Hủy tư vấn"
            secondary
            onPress={() => {
              active.current?.abort();
              active.current = null;
              busy.current = false;
              setState({ loading: false, error: '', result: null });
            }}
          />
        )}
        {!!state.error && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {state.error} Bạn vẫn có thể tự tìm và chọn sản phẩm trong Shop.
          </Text>
        )}
        {!!state.result && (
          <Text style={styles.body}>
            Đã xét {state.result.count} sản phẩm.{' '}
            {state.result.recommendations.length
              ? 'Gợi ý đã khớp catalog:'
              : 'Không có gợi ý phù hợp. Thử đổi từ khóa hoặc nhu cầu.'}
          </Text>
        )}
        {state.result?.recommendations.map(({ product, reason }) => (
          <View key={product.id} style={{ gap: 8 }}>
            <ProductCard
              product={product}
              onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
            />
            <Text style={styles.body}>Lý do AI: {reason}</Text>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
