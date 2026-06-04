export const reciboAbi = [
  {
    inputs: [
      { name: 'invoiceId', type: 'bytes32' },
      { name: 'freelancer', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'payInvoice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'invoiceId', type: 'bytes32' },
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: true, name: 'freelancer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
    ],
    name: 'InvoicePaid',
    type: 'event',
  },
  {
    inputs: [],
    name: 'AlreadyPaid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
] as const;

export const erc20Abi = [
  {
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
