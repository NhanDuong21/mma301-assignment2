import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Text, Pressable } from 'react-native';
import { colors } from '../theme';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import AIScreen from '../screens/AIScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { listenForCartNotification } from '../services/notificationService';

const Stack = createNativeStackNavigator();
export default function AppNavigator() {
  const navigation = useRef(null);
  const pendingCart = useRef(false);
  useEffect(() => {
    const openCart = () => {
      if (navigation.current?.isReady()) navigation.current.navigate('Cart');
      else pendingCart.current = true;
    };
    return listenForCartNotification(openCart);
  }, []);
  return (
    <NavigationContainer
      ref={navigation}
      onReady={() => {
        if (pendingCart.current) {
          pendingCart.current = false;
          navigation.current.navigate('Cart');
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Products"
          component={ProductListScreen}
          options={({ navigation }) => ({
            title: 'Nyan Shop',
            headerRight: () => (
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Cart')}>
                <Text style={{ color: colors.primary }}>Giỏ hàng</Text>
              </Pressable>
            ),
          })}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: 'Chi tiết sản phẩm' }}
        />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Giỏ hàng' }} />
        <Stack.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{ title: 'Yêu thích trên Firebase' }}
        />
        <Stack.Screen
          name="AI"
          component={AIScreen}
          options={{ title: 'Gemini tư vấn sản phẩm' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Cài đặt & thông báo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
