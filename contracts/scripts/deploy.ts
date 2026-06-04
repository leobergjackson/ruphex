import { network } from "hardhat";

const USDC_ADDRESS =
  process.env.USDC_ADDRESS ?? "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d";

const { viem, networkName } = await network.create();

console.log(`Deploying Recibo to ${networkName}...`);
console.log(`USDC: ${USDC_ADDRESS}`);

const recibo = await viem.deployContract("Recibo", [
  USDC_ADDRESS as `0x${string}`,
]);

console.log("Recibo deployed to:", recibo.address);
