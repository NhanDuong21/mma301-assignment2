const { test } = require('node:test');
const assert = require('node:assert/strict');
const { cartReducer, cartTotals, restoreCart } = require('../src/domain/cart');
const product = { id: 1, title: 'Phone', price: 19.99, stock: 3 };
test('adding twice increments quantity and derives monetary totals in cents', () => {
  const state = cartReducer(cartReducer([], { type: 'add', product }), { type: 'add', product });
  assert.equal(state.length, 1);
  assert.deepEqual(cartTotals(state), { itemCount: 2, total: 39.98 });
});
test('quantity is bounded by stock; zero removes; invalid quantity cannot corrupt cart', () => {
  const items = cartReducer([], { type: 'add', product });
  assert.equal(cartReducer(items, { type: 'quantity', id: 1, quantity: 99 })[0].quantity, 3);
  assert.deepEqual(cartReducer(items, { type: 'quantity', id: 1, quantity: -1 }), items);
  assert.deepEqual(cartReducer(items, { type: 'quantity', id: 1, quantity: 0 }), []);
  assert.deepEqual(cartReducer(items, { type: 'remove', id: 1 }), []);
});
test('out of stock cannot be added and an empty cart has zero totals', () => {
  assert.deepEqual(cartReducer([], { type: 'add', product: { ...product, stock: 0 } }), []);
  assert.deepEqual(cartTotals([]), { itemCount: 0, total: 0 });
});
test('restart roundtrip validates saved snapshots and rejects duplicate/corrupt records', () => {
  const items = cartReducer([], { type: 'add', product });
  assert.deepEqual(restoreCart(JSON.parse(JSON.stringify(items))), items);
  assert.throws(() => restoreCart([...items, ...items]));
  assert.throws(() => restoreCart([{ ...product, quantity: 1.2 }]));
  assert.throws(() => restoreCart([{ ...product, price: -2, quantity: 1 }]));
});
