module.exports = (result, contractAddress) => {
  const getIcon = (impact) => {
    if (impact === 0) return '✅';
    if (impact > -20) return '⚠️';
    return '❌';
  };

  const formatImpact = (impact) => {
    return impact < 0 ? ` <i>(${impact}pts)</i>` : '';
  };

  const mintIcon = getIcon(result.mintAuthority.scoreImpact);
  const freezeIcon = getIcon(result.freezeAuthority.scoreImpact);
  const holderIcon = getIcon(result.holderConcentration.scoreImpact);
  const liquidityIcon = getIcon(result.liquidity.scoreImpact);
  const devIcon = getIcon(result.devWallet.scoreImpact);
  const ageIcon = getIcon(result.tokenAge.scoreImpact);

  return `🔍 <b>RUGCHECK REPORT</b>
━━━━━━━━━━━━━━━━━━
🪙 <b>Token:</b> ${result.name} (${result.symbol})
📅 <b>Age:</b> ${result.age}
📊 <b>Risk Score:</b> ${result.score}/100
${result.riskEmoji} <b>${result.riskLabel}</b>
━━━━━━━━━━━━━━━━━━
<b>CHECKS:</b>

🔑 Mint Authority: ${mintIcon} ${result.mintAuthority.renounced ? 'Renounced' : 'Active'}${formatImpact(result.mintAuthority.scoreImpact)}
🧊 Freeze Authority: ${freezeIcon} ${result.freezeAuthority.renounced ? 'Renounced' : 'Active'}${formatImpact(result.freezeAuthority.scoreImpact)}
👥 Holder Concentration: ${holderIcon} Top 10 hold ${result.holderConcentration.topTenPercent}%${formatImpact(result.holderConcentration.scoreImpact)}
💧 Liquidity: ${liquidityIcon} ${result.liquidity.usdLabel || '$' + Math.round(result.liquidity.usd).toLocaleString()}${formatImpact(result.liquidity.scoreImpact)}
👨💻 Dev Wallet: ${devIcon} Sold ${result.devWallet.percentSold}% of holdings${formatImpact(result.devWallet.scoreImpact)}
📅 Token Age: ${ageIcon} ${result.tokenAge.age} old${formatImpact(result.tokenAge.scoreImpact)}
━━━━━━━━━━━━━━━━━━
🔗 <code>${contractAddress}</code>

⚠️ <i>Not financial advice. Always DYOR.</i>`;
};
