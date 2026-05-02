const getTokenMetadata = require('../checks/getTokenMetadata');
const checkTokenAge = require('../checks/checkTokenAge');
const checkMintAuthority = require('../checks/checkMintAuthority');
const checkFreezeAuthority = require('../checks/checkFreezeAuthority');
const checkHolderConcentration = require('../checks/checkHolderConcentration');
const checkLiquidity = require('../checks/checkLiquidity');
const checkDevWallet = require('../checks/checkDevWallet');
const calculateRiskScore = require('./calculateRiskScore');

module.exports = async (address) => {
  console.log('[analyzeToken] Starting analysis for:', address);
  
  try {
    // 1. Get Metadata first as it's required for others
    const metadata = await getTokenMetadata(address);

    // 2. Run all other checks in parallel
    const results = await Promise.allSettled([
      checkTokenAge(address),
      checkHolderConcentration(address),
      checkLiquidity(address, metadata.supply),
      checkDevWallet(address, metadata.supply)
    ]);

    // Handle settle results with fallbacks
    const ageResult = results[0].status === 'fulfilled' ? results[0].value : { ageString: "Unknown", scoreImpact: 0 };
    const holderResult = results[1].status === 'fulfilled' ? results[1].value : { topTenPercent: 0, scoreImpact: 0 };
    const liquidityResult = results[2].status === 'fulfilled' ? results[2].value : { usd: 0, scoreImpact: -40 };
    const devResult = results[3].status === 'fulfilled' ? results[3].value : { percentSold: 0, scoreImpact: 0 };

    // Authority checks (synchronous/simple)
    const mintResult = checkMintAuthority(metadata.mintAuthority);
    const freezeResult = checkFreezeAuthority(metadata.freezeAuthority);

    // 3. Calculate Final Risk Score
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
      mintAuthority: mintResult,
      freezeAuthority: freezeResult,
      holderConcentration: holderResult,
      liquidity: liquidityResult,
      devWallet: devResult,
      tokenAge: {
        age: ageResult.ageString,
        scoreImpact: ageResult.scoreImpact
      }
    };
  } catch (err) {
    console.error('[analyzeToken] Critical Error:', err.message);
    throw err; // Re-throw to be caught by command handler
  }
};
