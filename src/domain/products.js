function normalizeProduct(raw) {
  if (!raw || !Number.isInteger(raw.id) || raw.id < 1 || typeof raw.title !== 'string' || !raw.title.trim()
    || !Number.isFinite(raw.price) || raw.price < 0) throw new Error('Dữ liệu sản phẩm không hợp lệ.');
  return {
    id: raw.id, title: raw.title, price: raw.price,
    description: typeof raw.description === 'string' ? raw.description : '',
    thumbnail: typeof raw.thumbnail === 'string' && /^https:\/\//.test(raw.thumbnail) ? raw.thumbnail : null,
    category: typeof raw.category === 'string' ? raw.category : '',
    stock: Number.isInteger(raw.stock) && raw.stock >= 0 ? raw.stock : 0,
    rating: Number.isFinite(raw.rating) ? raw.rating : 0,
  };
}
function mergeProducts(current, incoming) {
  const products = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => products.set(item.id, item));
  return [...products.values()];
}
module.exports = { normalizeProduct, mergeProducts };
