require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const startCommand = require('./src/commands/start');
const helpCommand = require('./src/commands/help');
const checkCommand = require('./src/commands/check');
const guideCommand = require('./src/commands/guide');
const resolveToken = require('./src/services/resolveToken')
const sessionState = require('./src/services/sessionState')
const formatTokenPicker = require('./src/utils/formatTokenPicker')
const analyzeToken = require('./src/services/analyzeToken')
const formatReport = require('./src/utils/formatReport')
const { COOLDOWN_MS } = require('./src/config/constants')

// Cooldown tracker
const cooldowns = new Map()

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


    const runScan = async (ctx, address) => {
      const userId = ctx.from.id
      const now = Date.now()
      const lastUsed = cooldowns.get(userId) || 0

      if (now - lastUsed < COOLDOWN_MS) {
        const remaining = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000)
        return await ctx.reply(`⏳ Please wait ${remaining}s before scanning another token.`)
      }
      cooldowns.set(userId, now)

      const loadingMessages = [
        "🕵️ Sniffing the blockchain...",
        "🔬 Putting this token under the microscope...",
        "🚨 Checking if this dev is cooked...",
        "🧪 Running tests on this sketchy little token...",
        "👀 Looking for red flags...",
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
      ]
      const randomMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
      await ctx.replyWithHTML(randomMsg)

      try {
        const result = await analyzeToken(address)
        const report = formatReport(result, address)
        await ctx.replyWithHTML(report, { disable_web_page_preview: true })
      } catch (err) {
        console.error('[runScan] Error:', err.message)
        await ctx.replyWithHTML(
          `😕 Something went wrong while scanning.\n\n` +
          `• Token may be too new to have data\n` +
          `• Contract address may be incorrect\n` +
          `• Data provider may be temporarily slow\n\n` +
          `Please try again in a moment.`
        )
      }
    }

    bot.on('text', async (ctx) => {
      const text = ctx.message.text.trim()

      // Ignore slash commands
      if (text.startsWith('/')) return

      const userId = ctx.from.id
      const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

      // Check if user is replying to a token picker (typing 1, 2, 3...)
      const pendingTokens = sessionState.getPending(userId)
      if (pendingTokens && /^[1-5]$/.test(text)) {
        const index = parseInt(text) - 1
        if (index < pendingTokens.length) {
          sessionState.clearPending(userId)
          const chosen = pendingTokens[index]
          await ctx.replyWithHTML(
            `✅ Got it — scanning <b>${chosen.name}</b> (<code>$${chosen.symbol}</code>)\n` +
            `<code>${chosen.address}</code>`
          )
          return await runScan(ctx, chosen.address)
        }
      }

      // Direct CA input
      if (solanaRegex.test(text)) {
        sessionState.clearPending(userId)
        return await runScan(ctx, text)
      }

      // Token name/ticker input — try to resolve
      // Ignore very short random inputs and sentences
      if (text.length < 2 || text.length > 30 || (text.includes(' ') && text.split(' ').length > 3)) {
        return await ctx.replyWithHTML(
          `🤔 I didn't quite get that.\n\n` +
          `You can send me:\n` +
          `• A Solana contract address (long string)\n` +
          `• A token ticker like <code>SOL</code> or <code>BONK</code>\n` +
          `• A token name like <code>dogwifhat</code>`
        )
      }

      // Show resolving message
      await ctx.replyWithHTML(`🔍 Looking up <b>${text}</b>...`)

      const resolution = await resolveToken(text)

      if (resolution.type === 'notfound') {
        return await ctx.replyWithHTML(
          `😕 Couldn't find a token called "<b>${text}</b>" on Solana.\n\n` +
          `Try:\n` +
          `• The exact ticker symbol (e.g. <code>BONK</code>)\n` +
          `• Pasting the contract address directly`
        )
      }

      if (resolution.type === 'error') {
        return await ctx.replyWithHTML(
          `⚠️ Something went wrong looking up that token.\n` +
          `Try pasting the contract address directly instead.`
        )
      }

      if (resolution.type === 'single') {
        const token = resolution.token
        await ctx.replyWithHTML(
          `✅ Found <b>${token.name}</b> (<code>$${token.symbol}</code>)\n` +
          `Scanning now...`
        )
        return await runScan(ctx, token.address)
      }

      if (resolution.type === 'multiple') {
        // Store pending selection for this user
        sessionState.setPending(userId, resolution.tokens)
        const picker = formatTokenPicker(resolution.tokens, text)
        return await ctx.replyWithHTML(picker)
      }
    })

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
