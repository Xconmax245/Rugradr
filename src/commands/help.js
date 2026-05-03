module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    try {
      const message = `🛟 <b>RugRadar Help</b>
━━━━━━━━━━━━━━━━━━━━

<b>How to scan a token:</b>

Option 1 — Paste the CA:
<code>EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>

Option 2 — Type the ticker:
<code>SOL</code>
<code>BONK</code>
<code>WIF</code>

Option 3 — Type the name:
<code>dogwifhat</code>
<code>popcat</code>

If multiple tokens match your search,
I'll show you a list to pick from.

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
