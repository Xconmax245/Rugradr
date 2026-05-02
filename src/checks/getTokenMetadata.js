const axios = require('axios');

/**
 * Fetches token metadata using Helius getAsset with a getAccountInfo fallback.
 * @param {string} address - The token mint address.
 * @returns {Promise<Object>} Token metadata object.
 */
module.exports = async (address) => {
  console.log('[getTokenMetadata] Running for address:', address);
  const heliusUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;

  try {
    // Method 1: Helius getAsset (DAS API)
    const response = await axios.post(heliusUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getAsset",
      params: { id: address }
    }, { timeout: 10000 });

    const result = response.data.result;
    
    if (result) {
      // Try multiple paths for freeze authority
      let freezeAuthority = result.token_info?.freeze_authority || null;
      if (!freezeAuthority && result.authorities) {
        const freezeAuth = result.authorities.find(a => a.scopes?.includes('freeze'));
        freezeAuthority = freezeAuth?.address || null;
      }

      return {
        name: result.content?.metadata?.name || "Unknown Token",
        symbol: result.token_info?.symbol || "???",
        supply: result.token_info?.supply || 0,
        decimals: result.token_info?.decimals || 0,
        mintAuthority: result.mint_extensions?.mint_close_authority || null,
        freezeAuthority,
        createdAt: null
      };
    }

    // Method 2 Fallback: try getAccountInfo
    console.log('[getTokenMetadata] getAsset failed, trying getAccountInfo fallback...');
    const fallback = await axios.post(heliusUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getAccountInfo",
      params: [address, { encoding: "jsonParsed" }]
    }, { timeout: 10000 });

    const info = fallback.data.result?.value?.data?.parsed?.info;
    if (info) {
      return {
        name: "Unknown Token",
        symbol: "???",
        supply: info.supply || 0,
        decimals: info.decimals || 0,
        mintAuthority: info.mintAuthority || null,
        freezeAuthority: info.freezeAuthority || null,
        createdAt: null
      };
    }

    // If both methods fail, return a safe default
    return {
      name: "Unknown Token",
      symbol: "???",
      supply: 0,
      decimals: 9,
      mintAuthority: "unknown",
      freezeAuthority: "unknown",
      createdAt: null
    };

  } catch (err) {
    console.error('[getTokenMetadata] Critical Error:', err.message);
    // Never throw — always return a safe default
    return {
      name: "Unknown Token",
      symbol: "???",
      supply: 0,
      decimals: 9,
      mintAuthority: "unknown",
      freezeAuthority: "unknown",
      createdAt: null
    };
  }
};
