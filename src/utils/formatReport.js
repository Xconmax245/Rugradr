const { formatPrice, formatLargeNumber, formatChange } = require('./formatNumber');
const getVerdict = require('./getVerdict');
const getActionAdvice = require('./getActionAdvice');
const detectPattern = require('./detectPattern');
const getDegenTip = require('./degenTips');

module.exports = (result, contractAddress) => {
  console.log('[formatReport] marketData received:', JSON.stringify(result.marketData));

  const marketData = result.marketData || {
    priceUsd: null, marketCap: null, fdv: null,
    volume1h: null, volume24h: null, liquidityUsd: null,
    priceChange1h: null, priceChange24h: null,
    bondingStatus: '❓ Unknown',
    links: {
      dexscreener: `https://dexscreener.com/solana/${contractAddress}`,
      pumpfun: `https://pump.fun/${contractAddress}`,
      solscan: `https://solscan.io/token/${contractAddress}`
    }
  };

  const deployerHistory = result.deployerHistory || { totalLaunched: 0, totalRugged: 0, rugRate: 0, walletAge: 'Unknown', scoreImpact: 0 };

  const truncated = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-6)}`;

  // TL;DR line
  const tldr =
    result.score >= 75 ? `🟢 TL;DR — Looks relatively safe. Still do your research.` :
    result.score >= 50 ? `🟡 TL;DR — Mixed signals. Proceed with caution.` :
    result.score >= 25 ? `🔴 TL;DR — High risk. Multiple red flags detected.` :
                         `☠️ TL;DR — Extremely dangerous. Classic rug pull signals.`;

  // Danger meter
  const filled = Math.round(result.score / 10);
  const empty = 10 - filled;
  const meter = '█'.repeat(filled) + '░'.repeat(empty);
  const safetyLabel = result.score >= 75 ? 'Safe' : result.score >= 50 ? 'Caution' : result.score >= 25 ? 'Risky' : 'Danger';

  // Wallet age context
  const walletAgeWarn = deployerHistory?.walletAge && deployerHistory.walletAge !== 'Unknown'
    ? `\n   🕐 Deployer wallet age: ${deployerHistory.walletAge}`
    : '';

  // Pattern warning
  const pattern = detectPattern(result);

  // Verdict and advice
  const verdict = getVerdict(result.score, result);
  const advice = getActionAdvice(result.score, result);
  const tip = getDegenTip();

  // Check icons
  const icon = (impact) => impact === 0 ? '✅' : impact > -20 ? '⚠️' : '❌';

  return `━━━━━━━━━━━━━━━━━━━━
🔍 <b>RUG RADAR REPORT</b>
━━━━━━━━━━━━━━━━━━━━

${tldr}

🪙 <b>${result.name}</b> (<code>$${result.symbol}</code>)
📅 Age: ${result.age} · ${marketData.bondingStatus || '❓ Unknown'}

─── 📊 MARKET DATA ────────
💰 Price       ${formatPrice(marketData.priceUsd)}
🏦 Mkt Cap     ${formatLargeNumber(marketData.marketCap)}
💎 FDV         ${formatLargeNumber(marketData.fdv)}
💧 Liquidity   ${formatLargeNumber(marketData.liquidityUsd)}
📈 1H Change   ${formatChange(marketData.priceChange1h)}
📉 24H Vol     ${formatLargeNumber(marketData.volume24h)}

─── 🎯 RISK SCORE ─────────
${meter}
<b>${result.riskEmoji} ${result.score}/100 — ${safetyLabel}</b>

─── 🔬 WHAT WE FOUND ──────

${icon(result.mintAuthority.scoreImpact)} <b>Mint Authority</b>
   ${result.mintAuthority.renounced
     ? 'Dev gave up the ability to print more tokens ✅'
     : 'Dev can still create unlimited new tokens — diluting yours ⚠️'}

${icon(result.freezeAuthority.scoreImpact)} <b>Freeze Authority</b>
   ${result.freezeAuthority.renounced
     ? "Dev can't freeze your wallet ✅"
     : 'Dev can freeze your wallet and block you from selling ⚠️'}

