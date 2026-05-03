const axios = require('axios')

// Jupiter verified token list (cached in memory)
let jupiterTokenCache = null
let cacheTimestamp = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const getJupiterTokenList = async () => {
  const now = Date.now()
  if (jupiterTokenCache && (now - cacheTimestamp) < CACHE_TTL) {
    return jupiterTokenCache
  }
  const response = await axios.get('https://tokens.jup.ag/tokens?tags=verified', { timeout: 10000 })
  jupiterTokenCache = response.data
  cacheTimestamp = now
  return jupiterTokenCache
}

module.exports = async (input) => {
  const query = input.trim().toLowerCase()
  console.log('[resolveToken] Resolving:', query)

  try {
    // Step 1: Try Jupiter verified list first (exact symbol match)
    const tokens = await getJupiterTokenList()
    const exactMatches = tokens.filter(t =>
      t.symbol?.toLowerCase() === query ||
      t.name?.toLowerCase() === query
    )

    if (exactMatches.length === 1) {
      // Single exact match — return directly
      return {
        type: 'single',
        token: {
          address: exactMatches[0].address,
          name: exactMatches[0].name,
          symbol: exactMatches[0].symbol,
        }
      }
    }

    if (exactMatches.length > 1) {
      // Multiple exact matches — return top 5 by tag priority
      return {
        type: 'multiple',
        tokens: exactMatches.slice(0, 5).map(t => ({
          address: t.address,
          name: t.name,
          symbol: t.symbol,
        }))
      }
    }

    // Step 2: Partial match on Jupiter list
    const partialMatches = tokens.filter(t =>
      t.symbol?.toLowerCase().includes(query) ||
      t.name?.toLowerCase().includes(query)
    )

    if (partialMatches.length > 0) {
      return {
        type: 'multiple',
        tokens: partialMatches.slice(0, 5).map(t => ({
          address: t.address,
          name: t.name,
          symbol: t.symbol,
        }))
      }
    }

    // Step 3: Fallback to DexScreener search
    const dexResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(input)}`,
      { timeout: 10000 }
    )

    const pairs = dexResponse.data.pairs?.filter(p => p.chainId === 'solana') || []

    if (pairs.length === 0) {
      return { type: 'notfound' }
    }

    // Deduplicate by base token address
    const seen = new Set()
    const unique = []
    for (const pair of pairs) {
      const addr = pair.baseToken?.address
      if (addr && !seen.has(addr)) {
        seen.add(addr)
        unique.push({
          address: addr,
          name: pair.baseToken?.name || 'Unknown',
          symbol: pair.baseToken?.symbol || '???',
          marketCap: pair.marketCap || pair.fdv || null,
          dexId: pair.dexId || null,
        })
      }
      if (unique.length >= 5) break
    }

    if (unique.length === 1) {
      return { type: 'single', token: unique[0] }
    }

    return { type: 'multiple', tokens: unique }

  } catch (err) {
    console.error('[resolveToken] Error:', err.message)
    return { type: 'error' }
  }
}
