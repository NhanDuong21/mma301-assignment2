import { FlatList, Text, View } from 'react-native';
import { Action, Message, styles } from '../components/ui';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../contexts/WishlistContext';
export default function WishlistScreen({ navigation }) {
  const saved = useWishlist();
  if (!saved.configured) return <Message title="Firebase chưa cấu hình" detail="Tạo Firebase project, bật Anonymous Auth, tạo Firestore và điền .env theo README. Đây chưa phải dữ liệu Firebase thật." />;
  return <View style={styles.page}>
    <View style={styles.content}>
      <Text style={styles.body}>Wishlist riêng của tài khoản ẩn danh trên thiết bị này.</Text>
      {!!saved.error && <Text style={styles.error}>{saved.error}</Text>}
      <Action title={saved.loading ? 'Đang kết nối…' : 'Đọc lại từ Firebase'} disabled={saved.loading} onPress={saved.refresh} />
    </View>
    <FlatList data={saved.items} keyExtractor={(item) => String(item.id)} contentContainerStyle={[styles.content, { flexGrow: 1 }]}
      refreshing={saved.loading} onRefresh={saved.refresh}
      ListEmptyComponent={<Message loading={saved.loading} title={saved.loading ? 'Đang đọc Firebase…' : saved.error ? 'Chưa đọc được wishlist' : 'Chưa lưu sản phẩm nào'} detail="Mở chi tiết sản phẩm để thêm vào yêu thích." />}
      renderItem={({ item }) => <View style={{ gap: 6 }}><ProductCard product={item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })} />
        <Action title="Bỏ yêu thích" secondary disabled={saved.loading} onPress={() => saved.toggle(item)} /></View>} />
  </View>;
}
