const { formatLargeNumber } = require('./formatNumber')

module.exports = (tokens, query) => {
  const lines = [
    `🔍 Found <b>${tokens.length} tokens</b> matching "<b>${query}</b>"`,
    ``,
    `Which one did you mean?`,
    ``
  ]

  tokens.forEach((token, i) => {
    const mcap = token.marketCap
      ? ` — ${formatLargeNumber(token.marketCap)} mcap`
      : ''
    const dex = token.dexId ? ` — ${token.dexId}` : ''
    lines.push(`<b>${i + 1}.</b> ${token.name} (<code>$${token.symbol}</code>)${mcap}${dex}`)
    lines.push(`   <code>${token.address.slice(0,6)}...${token.address.slice(-6)}</code>`)
    lines.push(``)
  })

  lines.push(`Reply with a number (1–${tokens.length}) to scan that token.`)
  lines.push(`Or paste the full CA directly if you know it.`)

  return lines.join('\n')
}
