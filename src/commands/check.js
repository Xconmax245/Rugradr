const analyzeToken = require('../services/analyzeToken');
const formatReport = require('../utils/formatReport');
const { COOLDOWN_MS } = require('../config/constants');

const cooldowns = new Map();

module.exports = (bot) => {
  bot.command('check', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const lastUsed = cooldowns.get(userId) || 0;
      const now = Date.now();
      
      if (now - lastUsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
        return await ctx.reply(`⏳ Please wait ${remaining}s before checking another token.`);
      }
      
      cooldowns.set(userId, now);

      const args = ctx.message.text.split(' ');
      const address = args[1];
      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

      if (!address) {
        return await ctx.replyWithHTML(`👇 To scan a token, send me its contract address like this:

<code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>

You can find contract addresses on Dexscreener, pump.fun, or in the token's Telegram group.`);
      }

      if (!solanaRegex.test(address)) {
        return await ctx.replyWithHTML(`❌ That doesn't look like a valid Solana contract address.

A Solana address looks like this:
<code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>

Make sure you're copying the contract address — not the token name or ticker symbol.`);
      }

      await ctx.replyWithHTML(`🔍 Scanning token...
⏳ Pulling market data + running 6 security checks.
Takes about 5–10 seconds.`);

      const result = await analyzeToken(address);
      const report = formatReport(result, address);

      await ctx.replyWithHTML(report);
    } catch (err) {
      console.error('Error in /check command:', err);
      await ctx.replyWithHTML(`😕 Something went wrong while scanning that token.

This can happen if:
• The token is brand new and has no data yet
• The contract address is incorrect
• Our data provider is temporarily slow

Please try again in a moment.`);
    }
  });
};
