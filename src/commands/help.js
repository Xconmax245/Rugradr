module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    try {
      const message = `🛟 <b>RugRadar Help</b>
━━━━━━━━━━━━━━━━━━━━

<b>How to use:</b>
Just paste any Solana contract address.
No slash commands needed.

<b>What you get back:</b>
🎯 A risk score from 0–100
🔬 6 security checks explained in plain English
🍯 Honeypot detection — can you actually sell?
👨💻 Deployer history — has this dev rugged before?
📊 Live market data — price, liquidity, volume
💭 Plain English verdict from your rug-aware friend
🧭 What you should actually do next

<b>Commands:</b>
/guide — Learn what each check means
/help — This message
/start — Back to the beginning

━━━━━━━━━━━━━━━━━━━━
⚠️ RugRadar is a research tool. Not financial advice. Always DYOR.`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /help command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
