module.exports = (bot) => {
  bot.command('guide', async (ctx) => {
    try {
      const message = `📖 What does RugRadar actually check?
──────────────────

🔑 <b>Mint Authority</b>
Can the developer print more tokens out of thin air?
✅ <b>Renounced</b> = they gave up this power. Safer.
❌ <b>Active</b> = they can flood the supply and crash the price.

──────────────────

🧊 <b>Freeze Authority</b>
Can the developer freeze your wallet so you can't sell?
✅ <b>Renounced</b> = they can't trap you. Safer.
❌ <b>Active</b> = they could lock your tokens.

──────────────────

👥 <b>Holder Concentration</b>
How many people actually own this token?
✅ <b>Spread out</b> = healthier. Less chance of one person dumping.
❌ <b>Top 10 wallets hold most of it</b> = one sell can crash everything.

──────────────────

💧 <b>Liquidity</b>
Can you actually sell this token if you want to?
✅ <b>High liquidity</b> = easy to buy and sell.
❌ <b>Low liquidity</b> = you might get stuck holding a bag.

──────────────────

👨💻 <b>Dev Wallet</b>
Is the person who created the token already selling?
✅ <b>Still holding</b> = good sign they believe in it.
❌ <b>Already sold a lot</b> = classic rug pull behavior.

──────────────────

📅 <b>Token Age</b>
How long has this token existed?
✅ <b>Older</b> = more track record.
❌ <b>Under 1 hour old</b> = extremely high risk, almost no history.

──────────────────
💡 Tip: No single check tells the whole story. Look at the full picture.`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /guide command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
