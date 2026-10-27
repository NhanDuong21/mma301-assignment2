import { requestJson } from './http';
import { normalizeProduct } from '../domain/products';
export const PAGE_SIZE = 12;
const API = 'https://dummyjson.com';
export async function getProducts({ query = '', skip = 0, limit = PAGE_SIZE, signal } = {}) {
  const path = query.trim() ? `/products/search?q=${encodeURIComponent(query.trim())}&` : '/products?';
  const data = await requestJson(`${API}${path}limit=${limit}&skip=${skip}`, { signal });
  if (!Array.isArray(data.products) || !Number.isInteger(data.total) || data.total < 0) throw new Error('Catalog trả dữ liệu không hợp lệ.');
  return { products: data.products.map(normalizeProduct), total: data.total, received: data.products.length };
}
export async function getProduct(id, signal) {
  if (!Number.isInteger(id) || id < 1) throw new Error('Mã sản phẩm không hợp lệ.');
  return normalizeProduct(await requestJson(`${API}/products/${id}`, { signal }));
}
