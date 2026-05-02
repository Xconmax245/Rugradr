const axios = require('axios');

module.exports = async (address) => {
  console.log('[getTokenMetadata] Running for address:', address);
  try {
    const response = await axios.post(`https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getAsset",
      params: { id: address }
    }, { timeout: 10000 });

    const result = response.data.result;
    if (!result) {
      throw new Error("Token not found or invalid address");
    }

    // Try multiple paths for freeze authority
    let freezeAuthority = result.token_info?.freeze_authority || null;
    if (!freezeAuthority && result.authorities) {
      const freezeAuth = result.authorities.find(a => a.scopes?.includes('freeze'));
      freezeAuthority = freezeAuth?.address || null;
    }

    return {
      name: result.content?.metadata?.name || "Unknown",
      symbol: result.token_info?.symbol || "???",
      supply: result.token_info?.supply || 0,
      decimals: result.token_info?.decimals || 0,
      mintAuthority: result.mint_extensions?.mint_close_authority || null,
      freezeAuthority,
      createdAt: null // will be filled by getTokenAge
    };
  } catch (err) {
    console.error('[getTokenMetadata] Error:', err.message);
    throw new Error("Token not found or invalid address");
  }
};
