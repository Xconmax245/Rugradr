/**
 * Returns practical action advice based on the risk score and result data.
 * @param {number} score - Risk score 0-100.
 * @param {Object} result - Full token analysis result.
 * @returns {string} Action advice string (HTML formatted).
 */
module.exports = (score, result) => {
  const { honeypot } = result;

  if (honeypot?.isHoneypot) return (
    `🚫 <b>Do NOT buy this token.</b>\n` +
    `   It's a honeypot — you will not be able to sell.\n` +
    `   Report it in any groups sharing it.`
  );

  if (score >= 75) return (
    `✅ <b>If you're going in:</b>\n` +
    `   • Start with a small position\n` +
    `   • Set a mental stop-loss before you buy\n` +
    `   • Take some profit if it 2x–3x\n` +
    `   • Check back in 24hrs — things change fast`
  );

  if (score >= 50) return (
    `⚠️ <b>If you still want in:</b>\n` +
    `   • Only use money you're okay losing\n` +
    `   • Keep the position very small\n` +
    `   • Have your exit ready before you enter\n` +
    `   • Don't average down if it drops`
  );

  if (score >= 25) return (
    `🚨 <b>Seriously consider skipping this one.</b>\n` +
    `   • The risk/reward here is not in your favour\n` +
    `   • If you must — treat it as a lottery ticket\n` +
    `   • Never put in more than you can lose entirely\n` +
    `   • Set an alarm to check it in 1 hour`
  );

  return (
    `☠️ <b>Our honest advice: don't touch this.</b>\n` +
    `   • Almost every check failed\n` +
    `   • The pattern matches known rug setups\n` +
    `   • There are better tokens to take risks on\n` +
    `   • If someone sent you this CA — be suspicious of them too`
  );
};
