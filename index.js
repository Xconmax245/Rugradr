require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const startCommand = require('./src/commands/start');
const helpCommand = require('./src/commands/help');
const checkCommand = require('./src/commands/check');
const guideCommand = require('./src/commands/guide');

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
    checkCommand(bot);
    guideCommand(bot);

    bot.catch((err) => console.error('RugRadar Bot Error:', err));

    console.log('RugRadar bot is live 🚀');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Starting polling...');
    
    await bot.launch();
  } catch (err) {
    console.error('❌ Startup Error:', err.message);
    if (err.response?.status === 401) {
      console.error('👉 Tip: Your token is invalid. Double-check for extra characters.');
    } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
      console.error('👉 Tip: Connection timed out. Check your internet or firewall.');
    }
  }
}

startBot();

// Enable graceful stop
process.once('SIGINT', () => process.exit(0));
process.once('SIGTERM', () => process.exit(0));
