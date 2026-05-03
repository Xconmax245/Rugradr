require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const startCommand = require('./src/commands/start');
const helpCommand = require('./src/commands/help');
const checkCommand = require('./src/commands/check');
const guideCommand = require('./src/commands/guide');
const { analyzeFull } = require('./src/services/analyzeToken');
const formatReport = require('./src/utils/formatReport');
const { COOLDOWN_MS } = require('./src/config/constants');

// Cooldown tracker
const cooldowns = new Map();

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Verify required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'HELIUS_API_KEY'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

async function startBot() {
  console.log('Initializing RugRadar bot...');
  
  try {
    // Pre-launch check: Verify token via direct HTTP call
    console.log('Testing Telegram API connectivity...');
    const testUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`;
    const response = await axios.get(testUrl, { timeout: 5000 });
    
    if (response.data.ok) {
      console.log(`✅ Token valid! Bot name: @${response.data.result.username}`);
    } else {
      console.error('❌ Telegram API returned error:', response.data);
      return;
    }

    const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

    // Middleware
    bot.use((ctx, next) => {
      const username = ctx.from?.username || 'unknown';
      console.log(`[${new Date().toISOString()}] Msg from @${username}`);
      return next();
    });

    // Register commands
    startCommand(bot);
    helpCommand(bot);
    checkCommand(bot, cooldowns);
    guideCommand(bot);

    // Simple ping for diagnostics
    bot.command('ping', (ctx) => {
      console.log(`[DIAGNOSTIC] Ping received from @${ctx.from.username || 'unknown'}`);
      ctx.reply('pong! 🏓 Bot is alive.');
    });

    // Rotating loading messages
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

    // Direct CA Paste handler
    bot.on('text', async (ctx) => {
      const text = ctx.message.text.trim();
      console.log(`[INCOMING] Text received: "${text}" from @${ctx.from.username || 'unknown'}`);
      
      // Ignore messages that start with /
      if (text.startsWith('/')) return;

      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!solanaRegex.test(text)) {
        return await ctx.replyWithHTML(
          `🤔 That doesn't look like a Solana contract address.\n\n` +
          `Just paste a contract address directly — no commands needed.\n\n` +
          `Example:\n<code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>`
        );
      }

      // Valid CA — run the analysis
      const userId = ctx.from.id;
      const now = Date.now();
      const lastUsed = cooldowns.get(userId) || 0;

      if (now - lastUsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
        return await ctx.reply(`⏳ Please wait ${remaining}s before scanning another token.`);
      }

      cooldowns.set(userId, now);

      const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      await ctx.replyWithHTML(randomLoading);

      try {
        const result = await analyzeFull(text);
        const report = formatReport(result, text);
        await ctx.replyWithHTML(report);
      } catch (err) {
        console.error('Error in text handler:', err);
        await ctx.replyWithHTML(
          `😕 Something went wrong while scanning that token.\n\n` +
          `This can happen if:\n` +
          `• The token is brand new and has no data yet\n` +
          `• The contract address is incorrect\n` +
          `• Our data provider is temporarily slow\n\n` +
          `Please try again in a moment.`
        );
      }
    });

    bot.catch((err) => console.error('RugRadar Bot Error:', err));

    console.log('RugRadar bot is live 🚀');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Starting polling...');
    
    await bot.launch();
  } catch (err) {
    if (err.response?.error_code === 409) {
      console.error('⚠️ [CONFLICT] Another instance of the bot is already running.');
      console.error('👉 If you are running locally, stop that process before deploying.');
      console.error('👉 If you just deployed, wait 30s for the old instance to die.');
      process.exit(1); // Exit so Railway knows it failed and can restart
    } else {
      console.error('❌ Startup Error:', err.message);
      if (err.response?.status === 401) {
        console.error('👉 Tip: Your token is invalid. Double-check for extra characters.');
      } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        console.error('👉 Tip: Connection timed out. Check your internet or firewall.');
      }
      process.exit(1);
    }
  }
}

startBot();

// Enable graceful stop
process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
