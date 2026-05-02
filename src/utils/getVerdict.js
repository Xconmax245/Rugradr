/**
 * Returns a personality-driven verdict based on the risk score and result data.
 * @param {number} score - Risk score 0-100.
 * @param {Object} result - Full token analysis result.
 * @returns {string} Verdict string.
 */
module.exports = (score, result) => {
  const { honeypot } = result;

  if (honeypot?.isHoneypot) {
    return "☠️ Bro. Stop. This is a honeypot. You can buy it but you CANNOT sell it. Walk away right now.";
  }

  if (score >= 75) {
    const verdicts = [
      "✅ Looks cleaner than most. I've seen way worse. Still — don't bet the rent money.",
      "✅ This one actually passes most checks. Rare. Don't get too comfortable though.",
      "✅ Surprisingly solid. Do your own research but this isn't screaming rug to me.",
      "✅ Green flags across the board. Still crypto though — anything can happen.",
    ];
    return verdicts[Math.floor(Math.random() * verdicts.length)];
  }

  if (score >= 50) {
    const verdicts = [
      "⚠️ Mixed signals. Some things check out, some don't. If you're going in, go small.",
      "⚠️ It's not a clear rug but it's not clean either. Treat it like a gamble, not an investment.",
      "⚠️ Yellow flags everywhere. Could moon, could rug. Classic degen territory.",
      "⚠️ I wouldn't put my savings in this. A small spec play? Maybe. Eyes open.",
    ];
    return verdicts[Math.floor(Math.random() * verdicts.length)];
  }

  if (score >= 25) {
    const verdicts = [
      "🚨 Multiple red flags. This has rug written all over it. Proceed only if you enjoy pain.",
      "🚨 I've been rugged by tokens exactly like this. Just saying.",
      "🚨 The signs are not good. High risk, questionable dev, thin liquidity. Be very careful.",
      "🚨 This is the kind of token people post about losing money on. Don't be that post.",
    ];
    return verdicts[Math.floor(Math.random() * verdicts.length)];
  }

  // score < 25
  const verdicts = [
    "☠️ Everything about this screams rug. Mint active, dev selling, no liquidity. This is a trap.",
    "☠️ I genuinely cannot find a reason to touch this. Nearly every check failed.",
    "☠️ This is not a token. This is a goodbye letter to your money.",
    "☠️ If you buy this after seeing this report, that's on you. I tried.",
  ];
  return verdicts[Math.floor(Math.random() * verdicts.length)];
};
