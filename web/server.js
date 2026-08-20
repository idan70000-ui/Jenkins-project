const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const API_URL = process.env.API_URL || 'http://localhost:4000';

const BUILD_NUMBER = process.env.BUILD_NUMBER || 'local';
const GIT_COMMIT = (process.env.GIT_COMMIT || 'unknown').substring(0, 7);

// פונקציה נבדקת - בונה שורות טבלת HTML מתוך אובייקט שערים
function buildRatesTableRows(rates) {
  return Object.entries(rates)
    .map(([currency, rate]) => `
      <tr>
        <td class="currency">${currency}</td>
        <td class="rate">${rate.toFixed(4)}</td>
      </tr>
    `)
    .join('');
}

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    build: BUILD_NUMBER,
    commit: GIT_COMMIT
  });
});

app.get('/', async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/data`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    const rows = buildRatesTableRows(data.rates);

    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>שערי מטבעות</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
          }

          .container {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
          }

          h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 8px;
            text-align: center;
          }

          .updated {
            color: #888;
            font-size: 14px;
            text-align: center;
            margin-bottom: 30px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border-radius: 8px;
            overflow: hidden;
          }

          thead {
            background: #667eea;
            color: white;
          }

          th {
            padding: 12px 16px;
            text-align: right;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          td {
            padding: 10px 16px;
            border-bottom: 1px solid #eee;
          }

          tbody tr:hover {
            background: #f5f6ff;
          }

          .currency {
            font-weight: 600;
            color: #667eea;
          }

          .rate {
            font-family: 'Courier New', monospace;
            color: #333;
          }

          .table-wrapper {
            max-height: 500px;
            overflow-y: auto;
            border-radius: 8px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>💱 שערי מטבעות</h1>
          <p class="updated">בסיס: ${data.base} · עודכן: ${data.lastUpdate}</p>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr><th>מטבע</th><th>שער</th></tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Failed to fetch from API:', err.message);
    res.status(502).send('<h1>API Error....</h1>');
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`web service listening on port ${PORT}`);
  });
}

module.exports = { app, buildRatesTableRows };