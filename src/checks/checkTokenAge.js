const axios = require('axios');
const { AGE_THRESHOLDS } = require('../config/constants');

const getAgeString = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
};

module.exports = async (address) => {
  console.log('[checkTokenAge] Running for address:', address);
  try {
    const response = await axios.post(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getSignaturesForAddress",
      params: [address, { limit: 1000 }]
    }, { timeout: 10000 });

    const signatures = response.data.result;
    if (!signatures || signatures.length === 0) {
      return { createdAt: null, ageMs: 0, ageString: "Unknown", scoreImpact: -30 };
    }

    const oldestSignature = signatures[signatures.length - 1];
    const blockTime = oldestSignature.blockTime;
    const ageMs = Date.now() - blockTime * 1000;
    const ageString = getAgeString(ageMs);

    let scoreImpact = 0;
    if (ageMs < AGE_THRESHOLDS.ONE_HOUR_MS) {
      scoreImpact = -30;
    } else if (ageMs < AGE_THRESHOLDS.ONE_DAY_MS) {
      scoreImpact = -15;
    } else if (ageMs < AGE_THRESHOLDS.SEVEN_DAYS_MS) {
      scoreImpact = -5;
    } else {
      scoreImpact = 0;
    }

    return {
      createdAt: blockTime,
      ageMs,
      ageString,
      scoreImpact
    };
  } catch (err) {
    console.error('[checkTokenAge] Error:', err.message);
    return { createdAt: null, ageMs: 0, ageString: "Unknown", scoreImpact: -30 };
  }
};
