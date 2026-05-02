require('dotenv').config();
const analyzeToken = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');

async function testFixes() {
  const address = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
  console.log('--- Testing Fixes with USDC ---');
  try {
    const result = await analyzeToken(address);
    const report = formatReport(result, address);
    console.log(report);
  } catch (err) {
    console.error('Error in testFixes:', err.message);
  }
}

testFixes();
