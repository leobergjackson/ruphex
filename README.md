# Recibo

Recibo is an AI-powered USDC payment gateway for LATAM freelancers, built for the **Ethereum Mexico 2026** hackathon. It streamlines the entire workflow from receiving a client email to off-ramping funds into a Mexican bank account.

## One Demo Path
1. **AI Parse:** Paste raw invoice text (email, PDF dump). Groq extracts metadata and amounts.
2. **Smart Link:** Generate a cryptographically encoded payment URL (no database).
3. **On-Chain Settlement:** Client pays in USDC on Arbitrum Sepolia.
4. **Verified Proof:** Real-time on-chain event detection and transaction receipts.
5. **Direct Off-Ramp:** Integrated instructions for withdrawing to MXN via Bitso.

## Tech Stack
- **AI:** Groq Cloud (Parsing & Data Extraction)
- **Blockchain:** Arbitrum Sepolia (USDC Payments)
- **Smart Contracts:** Solidity (OpenZeppelin standards)
- **Frontend:** Next.js 16, Tailwind CSS, Framer Motion
- **Web3:** Wagmi, Viem, RainbowKit
- **Fiat Integration:** Bitso API V3 (Optional balance preview)

## Trust & Security
- **Non-Custodial:** Funds go directly from the client's wallet to the freelancer's wallet.
- **Privacy First:** Invoice data is encoded in the URL and stored in local browser history. No central database.
- **Bitso Honest Mode:** Clearly distinguishes between on-chain payments and manual off-ramp steps.

## Submission Requirements

### Real Transaction Proofs (Arbitrum Sepolia)
*Note to judges: Use these hashes to verify contract interactions.*

1. **Approve USDC:** [Insert your Hash 1]
2. **Pay Invoice:** [Insert your Hash 2]
3. **Pay Invoice (Repeat):** [Insert your Hash 3]

*The Recibo contract at `0x563249FfE1783050D95A2dc70fE549909b4D09a8` emits the `InvoicePaid` event.*

**Contract Deployment:** `0x0217eed43d9641f5255c032a544c0bffce7f6698448f1aa919a6929a8497cf61`

## Local Development

1. **Setup Env:** Create `.env.local` with your API keys:
```env
GROQ_API_KEY=your_key
GROQ_MODEL=llama-3.3-70b-versatile
NEXT_PUBLIC_CONTRACT_ADDRESS=0x563249FfE1783050D95A2dc70fE549909b4D09a8
NEXT_PUBLIC_USDC_ADDRESS=0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d
NEXT_PUBLIC_CHAIN_ID=421614
NEXT_PUBLIC_ARB_SEPOLIA_RPC_URL=your_arbitrum_sepolia_rpc_url
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional Bitso Preview
BITSO_API_KEY=
BITSO_API_SECRET=
BITSO_API_BASE_URL=https://stage.bitso.com
```

2. **Run:** `npm install && npm run dev`

## Deployment

```bash
# Compile
npm run compile

# Deploy to Arbitrum Sepolia
ARB_SEPOLIA_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc" \
DEPLOYER_PRIVATE_KEY="0x..." \
npm run deploy:arbitrum-sepolia
```
