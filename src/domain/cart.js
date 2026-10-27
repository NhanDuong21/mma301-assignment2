const { normalizeProduct } = require('./products');
const MAX_QUANTITY = 99;
const quantityLimit = (product) => Math.min(MAX_QUANTITY, product.stock);
function restoreCart(raw) {
  if (!Array.isArray(raw)) throw new Error('Giỏ hàng lưu trên máy không hợp lệ.');
  const seen = new Set();
  return raw.map((item) => {
    const product = normalizeProduct(item);
    if (
      seen.has(product.id) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > quantityLimit(product)
    ) {
      throw new Error('Giỏ hàng lưu trên máy không hợp lệ.');
    }
    seen.add(product.id);
    return { ...product, quantity: item.quantity };
  });
}
function cartReducer(items, action) {
  switch (action.type) {
    case 'restore':
      return restoreCart(action.items);
    case 'add': {
      const product = normalizeProduct(action.product);
      const previous = items.find((item) => item.id === product.id);
      const quantity = Math.min((previous?.quantity || 0) + 1, quantityLimit(product));
      if (quantity < 1) return items;
      return previous
        ? items.map((item) => (item.id === product.id ? { ...product, quantity } : item))
        : [...items, { ...product, quantity }];
    }
    case 'quantity':
      if (!Number.isInteger(action.quantity) || action.quantity < 0) return items;
      if (action.quantity === 0) return items.filter((item) => item.id !== action.id);
      return items.map((item) =>
        item.id === action.id
          ? { ...item, quantity: Math.min(action.quantity, quantityLimit(item)) }
          : item,
      );
    case 'remove':
      return items.filter((item) => item.id !== action.id);
    default:
      return items;
  }
}
function cartTotals(items) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0) / 100,
  };
}
module.exports = { cartReducer, cartTotals, restoreCart, quantityLimit };
