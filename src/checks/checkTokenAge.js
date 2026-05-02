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
      return { createdAt: null, ageMs: 0, ageString: "Unknown", scoreImpact: -30, isEstablished: false };
    }

    const oldestSignature = signatures[signatures.length - 1];
    const blockTime = oldestSignature.blockTime;
    const ageMs = Date.now() - blockTime * 1000;
    const ageString = getAgeString(ageMs);

    // If we maxed out signatures (1000) and still haven't reached the creation transaction
    // (i.e., the oldest signature we found is relatively recent), it's an established high-volume token.
    const maxedOut = signatures.length === 1000;
    const isEstablished = maxedOut && (ageMs < 24 * 60 * 60 * 1000); // Maxed out within last 24 hours

    if (isEstablished) {
      return {
        createdAt: null,
        ageMs: 0,
        ageString: "Established token",
        scoreImpact: 0,
        isEstablished: true
      };
    }

    let scoreImpact = 0;
    if (ageMs < AGE_THRESHOLDS.ONE_HOUR_MS) {
      scoreImpact = -30;
    } else if (ageMs < AGE_THRESHOLDS.ONE_DAY_MS) {
      scoreImpact = -15;
    } else if (ageMs < AGE_THRESHOLDS.SEVEN_DAYS_MS) {
      scoreImpact = -5;
    }

    return {
      createdAt: blockTime,
      ageMs,
      ageString,
      scoreImpact,
      isEstablished: false
    };
  } catch (err) {
    console.error('[checkTokenAge] Error:', err.message);
    return { createdAt: null, ageMs: 0, ageString: "Unknown", scoreImpact: -30, isEstablished: false };
  }
};
