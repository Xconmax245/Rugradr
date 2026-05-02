# RugRadar 🔍
A Telegram bot that analyzes Solana tokens for rug pull risk before you ape in.

## What It Checks
- Mint authority status
- Freeze authority status
- Holder concentration
- Liquidity depth (estimated)
- Dev wallet activity
- Token age

## Risk Score
- 🟢 75–100 → Low Risk
- 🟡 50–74 → Moderate Risk
- 🔴 25–49 → High Risk
- ☠️ 0–24 → Extremely High Risk

## Local Setup
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and fill in your keys
4. Run `npm run dev`

## Environment Variables
| Variable | Description |
|---|---|
| TELEGRAM_BOT_TOKEN | From @BotFather on Telegram |
| HELIUS_API_KEY | From helius.dev |

## Deploy on Railway
1. Push repo to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Select this repo
4. Add environment variables in Railway dashboard
5. Railway auto-deploys on every push

## Usage
`/start` — Welcome message
`/help` — How it works
`/check [address]` — Analyze a token

## Disclaimer
Not financial advice. Always DYOR.
