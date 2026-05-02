require('dotenv').config();
const { analyzeFull } = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');

async function testPersonality() {
  const tests = [
    { name: 'BONK (Established/Safe)', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
    { name: 'BadDuck (Rug)', address: '8Fm2Cx1o3A4BswbdmtD3GydafUwK5X6F4Q8U6AFXpump' },
  ];

  for (const test of tests) {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`TEST: ${test.name}`);
    console.log('='.repeat(60));
    try {
      const result = await analyzeFull(test.address);
      const report = formatReport(result, test.address);
      console.log(report);
    } catch (err) {
      console.error(`CRITICAL FAILURE on ${test.name}:`, err.message);
    }
  }
}

testPersonality();
