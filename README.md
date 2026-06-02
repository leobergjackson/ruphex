# Recibo — ETH Mexico 2026

Recibo is a production-ready USDC invoice payment app for LATAM freelancers. It turns a client email or PDF into a smart payment link, settles on Arbitrum, and offers a Bitso off-ramp path for fiat withdrawal.

## What it does
- Parse invoice text with AI and extract client, amount, and due date.
- Generate a signed, shareable payment link for USDC on Arbitrum Sepolia.
- Collect USDC directly from the client wallet to the freelancer wallet.
- Store invoices locally in the browser for quick history and follow-up.
- Fetch a Bitso deposit address for off-ramping USDC.

## User flow
1. Freelancer pastes invoice text into the dashboard.
2. The AI parser extracts key fields and produces a smart link.
3. The client opens the link, approves USDC, then confirms payment.
4. The Recibo contract transfers USDC directly to the freelancer.
5. The freelancer can off-ramp via Bitso using the fetched deposit address.

## Architecture
<img width="867" height="491" alt="image" src="https://github.com/user-attachments/assets/64b28b7e-646f-4db6-b628-588b86580db8" />
<img width="1001" height="711" alt="Screenshot 2026-06-02 172247" src="https://github.com/user-attachments/assets/e1f4b7bb-3717-4486-8a1e-c26eaa883cac" />


## Smart contract
- Contract: Recibo.sol (no admin, zero fee, non-custodial).
- Method: `payInvoice(bytes32 invoiceId, address freelancer, uint256 amount)`.
- Receipts: `InvoicePaid` event with invoiceId, payer, freelancer, and amount.

## API routes
- POST /api/parse-invoice
   - Uses Anthropic to parse invoice text.
   - Handles currency normalization for common LATAM currencies.
- GET /api/bitso-address
   - Fetches the USDC deposit address from Bitso.
   - Returns a fallback address for demo continuity if Bitso fails.

## Environment variables
Create a local .env using [.env.example](.env.example) as a template.

Required:
- `ANTHROPIC_API_KEY`
- `BITSO_API_KEY`
- `BITSO_API_SECRET`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_USDC_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID`

## Local development
```bash
npm install
npm run dev
```

## Contract development
```bash
npm run compile
npm run test:contracts
npm run deploy:arbitrum-sepolia
```

## Onchain proofs (Arbitrum Sepolia)
To verify the live demo, add the three transaction hashes:
1. Client approves USDC spend on Arbitrum Sepolia: [INSERT_HASH_1_HERE]
2. Client pays invoice (USDC transfer): [INSERT_HASH_2_HERE]
3. Freelancer sends USDC to Bitso deposit address: [INSERT_HASH_3_HERE]

## Tech stack
- Network: Arbitrum Sepolia
- Smart contract: Solidity
- Frontend: Next.js, Tailwind CSS, Wagmi, viem, RainbowKit
- AI parser: Anthropic Claude 3.5 Sonnet
- Fiat off-ramp: Bitso API
