require('dotenv').config();
const { analyzeFull } = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');

async function runManualTests() {
  const tests = [
    { name: 'USDC (Established)', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
    { name: 'BONK (Popular Memecoin)', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    { name: 'BadDuck (Pump.fun)', address: '8Fm2Cx1o3A4BswbdmtD3GydafUwK5X6F4Q8U6AFXpump' },
    { name: 'Trending Token (Example)', address: '6p6xgHy9S7Bn3DcyH7Sj5m1n8zXn5m8zXn5m8zXpump' }, // Placeholder for trending
    { name: 'Invalid Address', address: 'abc123' }
  ];

  for (const test of tests) {
    console.log(`\n\n=== RUNNING TEST: ${test.name} (${test.address}) ===`);
    try {
      const result = await analyzeFull(test.address);
      const report = formatReport(result, test.address);
      console.log('--- CONSOLE OUTPUT ---');
      console.log(`Analysis for ${test.name} completed.`);
      console.log('--- REPORT TEXT ---');
      console.log(report);
    } catch (err) {
      console.error(`!!! CRITICAL FAILURE on ${test.name}:`, err.message);
    }
  }
}

runManualTests();
