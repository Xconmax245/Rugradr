module.exports = (bot) => {
  bot.command('help', async (ctx) => {
    try {
      const message = `📖 <b>How RugRadar Works</b>

Send a Solana token contract address using:
/check [contract address]

<b>Risk Score (0–100):</b>
🟢 75–100 → Low Risk
🟡 50–74 → Moderate Risk
🔴 25–49 → High Risk
☠️ 0–24 → Extremely High Risk

<b>What each check means:</b>

🔑 <b>Mint Authority</b>
If active, the dev can mint unlimited tokens and dump on you.

🧊 <b>Freeze Authority</b>
If active, the dev can freeze your wallet and stop you from selling.

👥 <b>Holder Concentration</b>
If the top 10 wallets hold most of the supply, one sell can crash the price.

💧 <b>Liquidity</b>
Low liquidity means you may not be able to sell when you want to.

👨💻 <b>Dev Wallet</b>
If the deployer is already selling, that's a major red flag.

📅 <b>Token Age</b>
Very new tokens have no track record and are highest risk.

⚠️ <i>RugRadar is a tool to assist your research, not replace it.</i>`;

      await ctx.replyWithHTML(message);
    } catch (err) {
      console.error('Error in /help command:', err);
      await ctx.reply('⚠️ Something went wrong. Please try again.');
    }
  });
};
