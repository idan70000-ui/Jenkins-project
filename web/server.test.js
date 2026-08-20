const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { app, buildRatesTableRows } = require('./server.js');

test('buildRatesTableRows יוצר שורת טבלה אחת לכל מטבע', () => {
  const rates = { USD: 1, EUR: 0.92 };
  const html = buildRatesTableRows(rates);

  assert.match(html, /USD/);
  assert.match(html, /EUR/);
  assert.match(html, /1\.0000/);
  assert.match(html, /0\.9200/);
});

test('buildRatesTableRows מחזיר מחרוזת ריקה כשאין מטבעות', () => {
  const html = buildRatesTableRows({});
  assert.strictEqual(html.trim(), '');
});

test('buildRatesTableRows מעגל שערים ל-4 ספרות אחרי הנקודה', () => {
  const rates = { JPY: 149.123456789 };
  const html = buildRatesTableRows(rates);
  assert.match(html, /149\.1235/);
});

test('GET /health מחזיר status, build ו-commit', async () => {
  const res = await request(app).get('/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.status, 'ok');
  assert.ok('build' in res.body);
  assert.ok('commit' in res.body);
});

test('GET / מחזיר 200 ומציג נתונים כאשר ה-API מצליח', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ base: 'USD', lastUpdate: 'now', rates: { USD: 1, EUR: 0.9 } })
  });
  try {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /USD/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('GET / מחזיר 502 כאשר ה-API נכשל', async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: false, status: 500 });
  try {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 502);
  } finally {
    global.fetch = originalFetch;
  }
});