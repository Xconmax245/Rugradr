/**
 * Format price — handles very small numbers with subscript zeros
 * @param {string|number} price 
 * @returns {string} Formatted price string.
 */
const formatPrice = (price) => {
  if (!price) return 'N/A';
  const num = parseFloat(price);
  if (isNaN(num) || num === 0) return 'N/A';

  if (num >= 1) return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (num >= 0.01) return `$${num.toFixed(4)}`;
  if (num >= 0.0001) return `$${num.toFixed(6)}`;

  // Count leading zeros after decimal point
  const str = num.toFixed(12); // Use higher precision for zero counting
  const match = str.match(/^0\.(0+)([1-9]\d*)/);
  if (!match) return `$${num.toFixed(8)}`;

  const zeros = match[1].length;
  const significant = match[2].slice(0, 4);

  // Convert zero count to subscript
  const subscripts = { '1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','0':'₀' };
  const sub = String(zeros).split('').map(d => subscripts[d] || d).join('');

  return `$0.0${sub}${significant}`;
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
