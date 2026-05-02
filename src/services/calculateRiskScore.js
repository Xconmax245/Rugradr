const { SCORE_THRESHOLDS } = require('../config/constants');

module.exports = (impacts) => {
  let finalScore = 100;
  
  impacts.forEach(impact => {
    finalScore += impact;
  });

  // Clamp between 0 and 100
  finalScore = Math.max(0, Math.min(100, finalScore));

  let label, emoji;
  if (finalScore >= SCORE_THRESHOLDS.LOW_RISK) {
    label = "LOW RISK";
    emoji = "🟢";
  } else if (finalScore >= SCORE_THRESHOLDS.MODERATE_RISK) {
    label = "MODERATE RISK";
    emoji = "🟡";
  } else if (finalScore >= SCORE_THRESHOLDS.HIGH_RISK) {
    label = "HIGH RISK";
    emoji = "🔴";
  } else {
    label = "EXTREMELY HIGH RISK";
    emoji = "☠️";
  }

  return {
    score: finalScore,
    riskLabel: label,
    riskEmoji: emoji
  };
};
