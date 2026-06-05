import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

const INVOICE_ID = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;
const AMOUNT = 1_000_000n;

describe("Ruphex", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const [payer, freelancer] = await viem.getWalletClients();

  async function deployFixture() {
    const usdc = await viem.deployContract("MockERC20");
    const ruphex = await viem.deployContract("Ruphex", [usdc.address]);

    await usdc.write.mint([payer.account.address, AMOUNT]);
    await usdc.write.approve([ruphex.address, AMOUNT], { account: payer.account });

    return { usdc, ruphex };
  }

  it("payInvoice emits InvoicePaid", async function () {
    const { ruphex } = await deployFixture();

    await viem.assertions.emitWithArgs(
      ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      ruphex,
      "InvoicePaid",
      [
        INVOICE_ID,
        payer.account.address,
        freelancer.account.address,
        AMOUNT,
        (timestamp: bigint) => timestamp > 0n,
      ],
    );
  });

  it("second payInvoice for the same invoiceId reverts AlreadyPaid", async function () {
    const { ruphex } = await deployFixture();

    await ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
      account: payer.account,
    });

    await viem.assertions.revertWithCustomError(
      ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      ruphex,
      "AlreadyPaid",
    );
  });

  it("transferFrom failure reverts TransferFailed", async function () {
    const { usdc, ruphex } = await deployFixture();

    await usdc.write.setFailTransfer([true]);

    await viem.assertions.revertWithCustomError(
      ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      ruphex,
      "TransferFailed",
    );

    assert.equal(await ruphex.read.paid([INVOICE_ID]), false);
  });

  it("insufficient allowance reverts TransferFailed", async function () {
    const usdc = await viem.deployContract("MockERC20");
    const ruphex = await viem.deployContract("Ruphex", [usdc.address]);

    await usdc.write.mint([payer.account.address, AMOUNT]);

    await viem.assertions.revertWithCustomError(
      ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      ruphex,
      "TransferFailed",
    );

    assert.equal(await ruphex.read.paid([INVOICE_ID]), false);
  });

  it("constructor reverts ZeroAddress when USDC is zero", async function () {
    await assert.rejects(
      () => viem.deployContract("Ruphex", ["0x0000000000000000000000000000000000000000"]),
      (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        return message.includes("ZeroAddress");
      },
    );
  });

  it("payInvoice reverts ZeroAddress when freelancer is zero", async function () {
    const { ruphex } = await deployFixture();

    await viem.assertions.revertWithCustomError(
      ruphex.write.payInvoice(
        [INVOICE_ID, "0x0000000000000000000000000000000000000000", AMOUNT],
        { account: payer.account },
      ),
      ruphex,
      "ZeroAddress",
    );
  });

  it("reentrancy during transferFrom is blocked", async function () {
    const token = await viem.deployContract("ReentrantToken");
    const ruphex = await viem.deployContract("Ruphex", [token.address]);
    const otherInvoiceId =
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as const;

    await token.write.mint([payer.account.address, AMOUNT * 2n]);
    await token.write.approve([ruphex.address, AMOUNT * 2n], { account: payer.account });
    await token.write.configureReenter([
      ruphex.address,
      otherInvoiceId,
      freelancer.account.address,
      AMOUNT,
    ]);

    await viem.assertions.revertWithCustomError(
      ruphex.write.payInvoice([INVOICE_ID, freelancer.account.address, AMOUNT], {
        account: payer.account,
      }),
      ruphex,
      "ReentrancyGuardReentrantCall",
    );

    assert.equal(await ruphex.read.paid([INVOICE_ID]), false);
    assert.equal(await ruphex.read.paid([otherInvoiceId]), false);
  });
});
