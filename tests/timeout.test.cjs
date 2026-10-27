const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('../server/index.cjs');
test('upstream timeouts return actionable HTTP 504 without exposing credentials', async () => {
  const server = createServer({
    env: { GEMINI_API_KEY: 'not-a-real-key', FIREBASE_WEB_API_KEY: 'test-config' },
    upstream: async (url) => {
      if (url.includes('accounts:lookup')) return { users: [{ localId: 'test-user' }] };
      throw new DOMException('upstream timed out', 'TimeoutError');
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
    assert.equal(response.status, 504);
    const body = await response.json();
    assert.match(body.error, /quá thời gian/);
    assert.ok(!JSON.stringify(body).includes('not-a-real-key'));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
