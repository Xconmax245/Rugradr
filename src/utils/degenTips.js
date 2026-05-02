const tips = [
  "💡 Tip: If the dev wallet is selling before you've even found the token, that's your sign.",
  "💡 Tip: Low liquidity = you might not be able to sell when you want to. Always check.",
  "💡 Tip: A token under 1 hour old has zero track record. That's not early, that's gambling.",
  "💡 Tip: Mutable metadata means the dev can change the token name and logo after you buy.",
  "💡 Tip: High holder concentration = one person can crash the price whenever they feel like it.",
  "💡 Tip: If mint authority isn't renounced, the dev can print more tokens and dilute yours.",
  "💡 Tip: A wallet that's only 3 days old launching tokens is a huge red flag. Experienced devs have history.",
  "💡 Tip: Graduated to DEX = survived the pump.fun bonding curve. Still risky, but less than bonding curve.",
  "💡 Tip: Volume under $1K means almost nobody is trading this. Thin markets move fast both ways.",
  "💡 Tip: Always check if the dev has rugged before. Lightning usually strikes twice.",
  "💡 Tip: A honeypot lets you buy but not sell. You'll watch your money disappear in real time.",
  "💡 Tip: Market cap under $10K = micro-micro cap. Can 100x. Can also go to zero in 4 minutes.",
  "💡 Tip: The loudest Telegram group isn't always the safest token. Noise ≠ legitimacy.",
  "💡 Tip: If you can't find who made this token, that's intentional.",
  "💡 Tip: Taking profit is not paper hands. It's how you stay in the game.",
  "💡 Tip: Never put in more than you can watch go to zero without crying.",
];

module.exports = () => tips[Math.floor(Math.random() * tips.length)];
