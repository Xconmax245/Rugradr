const axios = require('axios');

module.exports = async (address, total_supply) => {
  console.log('[checkDevWallet] Running for address:', address);
  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  
  try {
    // Step 1: Find deployer
    const sigResponse = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getSignaturesForAddress",
      params: [address, { limit: 1000 }]
    }, { timeout: 10000 });

    const signatures = sigResponse.data.result;
    if (!signatures || signatures.length === 0) throw new Error("No signatures found");

    const oldestSig = signatures[signatures.length - 1].signature;
    const txResponse = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getTransaction",
      params: [oldestSig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }]
    }, { timeout: 10000 });

    const deployer = txResponse.data.result?.transaction?.message?.accountKeys?.[0]?.pubkey;
    if (!deployer) throw new Error("Deployer not found");

    // Step 2: Recent tx count
    const deployerSigs = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getSignaturesForAddress",
      params: [deployer, { limit: 10 }]
    }, { timeout: 10000 });

    const recentTxCount = deployerSigs.data.result?.length || 0;

    // Step 3: Current holdings
    const accountsResponse = await axios.post(rpcUrl, {
      jsonrpc: "2.0",
      id: "rug-radar",
      method: "getTokenAccountsByOwner",
      params: [deployer, { mint: address }, { encoding: "jsonParsed" }]
    }, { timeout: 10000 });

    const balance = accountsResponse.data.result?.value?.[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
    
    // Logic: Assume original allocation was something significant (e.g. 100% or 50%)
    // If balance is now very low, they sold.
    // This is a rough estimate.
    const percentHeld = total_supply > 0 ? (balance / (total_supply / Math.pow(10, 9))) * 100 : 0;
    const percentSold = Math.max(0, 100 - percentHeld); // Simplified assumption for Phase 3

    let scoreImpact = 0;
    if (percentHeld < 1) scoreImpact = -30;
    else if (percentHeld < 10) scoreImpact = -15;
    else scoreImpact = 0;

    const truncate = (addr) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

    return {
      deployerAddress: truncate(deployer),
      percentSold: Math.round(percentSold),
      recentTxCount,
      scoreImpact
    };
  } catch (err) {
    console.error('[checkDevWallet] Error:', err.message);
    return { deployerAddress: "Unknown", percentSold: 0, recentTxCount: 0, scoreImpact: 0 };
  }
};
