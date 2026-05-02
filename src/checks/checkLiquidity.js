const axios = require('axios');
const { LIQUIDITY_THRESHOLDS } = require('../config/constants');

module.exports = async (address, supply) => {
  console.log('[checkLiquidity] Running for address:', address);
  try {
    const priceResponse = await axios.get(`https://lite.jupiterapi.com/price?ids=${address}`, { timeout: 10000 });
    const price = priceResponse.data.data?.[address]?.price || null;

    if (!price) {
      return { 
        usd: 0, 
        usdLabel: "$0 (est.)",
        price: null, 
        scoreImpact: -40 
      };
    }

    const fdv = (supply / Math.pow(10, 9)) * price;
    const estimatedLiquidity = fdv * 0.1; // Hypothetical 10% proxy for LP depth

    let scoreImpact = 0;
    if (estimatedLiquidity < LIQUIDITY_THRESHOLDS.LOW) scoreImpact = -20;
    else if (estimatedLiquidity < LIQUIDITY_THRESHOLDS.MODERATE) scoreImpact = -10;
    else if (estimatedLiquidity < LIQUIDITY_THRESHOLDS.HIGH) scoreImpact = 0;
    else scoreImpact = 10;

    return {
      usd: estimatedLiquidity,
      usdLabel: `~$${Math.round(estimatedLiquidity).toLocaleString()} (est.)`,
      price: price,
      scoreImpact
    };
  } catch (err) {
    console.error('[checkLiquidity] Error:', err.message);
    return { usd: 0, usdLabel: "$0 (est.)", price: null, scoreImpact: -40 };
  }
};
