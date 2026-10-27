import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TextInput, View } from 'react-native';
import { Action, Message, styles } from '../components/ui';
import ProductCard from '../components/ProductCard';
import useProducts from '../hooks/useProducts';
import { colors } from '../theme';
export default function ProductListScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => { const timer = setTimeout(() => setQuery(input.trim()), 350); return () => clearTimeout(timer); }, [input]);
  const catalog = useProducts(query);
  return <View style={styles.page}>
    <View style={styles.content}>
      <Text style={styles.title}>Tìm món đồ bạn cần</Text>
      <Text style={styles.body}>Catalog trực tuyến · Giá USD</Text>
      <TextInput accessibilityLabel="Tìm sản phẩm" placeholder="Tìm theo tên, ví dụ: phone" value={input} onChangeText={setInput}
        autoCapitalize="none" style={styles.input} returnKeyType="search" />
      <View style={styles.row}>
        <Action title="Yêu thích" secondary onPress={() => navigation.navigate('Wishlist')} />
        <Action title="Tư vấn AI" secondary onPress={() => navigation.navigate('AI')} />
        <Action title="Cài đặt" secondary onPress={() => navigation.navigate('Settings')} />
      </View>
    </View>
    <FlatList data={catalog.products} keyExtractor={(item) => String(item.id)}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }} keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => <ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />}
      refreshing={catalog.refreshing} onRefresh={catalog.refresh} onEndReached={catalog.loadMore} onEndReachedThreshold={0.3}
      ListEmptyComponent={<Message loading={catalog.loading} title={catalog.loading ? 'Đang tải sản phẩm…' : catalog.error ? 'Chưa tải được catalog' : 'Không tìm thấy sản phẩm'}
        detail={catalog.error || (!catalog.loading ? 'Thử từ khóa khác hoặc kéo xuống để làm mới.' : '')}
        action={catalog.error ? 'Thử lại' : undefined} onAction={catalog.retry} />}
      ListFooterComponent={catalog.products.length ? <View style={{ padding: 12, gap: 10 }}>
        {catalog.loading && <ActivityIndicator color={colors.primary} />}
        {!!catalog.error && <><Text style={styles.error}>{catalog.error}</Text><Action title="Thử tải lại" onPress={catalog.retry} /></>}
        {!catalog.hasMore && !catalog.loading && !catalog.error && <Text style={styles.body}>Đã hiển thị hết kết quả.</Text>}
      </View> : null} />
  </View>;
}
