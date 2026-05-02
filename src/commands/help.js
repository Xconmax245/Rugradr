module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    try {
      const message = `🛟 RugRadar Help
──────────────────
📋 Commands:

/check [address] — Scan a token for rug pull risk
/guide — Learn what each check means
/start — Back to the beginning

──────────────────
💡 How to get a contract address:

1. Find the token on pump.fun, Dexscreener, or Telegram
2. Copy the long string of letters and numbers (the contract address)
3. Paste it after /check

Example:
<code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>

──────────────────
⚠️ RugRadar is a tool to help you research — not a guarantee. Always do your own research.`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /help command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
