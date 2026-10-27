import { Message } from '../components/ui';
export default function ProductDetailScreen({ route }) {
  return <Message title="Chi tiết sản phẩm" detail={`Mã sản phẩm: ${route.params?.productId}`} />;
}
