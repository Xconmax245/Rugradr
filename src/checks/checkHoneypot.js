const axios = require('axios');

/**
 * Checks if a token is a honeypot using the RugCheck API.
 * @param {string} address - The token mint address.
 * @returns {Promise<Object>} Honeypot report.
 */
module.exports = async (address) => {
  console.log('[checkHoneypot] Running for address:', address);
  
  const fallback = { 
    isHoneypot: false, 
    canSell: true, 
    rugcheckScore: null, 
    topRisks: 'Unable to check', 
    scoreImpact: 0 
  };

  try {
    const response = await axios.get(
      `https://api.rugcheck.xyz/v1/tokens/${address}/report`,
      { timeout: 10000 }
    );

    const data = response.data;
    if (!data || !data.risks) return fallback;

    const risks = data.risks || [];
    const riskNames = risks.map(r => r.name);
    
    // Check if any risk contains "Honeypot"
    const isHoneypot = risks.some(r => r.name.toLowerCase().includes('honeypot') || r.level === 'danger');
    const canSell = !isHoneypot;
    
    const rugcheckScore = data.score || 0;
    const topRisks = riskNames.slice(0, 3).join(', ') || 'None detected';

    // Scoring logic
    let scoreImpact = 0;
    if (isHoneypot) {
      scoreImpact = -50;
    } else if (rugcheckScore > 5000) {
      scoreImpact = -20;
    } else if (rugcheckScore > 1000) {
      scoreImpact = -10;
    }

    return {
      isHoneypot,
      canSell,
      rugcheckScore,
      topRisks,
      scoreImpact
    };

  } catch (err) {
    console.error('[checkHoneypot] Error:', err.message);
    return fallback;
  }
};
