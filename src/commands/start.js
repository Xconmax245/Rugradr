module.exports = (bot) => {
  bot.command('start', async (ctx) => {
    try {
      const message = `👋 Yo. Welcome to RugRadar.

I'm your personal rug pull detector for Solana tokens.
Think of me as that friend who actually reads the contract before aping in.

━━━━━━━━━━━━━━━━━━━━
Just paste any contract address and I'll tell you:
✅ Is this safe to buy?
🍯 Is it a honeypot (can you even sell)?
👨💻 Has this dev rugged before?
📊 What do the numbers actually look like?
━━━━━━━━━━━━━━━━━━━━

You can send me:
• A contract address (CA) — paste it directly
• A ticker symbol — like SOL, BONK, WIF
• A token name — like "dogwifhat" or "popcat"

No commands needed. Just type or paste.

New here? Type /guide — I'll explain everything in plain English.`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /start command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
