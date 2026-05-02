const axios = require('axios');
const { HOLDER_THRESHOLDS } = require('../config/constants');

module.exports = async (address) => {
  console.log('[checkHolderConcentration] Running for address:', address);
  try {
    const response = await axios.post(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getTokenLargestAccounts",
      params: [address]
    }, { timeout: 10000 });

    const accounts = response.data.result?.value || [];
    if (accounts.length === 0) {
      return { topTenPercent: 0, topHolders: [], scoreImpact: 0 };
    }

    const totalAmount = accounts.reduce((acc, curr) => acc + BigInt(curr.amount), BigInt(0));
    const topTenAmount = accounts.slice(0, 10).reduce((acc, curr) => acc + BigInt(curr.amount), BigInt(0));

    const topTenPercent = totalAmount > BigInt(0) 
      ? Number((topTenAmount * BigInt(1000) / totalAmount)) / 10 
      : 0;

    const truncate = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
    const topHolders = accounts.slice(0, 5).map(acc => ({
      address: truncate(acc.address),
      percent: totalAmount > BigInt(0) 
        ? Number((BigInt(acc.amount) * BigInt(1000) / totalAmount)) / 10 
        : 0
    }));

    let scoreImpact = 0;
    if (topTenPercent > HOLDER_THRESHOLDS.VERY_HIGH) scoreImpact = -30;
    else if (topTenPercent > HOLDER_THRESHOLDS.HIGH) scoreImpact = -15;
    else if (topTenPercent > HOLDER_THRESHOLDS.MODERATE) scoreImpact = -5;
    else scoreImpact = 0;

    return {
      topTenPercent,
      topHolders,
      scoreImpact
    };
  } catch (err) {
    console.error('[checkHolderConcentration] Error:', err.message);
    return { topTenPercent: 0, topHolders: [], scoreImpact: 0 };
  }
};
