const getTokenMetadata = require('../checks/getTokenMetadata');
const checkTokenAge = require('../checks/checkTokenAge');
const checkMintAuthority = require('../checks/checkMintAuthority');
const checkFreezeAuthority = require('../checks/checkFreezeAuthority');
const checkHolderConcentration = require('../checks/checkHolderConcentration');
const checkLiquidity = require('../checks/checkLiquidity');
const checkDevWallet = require('../checks/checkDevWallet');
const getMarketData = require('../checks/getMarketData');
const calculateRiskScore = require('./calculateRiskScore');

module.exports = async (address) => {
  console.log('[analyzeToken] Starting analysis for:', address);
  
  try {
    const metadata = await getTokenMetadata(address);

    const results = await Promise.allSettled([
      checkTokenAge(address),
      checkHolderConcentration(address),
      checkLiquidity(address, metadata.supply),
      checkDevWallet(address, metadata.supply),
      getMarketData(address)
    ]);

    const ageResult = results[0].status === 'fulfilled' ? results[0].value : { ageString: "Unknown", scoreImpact: 0, isEstablished: false };
    const holderResult = results[1].status === 'fulfilled' ? results[1].value : { topTenPercent: 0, scoreImpact: 0 };
    const liquidityResult = results[2].status === 'fulfilled' ? results[2].value : { usd: 0, usdLabel: "$0 (est.)", scoreImpact: -40 };
    const devResult = results[3].status === 'fulfilled' ? results[3].value : { percentSold: 0, scoreImpact: 0 };
    const marketData = results[4].status === 'fulfilled' ? results[4].value : {
      priceUsd: null, marketCap: null, fdv: null,
      volume1h: null, volume24h: null, liquidityUsd: null,
      priceChange1h: null, priceChange24h: null,
      bondingStatus: '❓ Unknown', links: {
        dexscreener: `https://dexscreener.com/solana/${address}`,
        pumpfun: `https://pump.fun/${address}`,
        solscan: `https://solscan.io/token/${address}`
      }
    };

    // If token is established, bypass dev wallet penalty as we can't find original deployer easily
    if (ageResult.isEstablished) {
      devResult.scoreImpact = 0;
      devResult.percentSold = 0;
      devResult.deployerAddress = "Bypassed (Established Token)";
      
      // Also boost liquidity score if price is found but depth is unknown
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
      freezeResult.scoreImpact
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
      tokenAge: {
        age: ageResult.ageString,
        scoreImpact: ageResult.scoreImpact
      }
    };
  } catch (err) {
    console.error('[analyzeToken] Critical Error:', err.message);
    throw err;
  }
};
