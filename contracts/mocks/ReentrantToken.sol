// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ruphex} from "../Ruphex.sol";

/// @dev Simulates a token that reenters Ruphex during transferFrom.
contract ReentrantToken {
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public balanceOf;

    Ruphex public target;
    bytes32 public reenterInvoiceId;
    address public reenterFreelancer;
    uint256 public reenterAmount;
    bool public shouldReenter;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function configureReenter(
        Ruphex _target,
        bytes32 invoiceId,
        address freelancer,
        uint256 amount
    ) external {
        target = _target;
        reenterInvoiceId = invoiceId;
        reenterFreelancer = freelancer;
        reenterAmount = amount;
        shouldReenter = true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (shouldReenter) {
            shouldReenter = false;
            target.payInvoice(reenterInvoiceId, reenterFreelancer, reenterAmount);
        }

        if (allowance[from][msg.sender] < amount || balanceOf[from] < amount) return false;

        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
