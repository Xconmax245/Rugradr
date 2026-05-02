require('dotenv').config();
const { Telegraf } = require('telegraf');
const startCommand = require('./src/commands/start');
const helpCommand = require('./src/commands/help');
const checkCommand = require('./src/commands/check');

// Verify required environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'HELIUS_API_KEY'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Middleware to log every incoming message
bot.use((ctx, next) => {
  const timestamp = new Date().toISOString();
  const username = ctx.from?.username || 'unknown';
  const text = ctx.message?.text || '[non-text message]';
  console.log(`[${timestamp}] Message from @${username}: ${text}`);
  return next();
});

// Register command handlers
startCommand(bot);
helpCommand(bot);
checkCommand(bot);

// Basic error handler to log errors without crashing
bot.catch((err, ctx) => {
  console.error(`RugRadar encountered an error for ${ctx.updateType}`, err);
});

// Start the bot with polling
bot.launch().then(() => {
  console.log('RugRadar bot is live 🚀');
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Helius API: configured ✅`);
  console.log(`Bot polling: active ✅`);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
