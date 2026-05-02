/**
 * Looks at a result object and returns a known rug pattern warning if matched.
 * @param {Object} result - Full token analysis result.
 * @returns {string|null} Pattern warning string, or null if no match.
 */
module.exports = (result) => {
  const { mintAuthority, freezeAuthority, holderConcentration,
          liquidity, devWallet, tokenAge, deployerHistory } = result;

  // Pattern 1: Classic pump and dump
  if (
    tokenAge?.scoreImpact <= -15 &&
    holderConcentration?.topTenPercent > 60 &&
    devWallet?.percentSold > 10
  ) return "⚠️ Pattern match: Classic pump & dump setup. Dev is already selling into early buyers.";

  // Pattern 2: Fresh wallet serial rugger
  if (
    deployerHistory?.totalLaunched > 3 &&
    deployerHistory?.rugRate > 50
  ) return "⚠️ Pattern match: Serial rugger. This dev has done this before — multiple times.";

  // Pattern 3: Honeypot setup
  if (
    mintAuthority?.renounced === false &&
    freezeAuthority?.renounced === false &&
    holderConcentration?.topTenPercent > 70
  ) return "⚠️ Pattern match: Honeypot setup. Active mint + freeze + concentrated supply = trap.";

  // Pattern 4: Ghost token
  if (
    liquidity?.usd < 5000 &&
    holderConcentration?.topTenPercent > 80
  ) return "⚠️ Pattern match: Ghost token. Barely any liquidity and almost no real holders.";

  // Pattern 5: Stealth launch
  if (
    tokenAge?.scoreImpact === -30 &&
    deployerHistory?.totalLaunched > 5
  ) return "⚠️ Pattern match: Stealth launch by experienced deployer. Move fast, rug faster.";

  // No pattern matched
  return null;
};
