async function runIntegrationTest() {
  console.log('checking if the api service is running...');

  // 1. בדיקה ישירה מול ה-api
  const apiRes = await fetch('http://localhost:4000/data');
  if (!apiRes.ok) {
    throw new Error(`API error (status ${apiRes.status})`);
  }
  const apiData = await apiRes.json();
  if (!apiData.rates || Object.keys(apiData.rates).length === 0) {
    throw new Error('API is not returning valid rates');
  }
  console.log('✅ API is returning valid rate data');

  // 2. בדיקה שה-web באמת מציג נתונים אמיתיים שהגיעו מה-api
  const webRes = await fetch('http://localhost:5000');
  if (!webRes.ok) {
    throw new Error(`Web service error (status ${webRes.status})`);
  }
  const html = await webRes.text();

  const sampleCurrency = Object.keys(apiData.rates)[0];
  if (!html.includes(sampleCurrency)) {
    throw new Error(`Web service is not displaying API data (currency ${sampleCurrency} not found on page)`);
  }
  console.log(`✅ Web service is successfully displaying API data`);

  console.log('🎉 Integration test passed!');
}

runIntegrationTest().catch((err) => {
  console.error('❌ Integration test failed:', err.message);
  process.exit(1);
});