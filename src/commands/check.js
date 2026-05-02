const { analyzeFull } = require('../services/analyzeToken');
const formatReport = require('../utils/formatReport');
const { COOLDOWN_MS } = require('../config/constants');

const loadingMessages = [
  "🕵️ Sniffing the blockchain...",
  "🔬 Putting this token under the microscope...",
  "🚨 Checking if this dev is cooked...",
  "🧪 Running tests on this sketchy little token...",
  "👀 Looking for red flags... found some already.",
  "🏃 Chasing the deployer wallet across the chain...",
  "📡 Pinging DexScreener, Helius and the vibes...",
  "🔎 Give me a sec, this smells suspicious...",
  "⛓️ Reading the chain like a book...",
  "🤔 Either this is fine or we're both about to learn a lesson...",
  "🧅 Peeling back the layers on this one...",
  "💀 Checking if this is already dead...",
  "🎰 Let's see what we're working with...",
  "🐀 Rat detection in progress...",
  "🔦 Shining a light on this token...",
];

module.exports = (bot, cooldowns) => {
  bot.command('check', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const lastUsed = cooldowns.get(userId) || 0;
      const now = Date.now();
      
      if (now - lastUsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
        return await ctx.reply(`⏳ Please wait ${remaining}s before checking another token.`);
      }
      
      const args = ctx.message.text.split(' ');
      const address = args[1];
      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

      if (!address) {
        return await ctx.replyWithHTML(`👇 To scan a token, send me its contract address like this:\n\n<code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>\n\nYou can also just paste the address directly!`);
      }

      if (!solanaRegex.test(address)) {
        return await ctx.replyWithHTML(`❌ That doesn't look like a valid Solana contract address.\n\nA Solana address looks like this:\n<code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>`);
      }

      cooldowns.set(userId, now);

      const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      await ctx.replyWithHTML(randomLoading);

      const result = await analyzeFull(address);
      const report = formatReport(result, address);

      await ctx.replyWithHTML(report);
    } catch (err) {
      console.error('Error in /check command:', err);
      await ctx.replyWithHTML(`😕 Something went wrong while scanning that token.`);
    }
  });
};
