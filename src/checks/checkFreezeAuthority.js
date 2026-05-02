module.exports = (freezeAuthority) => {
  console.log('[checkFreezeAuthority] Evaluating status:', freezeAuthority);
  const renounced = freezeAuthority === null;
  return {
    renounced,
    scoreImpact: renounced ? 0 : -20
  };
};
