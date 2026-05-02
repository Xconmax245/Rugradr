const axios = require('axios');

/**
 * Fetches market data for a token address using the DexScreener API.
 * @param {string} address - The token mint address.
 * @returns {Promise<Object>} Market data object.
 */
module.exports = async (address) => {
  console.log('[getMarketData] Running for address:', address);

  const emptyResult = {
    priceUsd: null,
    marketCap: null,
    fdv: null,
    volume1h: null,
    volume24h: null,
    liquidityUsd: null,
    priceChange1h: null,
    priceChange24h: null,
    ath: null,
    pairAddress: null,
    dexId: null,
    bondingStatus: '❓ Not found on DexScreener',
    links: {
      dexscreener: `https://dexscreener.com/solana/${address}`,
      pumpfun: `https://pump.fun/${address}`,
      solscan: `https://solscan.io/token/${address}`
    }
  };

  try {
    const response = await axios.get(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
      timeout: 10000
    });

    const pairs = response.data.pairs;

    if (!pairs || pairs.length === 0) {
      return emptyResult;
    }

    // Sort by liquidity (USD) descending to get the most relevant pair
    const sortedPairs = pairs.sort((a, b) => {
      const liqA = a.liquidity?.usd || 0;
      const liqB = b.liquidity?.usd || 0;
      return liqB - liqA;
    });

    const pair = sortedPairs[0];

    return {
      priceUsd: pair.priceUsd || null,
      marketCap: pair.marketCap || pair.fdv || null,
      fdv: pair.fdv || null,
      volume1h: pair.volume?.h1 || null,
      volume24h: pair.volume?.h24 || null,
      liquidityUsd: pair.liquidity?.usd || null,
      priceChange1h: pair.priceChange?.h1 || null,
      priceChange24h: pair.priceChange?.h24 || null,
      ath: null, // DexScreener doesn't provide ATH directly
      pairAddress: pair.pairAddress || null,
      dexId: pair.dexId || null,
      bondingStatus: pair.dexId === 'pump-fun' ? '🟡 Still on pump.fun' : '✅ Graduated to DEX',
      links: {
        dexscreener: `https://dexscreener.com/solana/${address}`,
        pumpfun: `https://pump.fun/${address}`,
        solscan: `https://solscan.io/token/${address}`
      }
    };
  } catch (err) {
    console.error('[getMarketData] Error fetching from DexScreener:', err.message);
    return emptyResult;
  }
};
