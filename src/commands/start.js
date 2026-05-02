module.exports = (bot) => {
  bot.command('start', async (ctx) => {
    try {
      const message = `👋 Welcome to RugRadar!

I help you spot potential rug pulls on Solana before you ape in.

Simply send me a Solana token contract address and I'll analyze it instantly.

🔍 <b>What I check:</b>
• Mint authority status
• Freeze authority status
• Holder concentration
• Liquidity depth
• Dev wallet activity
• Token age

<b>Commands:</b>
/check [address] — Analyze a token
/help — How to use RugRadar

<b>Example:</b>
<code>/check EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>

⚠️ <i>Not financial advice. Always DYOR.</i>`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /start command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
