// Creates only its own disposable anonymous users and wishlist document.
// Requires server/.env and a running AI proxy; never prints credentials.
const assert = require('node:assert/strict');
const { initializeApp, deleteApp } = require('firebase/app');
const { getAuth, signInAnonymously, deleteUser } = require('firebase/auth');
const {
  getFirestore,
  doc,
  setDoc,
  getDocFromServer,
  deleteDoc,
  serverTimestamp,
} = require('firebase/firestore');
const { normalizeProduct } = require('../src/domain/products');
const { validateRecommendations } = require('../src/domain/recommendations');

async function run() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId || !process.env.FIREBASE_WEB_API_KEY)
    throw new Error('Missing local Firebase config.');
  const config = { projectId, apiKey: process.env.FIREBASE_WEB_API_KEY };
  const apps = [initializeApp(config, 'cloud-test-a'), initializeApp(config, 'cloud-test-b')];
  const users = [];
  let reference;
  let wrote = false;
  try {
    for (const app of apps) users.push((await signInAnonymously(getAuth(app))).user);
    console.log('Anonymous Auth: PASS');
    const product = normalizeProduct(
      await (
        await fetch('https://dummyjson.com/products/1', { signal: AbortSignal.timeout(15000) })
      ).json(),
    );
    reference = doc(getFirestore(apps[0]), 'users', users[0].uid, 'wishlist', String(product.id));
    await setDoc(reference, { ...product, savedAt: serverTimestamp() });
    wrote = true;
    assert.equal((await getDocFromServer(reference)).data().id, product.id);
    console.log('Firestore own wishlist write/read: PASS');
    const otherReference = doc(
      getFirestore(apps[1]),
      'users',
      users[0].uid,
      'wishlist',
      String(product.id),
    );
    await assert.rejects(
      getDocFromServer(otherReference),
      (error) => error.code === 'permission-denied',
    );
    console.log('Firestore cross-UID read denied: PASS');
    if (process.argv.includes('--firebase-only')) return;
    const cases = [{ query: 'phone', budget: 500 }];
    if (process.argv.includes('--repeat'))
      cases.push(
        { query: 'laptop', budget: 1500 },
        { query: 'phone', budget: 500 },
        { query: 'zzzznohitmma301', budget: 500, empty: true },
      );
    for (const sample of cases) {
      const started = Date.now();
      const response = await fetch('http://127.0.0.1:3001/recommend', {
        method: 'POST',
        signal: AbortSignal.timeout(90000),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await users[0].getIdToken()}`,
        },
        body: JSON.stringify({
          query: sample.query,
          need: `Tôi cần ${sample.query} dưới ${sample.budget} USD để học tập.`,
        }),
      });
      const output = await response.json();
      assert.equal(
        response.status,
        200,
        `Proxy HTTP ${response.status}: ${output.error || 'request failed'}`,
      );
      const catalog = (
        await (
          await fetch(
            `https://dummyjson.com/products/search?q=${encodeURIComponent(sample.query)}&limit=24&skip=0`,
            {
              signal: AbortSignal.timeout(15000),
            },
          )
        ).json()
      ).products.map(normalizeProduct);
      const mapped = validateRecommendations(output, catalog);
      if (sample.empty) assert.equal(mapped.length, 0);
      else {
        assert.ok(
          mapped.length > 0,
          'Expected at least one matching real product for smoke input.',
        );
        assert.ok(
          mapped.every(({ product }) => product.price <= sample.budget),
          'Recommendations must fit the smoke-test budget.',
        );
      }
      console.log(
        `Real proxy ${sample.query}: PASS (${mapped.length} recommendations, ${Date.now() - started} ms)`,
      );
    }
  } finally {
    if (wrote)
      await deleteDoc(reference).catch(() => console.log('Test wishlist cleanup pending.'));
    for (const user of users)
      await deleteUser(user).catch(() => console.log('Test anonymous user cleanup pending.'));
    await Promise.all(apps.map(deleteApp));
  }
}
run().catch((error) => {
  console.error('Cloud verification failed:', error.code || '', error.message);
  process.exitCode = 1;
});
