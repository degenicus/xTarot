// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ISupplyVault is IERC20 {
    /* Vault */
    function enter(uint256 _amount) external returns (uint256 share);

    function leave(uint256 _share) external returns (uint256 underlyingAmount);

    /* Read functions that are non-view due to updating exchange rates */
    function underlyingBalanceForAccount(address _account)
        external
        returns (uint256 underlyingBalance);

    function underlyingValuedAsShare(uint256 _underlyingAmount)
        external
        returns (uint256 share_);
}
