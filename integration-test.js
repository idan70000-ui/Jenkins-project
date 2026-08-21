const API_URL = process.env.API_URL || 'http://localhost:4000';
const WEB_URL = process.env.WEB_URL || 'http://localhost:5000';

async function runIntegrationTest() {
  console.log('checking if the api service is running...');

  const apiRes = await fetch(`${API_URL}/data`);
  if (!apiRes.ok) {
    throw new Error(`API error (status ${apiRes.status})`);
  }
  const apiData = await apiRes.json();
  if (!apiData.rates || Object.keys(apiData.rates).length === 0) {
    throw new Error('API is not returning valid rates');
  }
  console.log('✅ API is returning valid rate data');

  const webRes = await fetch(WEB_URL);
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