import { aiProxyUrl } from '../config';
import { ensureSession } from './firebaseService';
import { requestJson } from './http';
import { getProducts } from './productService';
import { validateRecommendations } from '../domain/recommendations';
export async function recommendProducts(query, need, signal) {
  if (!aiProxyUrl) throw new Error('Chưa cấu hình địa chỉ AI proxy. Xem README.');
  if (!need.trim() || need.trim().length > 600)
    throw new Error('Mô tả nhu cầu từ 1 đến 600 ký tự.');
  const { products } = await getProducts({ query, limit: 24, signal });
  if (!products.length) return { recommendations: [], count: 0 };
  const user = await ensureSession();
  const token = await user.getIdToken();
  const output = await requestJson(`${aiProxyUrl}/recommend`, {
    method: 'POST',
    signal,
    timeout: 90000,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: query.trim(), need: need.trim() }),
  });
  return { recommendations: validateRecommendations(output, products), count: products.length };
}
