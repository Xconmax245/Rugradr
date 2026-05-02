module.exports = (mintAuthority) => {
  console.log('[checkMintAuthority] Evaluating status:', mintAuthority);
  const renounced = mintAuthority === null;
  return {
    renounced,
    scoreImpact: renounced ? 0 : -25
  };
};
