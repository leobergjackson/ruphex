# Ruphex — Trusted Invoice Agent powered by Terminal 3

Ruphex is an autonomous invoice agent with verifiable identity for LATAM freelancers, built for the **Terminal 3 Agent Dev Kit Bounty Challenge**. It streamlines the entire workflow from receiving a client email to off-ramping funds into a Mexican bank account, using Terminal 3 Agent Auth to act securely on the user's behalf.

## Architecture & Flow

```text
Freelancer
     │
     ▼
Terminal 3 Authorization
     │
     ▼
Ruphex Invoice Agent
     │
 ┌───┼─────────────┐
 │   │             │
 ▼   ▼             ▼
Parse Invoice  Monitor Chain  Generate Receipt
 │   │             │
 └───┴─────────────┘
         │
         ▼
     Audit Trail
```

## One Demo Path
1. **AI Parse:** Paste raw invoice text (email, PDF dump). Groq extracts metadata and amounts.
2. **Terminal 3 Authorization:** User grants the AI agent specific delegated permissions.
3. **Smart Link:** Agent generates a cryptographically encoded payment URL (no database).
4. **On-Chain Settlement:** Client pays in USDC on Arbitrum Sepolia.
5. **Verified Proof:** Agent autonomously monitors on-chain events and generates a transaction receipt.

## Terminal 3 Integration

Ruphex uses Terminal 3 concepts to provide:

- **Verifiable Agent Identity**
- **Delegated User Permissions**
- **Autonomous Workflow Execution**
- **Auditability of Agent Actions**
- **Trusted Agent Credentials**

*Without Terminal 3, an AI agent cannot prove it is authorized to act on behalf of a freelancer.*

## Screenshots

*Judges: Please see below for the complete visual flow of the Trusted Agent integration.*

1. **Homepage**
   ![Homepage](./public/screenshot-home.png)
2. **Agent Authorization Modal**
   ![Agent Authorization Modal](./public/screenshot-auth.png)
3. **Agent Credentials Page**
   ![Agent Credentials Page](./public/screenshot-credentials.png)
4. **Invoice Creation**
   ![Invoice Creation](./public/screenshot-invoice.png)
5. **Audit Trail**
   ![Audit Trail](./public/screenshot-audit.png)
6. **Payment Confirmation**
   ![Payment Confirmation](./public/screenshot-payment.png)

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

*The Ruphex contract at `0x563249FfE1783050D95A2dc70fE549909b4D09a8` emits the `InvoicePaid` event.*

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
