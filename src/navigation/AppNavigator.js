import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Pressable } from 'react-native';
import { colors } from '../theme';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  return <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerTintColor: colors.text, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Products" component={ProductListScreen} options={({ navigation }) => ({
        title: 'Nyan Shop',
        headerRight: () => <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Cart')}><Text style={{ color: colors.primary }}>Giỏ hàng</Text></Pressable>,
      })} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Chi tiết sản phẩm' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ title: 'Yêu thích trên Firebase' }} />
      <Stack.Screen name="AI" component={AIScreen} options={{ title: 'Gemini tư vấn sản phẩm' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Cài đặt & thông báo' }} />
    </Stack.Navigator>
  </NavigationContainer>;
}
