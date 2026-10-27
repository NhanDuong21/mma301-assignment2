import { View } from 'react-native';
import { Action, Message, styles } from '../components/ui';
export default function ProductListScreen({ navigation }) {
  return <View style={styles.page}><Message title="Nyan Shop" detail="Catalog sẽ được nối API trong phase 2." />
    <Action title="Xem chi tiết" onPress={() => navigation.navigate('ProductDetail', { productId: 1 })} />
  </View>;
}
