import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { WishlistProvider } from './src/contexts/WishlistContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <CartProvider><WishlistProvider><NotificationProvider><AppNavigator /></NotificationProvider></WishlistProvider></CartProvider>
    </SafeAreaProvider>
  );
}

