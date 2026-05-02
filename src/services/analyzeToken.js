const getTokenMetadata = require('../checks/getTokenMetadata');
const checkTokenAge = require('../checks/checkTokenAge');
const checkMintAuthority = require('../checks/checkMintAuthority');
const checkFreezeAuthority = require('../checks/checkFreezeAuthority');
const checkHolderConcentration = require('../checks/checkHolderConcentration');
const checkLiquidity = require('../checks/checkLiquidity');
const checkDevWallet = require('../checks/checkDevWallet');
const getMarketData = require('../checks/getMarketData');
const checkDeployerHistory = require('../checks/checkDeployerHistory');
const checkHoneypot = require('../checks/checkHoneypot');
const { formatLargeNumber } = require('../utils/formatNumber');
const calculateRiskScore = require('./calculateRiskScore');

/**
 * Performs a full analysis of a token address.
 * @param {string} address - The token mint address.
 * @returns {Promise<Object>} Full analysis result.
 */
async function analyzeFull(address) {
  console.log('[analyzeFull] Starting deep analysis for:', address);
  
  try {
    const metadata = await getTokenMetadata(address);

    // Step 1: Run devWallet first to get the raw deployer address for history check
    const devResult = await checkDevWallet(address, metadata.supply).catch((err) => {
      console.error('[analyzeFull] DevWallet Error:', err.message);
      return { percentSold: 0, scoreImpact: 0, deployerAddress: 'Unknown', deployerRaw: null };
    });

    // Step 2: Run all other checks in parallel
    const results = await Promise.allSettled([
      checkTokenAge(address),
      checkHolderConcentration(address),
      checkLiquidity(address, metadata.supply),
      getMarketData(address),
      checkDeployerHistory(devResult.deployerRaw || 'Unknown'),
      checkHoneypot(address)
    ]);

    const ageResult = results[0].status === 'fulfilled' ? results[0].value : { ageString: "Unknown", scoreImpact: 0, isEstablished: false };
    const holderResult = results[1].status === 'fulfilled' ? results[1].value : { topTenPercent: 0, scoreImpact: 0 };
    const liquidityResult = results[2].status === 'fulfilled' ? results[2].value : { usd: 0, usdLabel: "$0 (est.)", scoreImpact: -40 };
    const marketData = results[3].status === 'fulfilled' ? results[3].value : {
      priceUsd: null, marketCap: null, fdv: null,
      volume1h: null, volume24h: null, liquidityUsd: null,
      priceChange1h: null, priceChange24h: null,
      bondingStatus: '❓ Unknown', links: {
        dexscreener: `https://dexscreener.com/solana/${address}`,
        pumpfun: `https://pump.fun/${address}`,
        solscan: `https://solscan.io/token/${address}`
      }
    };
    const deployerResult = results[4].status === 'fulfilled' ? results[4].value : { totalLaunched: 0, totalRugged: 0, rugRate: 0, walletAge: 'Unknown', scoreImpact: 0 };
    const honeypotResult = results[5].status === 'fulfilled' ? results[5].value : { isHoneypot: false, canSell: true, rugcheckScore: null, topRisks: 'Unable to check', scoreImpact: 0 };

    // Always prefer real DexScreener liquidity over Helius estimate
    if (marketData.liquidityUsd && marketData.liquidityUsd > 0) {
      liquidityResult.usd = marketData.liquidityUsd;
      liquidityResult.usdLabel = `${formatLargeNumber(marketData.liquidityUsd)}`;
      liquidityResult.scoreImpact = marketData.liquidityUsd > 200000 ? 10 :
                                    marketData.liquidityUsd > 50000 ? 0 :
                                    marketData.liquidityUsd > 10000 ? -10 : -20;
    }

    // For established tokens, dev selling is expected and not a red flag
    if (ageResult.isEstablished) {
      devResult.scoreImpact = 0;
      devResult.percentSold = 0;
      devResult.deployerAddress = 'Established token';
      
      // Also boost liquidity score if price is found but depth is unknown (legacy fallback)
      if (liquidityResult.price && liquidityResult.usd === 0) {
        liquidityResult.scoreImpact = 0;
        liquidityResult.usdLabel = "High (Established)";
      }
    }

    const mintResult = checkMintAuthority(metadata.mintAuthority);
    const freezeResult = checkFreezeAuthority(metadata.freezeAuthority);

    const risk = calculateRiskScore([
      ageResult.scoreImpact,
      holderResult.scoreImpact,
      liquidityResult.scoreImpact,
      devResult.scoreImpact,
      mintResult.scoreImpact,
      freezeResult.scoreImpact,
      deployerResult.scoreImpact,
      honeypotResult.scoreImpact
    ]);

    return {
      name: metadata.name,
      symbol: metadata.symbol,
      score: risk.score,
      riskLabel: risk.riskLabel,
      riskEmoji: risk.riskEmoji,
      age: ageResult.ageString,
      isEstablished: ageResult.isEstablished,
      mintAuthority: mintResult,
      freezeAuthority: freezeResult,
      holderConcentration: holderResult,
      liquidity: liquidityResult,
      devWallet: devResult,
      marketData: marketData,
      deployerHistory: deployerResult,
      honeypot: honeypotResult,
      tokenAge: {
        age: ageResult.ageString,
        scoreImpact: ageResult.scoreImpact
      }
    };
  } catch (err) {
    console.error('[analyzeFull] Critical Error:', err.message);
    return {
      name: "Unknown Token",
      symbol: "???",
      score: 0,
      riskLabel: "UNABLE TO SCAN",
      riskEmoji: "❓",
      age: "Unknown",
      isEstablished: false,
      mintAuthority: { renounced: false, scoreImpact: 0 },
      freezeAuthority: { renounced: false, scoreImpact: 0 },
      holderConcentration: { topTenPercent: 0, scoreImpact: 0 },
      liquidity: { usd: 0, usdLabel: "N/A", scoreImpact: 0 },
      devWallet: { percentSold: 0, scoreImpact: 0 },
      marketData: {
        priceUsd: null, marketCap: null, fdv: null,
        volume1h: null, volume24h: null, liquidityUsd: null,
        priceChange1h: null, priceChange24h: null,
        bondingStatus: '❓ Unknown',
        links: {
          dexscreener: `https://dexscreener.com/solana/${address}`,
          pumpfun: `https://pump.fun/${address}`,
          solscan: `https://solscan.io/token/${address}`
        }
      },
      deployerHistory: { totalLaunched: 0, totalRugged: 0, rugRate: 0, walletAge: 'Unknown', scoreImpact: 0 },
      honeypot: { isHoneypot: false, canSell: true, rugcheckScore: null, topRisks: 'Unable to check', scoreImpact: 0 },
      tokenAge: { age: "Unknown", scoreImpact: 0 }
    };
  }
}

module.exports = { analyzeFull };
