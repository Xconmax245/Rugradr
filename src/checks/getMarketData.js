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
      // Fallback to pump.fun API for bonding curve tokens
      try {
        console.log('[getMarketData] No DexScreener pairs, trying pump.fun fallback...');
        const pumpResponse = await axios.get(
          `https://frontend-api.pump.fun/coins/${address}`,
          { timeout: 8000 }
        );
        const coin = pumpResponse.data;
        if (coin && coin.usd_market_cap) {
          return {
            priceUsd: coin.usd_market_cap / (coin.total_supply / 1e6) || null,
            marketCap: coin.usd_market_cap || null,
            fdv: coin.usd_market_cap || null,
            volume1h: null,
            volume24h: null,
            liquidityUsd: coin.virtual_sol_reserves ? coin.virtual_sol_reserves * 0.000000001 : null,
            priceChange1h: null,
            priceChange24h: null,
            ath: null,
            pairAddress: null,
            dexId: 'pump-fun',
            bondingStatus: coin.complete ? '✅ Graduated to DEX' : '🟡 Still on pump.fun bonding curve',
            links: {
              dexscreener: `https://dexscreener.com/solana/${address}`,
              pumpfun: `https://pump.fun/${address}`,
              solscan: `https://solscan.io/token/${address}`
            }
          };
        }
      } catch (pumpErr) {
        console.log('[getMarketData] pump.fun fallback also failed:', pumpErr.message);
      }
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
