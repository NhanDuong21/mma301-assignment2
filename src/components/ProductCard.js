import { Image, Pressable, Text, View } from 'react-native';
import { styles } from './ui';
import { colors, money } from '../theme';
export default function ProductCard({ product, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem ${product.title}`}
      onPress={onPress}
      style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}
    >
      {product.thumbnail ? (
        <Image
          source={{ uri: product.thumbnail }}
          style={{ width: 76, height: 76 }}
          resizeMode="contain"
        />
      ) : (
        <View style={{ width: 76, height: 76 }} />
      )}
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>{product.category}</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>{product.title}</Text>
        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 18 }}>
          {money(product.price)}
        </Text>
        <Text style={{ color: colors.muted }}>
          Còn {product.stock} · ★ {product.rating}
        </Text>
      </View>
    </Pressable>
  );
}
