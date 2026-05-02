require('dotenv').config();
const { analyzeFull } = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');

async function testBonkFixes() {
  const address = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // BONK
  console.log('--- Testing Phase 7 Fixes with BONK ---');
  try {
    const result = await analyzeFull(address);
    const report = formatReport(result, address);
    console.log(report);
  } catch (err) {
    console.error('Error in testBonkFixes:', err.message);
  }
}

testBonkFixes();
