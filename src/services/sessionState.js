// In-memory session state per user
// Stores pending token selections
const sessions = new Map()
const SESSION_TTL = 2 * 60 * 1000 // 2 minutes

module.exports = {
  setPending: (userId, tokens) => {
    sessions.set(userId, {
      tokens,
      timestamp: Date.now()
    })
  },

  getPending: (userId) => {
    const session = sessions.get(userId)
    if (!session) return null
    // Expire old sessions
    if (Date.now() - session.timestamp > SESSION_TTL) {
      sessions.delete(userId)
      return null
    }
    return session.tokens
  },

  clearPending: (userId) => {
    sessions.delete(userId)
  }
}
