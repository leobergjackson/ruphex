/**
 * Terminal 3 Agent Auth — real headless proof.
 *
 * Runs the REAL Terminal 3 testnet flow with no browser / MetaMask popup:
 *
 *   eth_get_address(key)
 *     -> metamask_sign(address, undefined, key)   // privateKey => MetaMask NOT used
 *     -> new T3nClient({ baseUrl, wasmComponent, handlers: { EthSign } })
 *     -> client.handshake()
 *     -> client.authenticate(createEthAuthInput(address))   // => real did:t3n:...
 *     -> client.getUsage()                                  // => real token balance
 *
 * Prints ONLY: the agent's public address, its real DID, and the token
 * balance (available + reserved) from the T3 node ledger.
 *
 * No UI. No mocks. On failure it prints the REAL error and the step that
 * failed — it never fabricates a success.
 *
 * Run:
 *   npm run t3
 *
 * TLS note: this machine has a TLS-inspecting proxy/AV, so the HTTPS call to
 * the T3 node can fail Node's cert check with UNABLE_TO_VERIFY_LEAF_SIGNATURE.
 * If that happens, re-run with cert verification disabled for the local proxy
 * (the SDK's own ML-KEM layer still encrypts the payload end-to-end):
 *   bash:        NODE_TLS_REJECT_UNAUTHORIZED=0 npm run t3
 *   PowerShell:  $env:NODE_TLS_REJECT_UNAUTHORIZED=0; npm run t3
 *
 * Env:
 *   T3N_AGENT_PRIVATE_KEY   Ethereum private key (0x + 64 hex), read from
 *                           .env.local via process.env. NEVER logged.
 */

import {
  setEnvironment,
  getNodeUrl,
  loadWasmComponent,
  eth_get_address,
  metamask_sign,
  createEthAuthInput,
  T3nClient,
} from "@terminal3/t3n-sdk";

async function main(): Promise<void> {
  let step = "init";
  try {
    // 0) Load the agent key. NEVER print it.
    step = "read key";
    const privateKey = process.env.T3N_AGENT_PRIVATE_KEY;
    if (!privateKey) {
      console.error(
        "✖ T3N_AGENT_PRIVATE_KEY is not set. Add it to .env.local (0x + 64 hex) and re-run.",
      );
      process.exit(1);
    }

    // 1) Target the public testnet (must precede client creation).
    step = "setEnvironment(testnet)";
    setEnvironment("testnet");
    const baseUrl = getNodeUrl();
    console.log(`T3 node (testnet): ${baseUrl}`);

    // 2) Derive the public address — pure local, no network.
    step = "Deriving address";
    console.log("Deriving address...");
    const address = eth_get_address(privateKey);
    console.log(`Address: ${address}`);

    // 3) Load the WASM crypto/state-machine component.
    step = "Loading WASM";
    console.log("Loading WASM...");
    const wasmComponent = await loadWasmComponent();

    // 4) Build the client with a HEADLESS signer.
    //    Passing privateKey makes metamask_sign sign locally (no window.ethereum).
    step = "Creating client";
    const client = new T3nClient({
      baseUrl,
      wasmComponent,
      handlers: {
        EthSign: metamask_sign(address, undefined, privateKey),
      },
    });

    // 5) Encrypted handshake — mints the server session.
    step = "Handshaking";
    console.log("Handshaking...");
    const handshake = await client.handshake();
    console.log(
      `Session established (expires ${new Date(handshake.expiry).toISOString()})`,
    );

    // 6) Authenticate -> real DID.
    step = "Authenticating";
    console.log("Authenticating...");
    const did = await client.authenticate(createEthAuthInput(address));
    const didStr = did.value ?? did.toString();

    // 7) Fetch usage -> real token balance from the T3 ledger.
    step = "Fetching usage";
    console.log("Fetching usage...");
    const usage = await client.getUsage();

    console.log("\n===== Terminal 3 Agent — REAL result =====");
    console.log(`Address           : ${address}`);
    console.log(`DID               : ${didStr}`);
    console.log(`Balance available : ${usage.balance.available}`);
    console.log(`Balance reserved  : ${usage.balance.reserved}`);
    console.log("==========================================");
  } catch (err) {
    const e = err as { message?: string; code?: string; cause?: unknown };
    const msg = e?.message ?? String(err);
    const cause = e?.cause as { code?: string; message?: string } | undefined;
    const causeStr = cause ? cause.code ?? cause.message ?? String(cause) : undefined;

    console.error(`\n✖ FAILED at step: ${step}`);
    console.error(`Real error: ${msg}`);
    if (e?.code) console.error(`Code: ${e.code}`);
    if (causeStr) console.error(`Cause: ${causeStr}`);

    // Surface the known local-proxy TLS case with the documented fallback.
    if (/UNABLE_TO_VERIFY_LEAF_SIGNATURE|self[- ]signed|certificate/i.test(`${msg} ${causeStr ?? ""}`)) {
      console.error(
        "\nThis is the local TLS-inspecting proxy. Re-run with cert verification disabled:",
      );
      console.error("  bash:        NODE_TLS_REJECT_UNAUTHORIZED=0 npm run t3");
      console.error("  PowerShell:  $env:NODE_TLS_REJECT_UNAUTHORIZED=0; npm run t3");
    }
    process.exit(1);
  }
}

main();
