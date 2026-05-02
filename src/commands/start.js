module.exports = (bot) => {
  bot.command('start', async (ctx) => {
    try {
      const message = `👋 Hey! Welcome to RugRadar.

I scan Solana tokens and tell you how risky they are — before you buy.

Just send me a token's contract address and I'll check it for signs of a rug pull in seconds.

──────────────────
🟢 Safe-looking token? Go ahead.
🔴 Sketchy token? I'll warn you.
☠️ Obvious rug? I'll scream it.
──────────────────

To analyze a token, use:
👉 /check [paste contract address here]

New to this? Type /guide to learn what all the checks mean.
Need help? Type /help`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /start command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
