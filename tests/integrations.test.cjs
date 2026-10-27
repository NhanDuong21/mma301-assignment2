const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../server/index.cjs');
const { normalizeProduct, mergeProducts } = require('../src/domain/products');
const { validateRecommendations } = require('../src/domain/recommendations');
const phone = { id: 1, title: 'Phone', price: 100, stock: 2 };

test('product boundary rejects corrupt prices and deduplicates overlapping pages', () => {
  assert.throws(() => normalizeProduct({ ...phone, price: '100' }));
  assert.throws(() => normalizeProduct({ ...phone, id: 0 }));
  assert.equal(mergeProducts([phone], [phone, { ...phone, id: 2 }]).length, 2);
});
test('AI boundary rejects hallucinated IDs, duplicates, invalid format and unavailable stock', () => {
  const valid = { recommendations: [{ id: 1, reason: 'Phù hợp ngân sách' }] };
  assert.equal(validateRecommendations(valid, [phone])[0].product.title, 'Phone');
  assert.throws(() =>
    validateRecommendations({ recommendations: [{ id: 999, reason: 'Giả' }] }, [phone]),
  );
  assert.throws(() =>
    validateRecommendations(
      { recommendations: [...valid.recommendations, ...valid.recommendations] },
      [phone],
    ),
  );
  assert.throws(() => validateRecommendations({}, [phone]));
  assert.throws(() => validateRecommendations(valid, [{ ...phone, stock: 0 }]));
});

async function withServer(options, run) {
  const server = createServer(options);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
const env = {
  GEMINI_API_KEY: 'test-key-not-a-secret',
  FIREBASE_WEB_API_KEY: 'test-config',
  GEMINI_MODEL: 'test-model',
};
const post = (url, body, auth = true) =>
  fetch(`${url}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: 'Bearer test-token' } : {}),
    },
    body: JSON.stringify(body),
  });
test('unconfigured proxy responds honestly without attempting Gemini', async () => {
  await withServer({ env: {} }, async (url) => {
    assert.equal((await post(url, {})).status, 503);
    assert.deepEqual(await (await fetch(`${url}/health`)).json(), { ok: true, configured: false });
  });
});
test('proxy enforces auth and input validation before any AI call', async () => {
  let calls = 0;
  await withServer(
    {
      env,
      upstream: async () => {
        calls++;
        throw Error('should not call');
      },
    },
    async (url) => {
      assert.equal((await post(url, { query: 'phone', need: 'test' }, false)).status, 401);
      assert.equal((await post(url, { query: '', need: '' })).status, 400);
      assert.equal(calls, 0);
    },
  );
});
test('proxy maps catalog IDs and rate-limits authenticated requests', async () => {
  let geminiCalls = 0;
  const upstream = async (url, options) => {
    if (url.includes('accounts:lookup')) return { users: [{ localId: 'test-user' }] };
    if (url.includes('dummyjson.com')) return { products: [phone] };
    geminiCalls++;
    const prompt = JSON.parse(options.body);
    assert.equal(prompt.generationConfig.responseMimeType, 'application/json');
    return {
      candidates: [
        {
          content: {
            parts: [
              { text: JSON.stringify({ recommendations: [{ id: 1, reason: 'Trong ngân sách' }] }) },
            ],
          },
        },
      ],
    };
  };
  await withServer({ env, upstream }, async (url) => {
    for (let i = 0; i < 5; i++)
      assert.equal((await post(url, { query: 'phone', need: 'under $200' })).status, 200);
    assert.equal((await post(url, { query: 'phone', need: 'under $200' })).status, 429);
    assert.equal(geminiCalls, 5);
  });
});
test('invalid Gemini output is rejected rather than returned to app', async () => {
  const upstream = async (url) =>
    url.includes('accounts:lookup')
      ? { users: [{ localId: 'test-user' }] }
      : url.includes('dummyjson.com')
        ? { products: [phone] }
        : {
            candidates: [
              {
                content: { parts: [{ text: '{"recommendations":[{"id":999,"reason":"fake"}]}' }] },
              },
            ],
          };
  await withServer({ env, upstream }, async (url) =>
    assert.equal((await post(url, { query: 'phone', need: 'test' })).status, 502),
  );
});
