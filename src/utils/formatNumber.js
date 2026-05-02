/**
 * Format price — handles very small numbers like 0.000001281
 * @param {string|number} price 
 * @returns {string} Formatted price string.
 */
const formatPrice = (price) => {
  if (!price) return 'N/A';
  const num = parseFloat(price);
  if (num < 0.000001) return `$0.0₆${(num * 1e7).toFixed(1)}`;
  if (num < 0.00001) return `$0.0₅${(num * 1e6).toFixed(2)}`; // shows subscript zeros
  if (num < 0.001) return `$${num.toFixed(6)}`;
  if (num < 1) return `$${num.toFixed(4)}`;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

/**
 * Format large numbers — 12800 → $12.8K, 1200000 → $1.2M
 * @param {number} num 
 * @returns {string} Formatted large number string.
 */
const formatLargeNumber = (num) => {
  if (!num) return 'N/A';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

/**
 * Format price change — adds + or - and % symbol with emoji
 * @param {number} change 
 * @returns {string} Formatted change string.
 */
const formatChange = (change) => {
  if (change === null || change === undefined) return 'N/A';
  const num = parseFloat(change);
  if (num > 0) return `📈 +${num.toFixed(1)}%`;
  if (num < 0) return `📉 ${num.toFixed(1)}%`;
  return `➡️ 0%`;
};

module.exports = { formatPrice, formatLargeNumber, formatChange };
