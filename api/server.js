const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

const BUILD_NUMBER = process.env.BUILD_NUMBER || 'local';
const GIT_COMMIT = (process.env.GIT_COMMIT || 'unknown').substring(0, 7);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    build: BUILD_NUMBER,
    commit: GIT_COMMIT
  });
});


// החלק העיקרי - מושך שערי מטבעות אמיתיים ומחזיר JSON
app.get('/data', async (req, res) => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');

    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }

    const externalData = await response.json();

    res.status(200).json({
      service: 'api',
      base: externalData.base_code,
      lastUpdate: externalData.time_last_update_utc,
      rates: externalData.rates
    });
  } catch (err) {
    console.error('Failed to fetch exchange rates:', err.message);
    res.status(502).json({
      service: 'api',
      error: 'Failed to fetch exchange rates from external source'
    });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`api service listening on port ${PORT}`);
  });
}

module.exports = { app };