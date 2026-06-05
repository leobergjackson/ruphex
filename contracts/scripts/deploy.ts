import { network } from "hardhat";

const USDC_ADDRESS =
  process.env.USDC_ADDRESS ?? "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

const { viem, networkName } = await network.create();

console.log(`Deploying Ruphex to ${networkName}...`);
console.log(`USDC: ${USDC_ADDRESS}`);

const ruphex = await viem.deployContract("Ruphex", [
  USDC_ADDRESS as `0x${string}`,
]);

console.log("Ruphex deployed to:", ruphex.address);
