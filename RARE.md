# Ruphex × RARE Protocol — Provenance for LATAM creators

BUIDL the receipt rail that turns every LATAM freelancer payment into ownable, on-chain provenance. When a creator in México City, Bogotá, or São Paulo gets paid in USDC, Ruphex settles the money on **Arbitrum** and mints the receipt as a **RARE Protocol** NFT — a 1/1 "Ruphex" that proves the payment *and* gives the delivered work permanent provenance on the network creators already trust.

## Why two chains

| Layer | Chain | Why |
| --- | --- | --- |
| **Payment** | Arbitrum Sepolia | Sub-cent fees + fast finality — built for everyday LATAM invoices. |
| **Provenance** | RARE Protocol (Ethereum Sepolia) | Where creators curate and own their work. The RARE CLI mints the receipt as a collectible. |

The RARE CLI supports Ethereum (Sepolia/Mainnet) and Base — not Arbitrum — so the split is deliberate: cheap rails for money, RARE for provenance.

## One-time setup

```bash
# Node 22+ required
npm i -g @rareprotocol/rare-cli

# Store the minting key for the RARE provenance wallet
rare configure --chain sepolia --private-key 0xYOUR_KEY
#   …or generate a fresh one:
rare wallet generate --chain sepolia --save
rare wallet address --chain sepolia      # fund this with Sepolia ETH

# Deploy the collection that holds every Ruphex (do this once)
rare collection deploy erc721 "Ruphex LATAM" "RCB" --chain sepolia
# -> copy the deployed address into .env.local as RARE_COLLECTION_ADDRESS
```

## Mint a paid invoice

After a USDC invoice settles on Arbitrum, mint its provenance:

```bash
# From a JSON file (see scripts/sample-invoice.json)
npm run rare:mint -- --invoice ./scripts/sample-invoice.json

# …or inline
npm run rare:mint -- \
  --reference RCB-2026-014 \
  --description "Brand identity for a Oaxaca coffee co-op" \
  --amount 700 \
  --freelancer 0xCreator --client 0xClient \
  --tx 0xArbitrumPaymentHash \
  --country MX
```

Preview the exact `rare` command without minting:

```bash
RARE_DRY_RUN=1 npm run rare:mint -- --invoice ./scripts/sample-invoice.json
```

Under the hood this builds RARE metadata in [`lib/rare.ts`](lib/rare.ts) and shells out to:

```bash
rare collection mint --chain sepolia --contract $RARE_COLLECTION_ADDRESS \
  --name "Ruphex RCB-2026-014" \
  --description "On-chain proof of payment for a LATAM creator (MX)…" \
  --attribute "Amount (USDC)=700" --attribute "Payment Network=Arbitrum Sepolia" …
```

## Environment

```bash
RARE_CHAIN=sepolia                          # RARE CLI network (sepolia | base | base-sepolia | mainnet)
RARE_COLLECTION_ADDRESS=0x...               # from `rare collection deploy`
# The signing key lives in ~/.rare/config.json via `rare configure` — never commit it.
```

## What the judges can run

`npm run rare:mint -- --invoice ./scripts/sample-invoice.json` produces a real on-chain RARE mint
(given a configured CLI), or a full command preview with `RARE_DRY_RUN=1` — no faked output.
