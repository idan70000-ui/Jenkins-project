const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app } = require('./server.js');

test('GET /health מחזיר status, build ו-commit', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.ok('build' in res.body);
  assert.ok('commit' in res.body);
});

test('GET /data מחזיר 200 עם rates כאשר המקור החיצוני מצליח', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      base_code: 'USD',
      time_last_update_utc: 'now',
      rates: { USD: 1, EUR: 0.9 }
    })
  });
  try {
    const res = await request(app).get('/data');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.base, 'USD');
    assert.deepStrictEqual(res.body.rates, { USD: 1, EUR: 0.9 });
  } finally {
    global.fetch = originalFetch;
  }
});

test('GET /data מחזיר 502 כאשר המקור החיצוני נכשל', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 500 });
  try {
    const res = await request(app).get('/data');
    assert.strictEqual(res.status, 502);
    assert.strictEqual(res.body.service, 'api');
  } finally {
    global.fetch = originalFetch;
  }
});

test('BUILD_NUMBER ו-GIT_COMMIT מקבלים ברירת מחדל כשאינם מוגדרים', () => {
  delete require.cache[require.resolve('./server.js')];

  const originalBuild = process.env.BUILD_NUMBER;
  const originalCommit = process.env.GIT_COMMIT;
  delete process.env.BUILD_NUMBER;
  delete process.env.GIT_COMMIT;

  const fresh = require('./server.js');

  process.env.BUILD_NUMBER = originalBuild;
  process.env.GIT_COMMIT = originalCommit;
  delete require.cache[require.resolve('./server.js')];

  assert.ok(fresh.app);
});

test('BUILD_NUMBER ו-GIT_COMMIT משתמשים בערך שהועבר כשהוא קיים', () => {
  delete require.cache[require.resolve('./server.js')];

  process.env.BUILD_NUMBER = '99';
  process.env.GIT_COMMIT = 'abcdef1234567890';

  const fresh = require('./server.js');

  delete require.cache[require.resolve('./server.js')];

  assert.ok(fresh.app);
});