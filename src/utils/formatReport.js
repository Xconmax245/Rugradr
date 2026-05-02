const { formatPrice, formatLargeNumber, formatChange } = require('./formatNumber');

module.exports = (result, contractAddress) => {
  const { marketData } = result;

  const getIcon = (impact) => {
    if (impact === 0) return '✅';
    if (impact > -20) return '⚠️';
    return '❌';
  };

  const mintIcon = getIcon(result.mintAuthority.scoreImpact);
  const freezeIcon = getIcon(result.freezeAuthority.scoreImpact);
  const holderIcon = getIcon(result.holderConcentration.scoreImpact);
  const liquidityIcon = getIcon(result.liquidity.scoreImpact);
  const devIcon = getIcon(result.devWallet.scoreImpact);
  const ageIcon = getIcon(result.tokenAge.scoreImpact);

  const mintStatus = result.mintAuthority.renounced 
    ? 'Dev cannot create more tokens ✅' 
    : 'Dev CAN still mint new tokens ⚠️';
  
  const freezeStatus = result.freezeAuthority.renounced 
    ? 'Dev cannot freeze your wallet ✅' 
    : 'Dev CAN freeze your wallet ⚠️';

  let verdict = '';
  if (result.score >= 75) verdict = '✅ Looks relatively safe — but always verify yourself.';
  else if (result.score >= 50) verdict = '⚠️ Proceed with caution — some yellow flags here.';
  else if (result.score >= 25) verdict = '🚨 High risk detected — multiple red flags present.';
  else verdict = '☠️ EXTREMELY RISKY — this has serious rug pull signs. Be very careful.';

  const truncatedAddress = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}`;

  return `╔══════════════════╗
     🔍 RUG RADAR REPORT
╚══════════════════╝

🪙 <b>${result.name}</b> ($${result.symbol})
📅 Age: ${result.age}

─── MARKET DATA ────────

💰 Price:     ${formatPrice(marketData.priceUsd)}
📊 Mkt Cap:   ${formatLargeNumber(marketData.marketCap)}
💎 FDV:       ${formatLargeNumber(marketData.fdv)}
💧 Liquidity: ${formatLargeNumber(marketData.liquidityUsd)}
📈 1H Change: ${formatChange(marketData.priceChange1h)}
📉 24H Vol:   ${formatLargeNumber(marketData.volume24h)}

🔗 Status: ${marketData.bondingStatus}

┌─ RISK SCORE ──────────┐
│                        │
│      ${result.riskEmoji} <b>${result.score}/100</b>       │
│      <b>${result.riskLabel}</b>      │
│                        │
└────────────────────────┘

─── WHAT I FOUND ───────

${mintIcon} <b>Mint Authority</b>
   ${mintStatus}

${freezeIcon} <b>Freeze Authority</b>
   ${freezeStatus}

${holderIcon} <b>Top Holders</b>
   Top 10 wallets own ${result.holderConcentration.topTenPercent}% of supply

${liquidityIcon} <b>Liquidity</b>
   ${result.liquidity.usdLabel || '~$' + Math.round(result.liquidity.usd).toLocaleString() + ' estimated'} in pools

${devIcon} <b>Dev Wallet</b>
   ${result.isEstablished ? 'Bypassed (Established Token)' : `Sold approx. ${result.devWallet.percentSold}% of their tokens`}

${ageIcon} <b>Token Age</b>
   This token is ${result.tokenAge.age}${result.isEstablished ? '' : ' old'}

─── LINKS ──────────────

<a href="${marketData.links.dexscreener}">📡 DexScreener</a> • <a href="${marketData.links.pumpfun}">🌊 pump.fun</a> • <a href="${marketData.links.solscan}">🔍 Solscan</a>

────────────────────────
${verdict}

🔗 <code>${truncatedAddress}</code>
⚠️ Not financial advice. DYOR.`;
};
