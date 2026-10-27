const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../server/index.cjs');

test('default Flash-Lite request uses supported minimal thinking and structured output', async () => {
  let generated = false;
  const server = createServer({
    env: { GEMINI_API_KEY: 'test-only', FIREBASE_WEB_API_KEY: 'test-only' },
    upstream: async (url, options) => {
      if (url.includes('accounts:lookup')) return { users: [{ localId: 'test-user' }] };
      if (url.includes('dummyjson.com'))
        return { products: [{ id: 1, title: 'Phone', price: 100, stock: 3 }] };
      assert.ok(url.endsWith('/gemini-3.5-flash-lite:generateContent'));
      const request = JSON.parse(options.body);
      assert.equal(request.generationConfig.thinkingConfig.thinkingLevel, 'minimal');
      assert.equal(request.generationConfig.responseMimeType, 'application/json');
      assert.equal(request.generationConfig.responseSchema.properties.recommendations.maxItems, 3);
      generated = true;
      return {
        candidates: [
          {
            content: {
              parts: [{ text: '{"recommendations":[{"id":1,"reason":"Trong ngân sách"}]}' }],
            },
          },
        ],
      };
    },
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/recommend`, {
      method: 'POST',
      headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'phone', need: 'under $500' }),
    });
    assert.equal(response.status, 200);
    assert.ok(generated);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
