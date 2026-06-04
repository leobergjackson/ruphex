import path from "node:path";
import { fileURLToPath } from "node:url";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: "0.8.20",
  paths: {
    sources: configDir,
    tests: path.join(configDir, "test"),
    cache: path.join(configDir, "cache"),
    artifacts: path.join(configDir, "artifacts"),
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    arbitrumSepolia: {
      type: "http",
      chainType: "op",
      url: configVariable("ARB_SEPOLIA_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
    },
  },
});
