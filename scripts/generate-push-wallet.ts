import { ethers } from 'ethers';

const wallet = ethers.Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('');
console.log('Add to .env.local:');
console.log(`PUSH_CHANNEL_ADDRESS=${wallet.address}`);
console.log(`PUSH_CHANNEL_PRIVATE_KEY=${wallet.privateKey}`);