${icon(result.holderConcentration.scoreImpact)} <b>Holder Concentration</b>
   Top 10 wallets own <b>${result.holderConcentration.topTenPercent}%</b> of supply
   ${result.holderConcentration.topTenPercent > 60
     ? 'That is highly concentrated — one sell dumps the price'
     : result.holderConcentration.topTenPercent > 30
     ? 'Moderately spread — watch for large wallet moves'
     : 'Well distributed — good sign'}

${icon(result.liquidity.scoreImpact)} <b>Liquidity</b>
   ${result.liquidity.usdLabel || formatLargeNumber(result.liquidity.usd)} in pools
   ${result.liquidity.usd < 10000
     ? 'Very low — you may struggle to exit when you want to'
     : result.liquidity.usd < 50000
     ? 'Thin — price can move wildly on small trades'
     : 'Decent — enough to enter and exit without too much slippage'}

${icon(result.devWallet.scoreImpact)} <b>Dev Wallet</b>
   ${result.isEstablished
     ? 'Established token — original deployer no longer tracked'
     : `Sold approx. <b>${result.devWallet.percentSold}%</b> of their tokens`}
   ${!result.isEstablished && result.devWallet.percentSold > 20
     ? 'Dev is already cashing out. That is not a good sign.'
     : !result.isEstablished && result.devWallet.percentSold > 0
     ? 'Some selling detected — keep an eye on this wallet'
     : ''}

${icon(result.tokenAge.scoreImpact)} <b>Token Age</b>
   ${result.age}
   ${result.tokenAge.scoreImpact === -30
     ? 'Under 1 hour old — no track record, maximum risk'
     : result.tokenAge.scoreImpact === -15
     ? 'Less than 24 hours old — very early, high risk'
     : result.tokenAge.scoreImpact === -5
     ? 'Less than 7 days old — still early stage'
     : 'Has some history — lower age-related risk'}

─── 🍯 HONEYPOT CHECK ─────

${result.honeypot?.isHoneypot
  ? '☠️ <b>WARNING: Honeypot detected</b>\n   You can BUY but you CANNOT SELL. This is a trap.'
  : result.honeypot?.canSell
  ? '✅ <b>You can sell this token</b>\n   No honeypot detected. Exit appears possible.'
  : '⚠️ <b>Could not verify</b>\n   Honeypot status unclear. Treat with extra caution.'}${result.honeypot?.topRisks && result.honeypot.topRisks !== 'Unable to check'
  ? `\n\n   🚩 Flags: ${result.honeypot.topRisks}`
  : ''}

─── 👨💻 DEPLOYER HISTORY ───

${deployerHistory.totalLaunched > 0
  ? `This dev has launched <b>${deployerHistory.totalLaunched}</b> tokens\n   Estimated rugged: <b>${deployerHistory.totalRugged} (${deployerHistory.rugRate}%)</b>${walletAgeWarn}`
  : `No previous token launches found for this deployer${walletAgeWarn}`}
${deployerHistory.rugRate > 70
  ? '\n   🚨 This dev has a serious history of rugging people.'
  : deployerHistory.rugRate > 40
  ? '\n   ⚠️ Some previous tokens from this dev ended badly.'
  : '\n   ✅ No major red flags in deploy history.'}
${pattern ? `\n─── 🔎 PATTERN DETECTED ───\n\n${pattern}\n` : ''}
━━━━━━━━━━━━━━━━━━━━
${verdict}

─── 💭 WHAT SHOULD I DO? ──

${advice}

─── 🔗 LINKS ───────────────
<a href="${marketData.links?.dexscreener}">📡 DexScreener</a> · <a href="${marketData.links?.pumpfun}">🌊 pump.fun</a> · <a href="${marketData.links?.solscan}">🔍 Solscan</a>

━━━━━━━━━━━━━━━━━━━━
${tip}

👥 Think a friend is about to ape into this? Forward them this report.

<code>${truncated}</code> · ⚠️ Not financial advice · DYOR`;
};
