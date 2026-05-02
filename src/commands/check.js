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
        return await ctx.replyWithHTML(`❌ Please provide a token address.\nExample: <code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>`);
      }

      if (!solanaRegex.test(address)) {
        return await ctx.replyWithHTML(`❌ That doesn't look like a valid Solana address.\nMake sure you're copying the contract address, not the token name.`);
      }

      await ctx.replyWithHTML(`🔍 Analyzing contract...\n<code>${address}</code>\nThis may take a few seconds.`);

      const result = await analyzeToken(address);
      const report = formatReport(result, address);

      await ctx.replyWithHTML(report);
    } catch (err) {
      console.error('Error in /check command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
