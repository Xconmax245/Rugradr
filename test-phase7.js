require('dotenv').config();
const { analyzeFull } = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');

async function testPhase7() {
  const addresses = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC (Established, Clean)
    '8Fm2Cx1o3A4BswbdmtD3GydafUwK5X6F4Q8U6AFXpump'  // BadDuck (Rugged/Serial Rugger)
  ];

  for (const address of addresses) {
    console.log(`\n\n=== PHASE 7 TEST: ${address} ===`);
    try {
      const result = await analyzeFull(address);
      const report = formatReport(result, address);
      console.log(report);
    } catch (err) {
      console.error(`Error testing ${address}:`, err.message);
    }
  }
}

testPhase7();
