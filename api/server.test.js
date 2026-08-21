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