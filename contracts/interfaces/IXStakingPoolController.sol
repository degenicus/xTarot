// SPDX-License-Identifier: MIT

import "./ISupplyVault.sol";

pragma solidity 0.8.9;

interface IXStakingPoolController {
    // Info of each user.
    struct UserInfo {
        uint256 amount; // How many tokens the user has provided.
        uint256 rewardDebt; // Reward debt. See explanation below.
    }

    // Info of each pool.
    struct PoolInfo {
        ISupplyVault RewardToken; // Address of reward token contract.
        uint256 RewardPerSecond; // reward token per second for this pool
        uint256 TokenPrecision; // The precision factor used for calculations, dependent on a tokens decimals
        uint256 xTAROTStakedAmount; // # of xTAROT allocated to this pool
        uint256 lastRewardTime; // Last block time that reward distribution occurs.
        uint256 accRewardPerShare; // Accumulated reward per share, times the pools token precision. See below.
        uint256 endTime; // end time of pool
        uint256 startTime; // start time of pool
        uint256 userLimitEndTime;
        address protocolOwnerAddress; // owner of the protocol of the reward token, used for emergency withdraw only
    }

    function poolInfo(uint256 _poolId) external view returns (PoolInfo memory);

    function userInfo(uint256 _poolId, address _userAddress)
        external
        view
        returns (uint256 amount, uint256 rewardDebt);

    function poolLength() external view returns (uint256);

    // View function to see pending BOOs on frontend.
    function pendingReward(uint256 _pid, address _user)
        external
        view
        returns (uint256);

    // Update reward variables for all pools. Be careful of gas spending!
    function massUpdatePools() external;

    // Deposit tokens.
    function deposit(uint256 _pid, uint256 _amount) external;

    // Withdraw tokens.
    function withdraw(uint256 _pid, uint256 _amount) external;

    // Withdraw without caring about rewards. EMERGENCY ONLY.
    function emergencyWithdraw(uint256 _pid) external;
}
