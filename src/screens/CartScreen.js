import { FlatList, Text, View } from 'react-native';
import { Action, Message, styles } from '../components/ui';
import { useCart } from '../contexts/CartContext';
import { quantityLimit } from '../domain/cart';
import { money } from '../theme';
export default function CartScreen({ navigation }) {
  const cart = useCart();
  return (
    <View style={styles.page}>
      {!!cart.storageError && (
        <View style={styles.content}>
          <Text style={styles.error}>{cart.storageError}</Text>
          <Action title="Lưu lại" onPress={cart.retrySave} />
        </View>
      )}
      <FlatList
        data={cart.items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.content, { flexGrow: 1 }]}
        ListEmptyComponent={
          <Message
            title="Giỏ hàng đang trống"
            detail="Chọn sản phẩm từ catalog để bắt đầu."
            action="Khám phá sản phẩm"
            onAction={() => navigation.navigate('Products')}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text
              style={{ fontSize: 17, fontWeight: '600' }}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            >
              {item.title}
            </Text>
            <Text style={styles.body}>
              {money(item.price)} × {item.quantity} ={' '}
              {money((Math.round(item.price * 100) * item.quantity) / 100)}
            </Text>
            <View style={styles.row}>
              <Action
                title="−"
                accessibilityLabel={`Giảm số lượng ${item.title}`}
                secondary
                onPress={() => cart.changeQuantity(item.id, item.quantity - 1)}
              />
              <Text style={styles.body}>{item.quantity}</Text>
              <Action
                title="+"
                accessibilityLabel={`Tăng số lượng ${item.title}`}
                secondary
                disabled={item.quantity >= quantityLimit(item)}
                onPress={() => cart.changeQuantity(item.id, item.quantity + 1)}
              />
              <Action title="Xóa" secondary onPress={() => cart.remove(item.id)} />
            </View>
          </View>
        )}
      />
      <View style={styles.card}>
        <Text style={styles.body}>{cart.itemCount} sản phẩm · Giá được lưu khi thêm vào giỏ</Text>
        <Text style={styles.title}>Tổng: {money(cart.total)}</Text>
        <Text style={styles.body}>
          Bài tập không thực hiện thanh toán thật. Giỏ được lưu trên máy.
        </Text>
        <Action
          title="Cài nhắc giỏ hàng"
          secondary
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </View>
  );
}
