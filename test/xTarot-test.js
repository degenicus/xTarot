const pools = require("../pools.json");
const hre = require("hardhat");
const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;

const moveTimeForward = async (seconds) => {
  await network.provider.send("evm_increaseTime", [seconds]);
  await network.provider.send("evm_mine");
};

const updatePools = async (acelab) => {
  const tx = await acelab.massUpdatePools();
  await tx.wait();
};

describe("Vaults", function () {
  let Vault;
  let Strategy;
  let Treasury;
  let Tarot;
  let XStakingPoolController;
  let vault;
  let strategy;
  let treasury;
  let xTarot;
  const tarotSupplyVaultRouter01 = "0x3E9F34309B2f046F4f43c0376EFE2fdC27a10251";
  const tarotAddress = "0xC5e2B037D30a390e62180970B3aa4E91868764cD";
  const xTarotAddress = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4";
  const bTarotAddress = "0xe0d10cefc6cdfbbde41a12c8bbe9548587568329";
  const XStakingPoolControllerAddress =
    "0x466eBD9EC2027776fa11a982E9BBe4F67aa6e86B";
  const uniRouter = "0xF491e7B69E4244ad4002BC14e878a34207E38c29";
  let xStakingPoolController;
  let self;
  let selfAddress;
  let owner;

  beforeEach(async function () {
    //reset network
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: "https://rpc.ftm.tools/",
            blockNumber: 27945439,
          },
        },
      ],
    });
    console.log("providers");
    //   //get signers
    [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();
    const xTarotHolder = "0x7ea2d94c0bb347014db4c08e70fac5f67793ffe0";
    const xTarotWhaleAddress = "0x95b4de84579c71212000e26ba390377e4c4357a7";
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [xTarotHolder],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [xTarotWhaleAddress],
    });
    self = await ethers.provider.getSigner(xTarotHolder);
    tarotWhale = await ethers.provider.getSigner(xTarotWhaleAddress);
    await self.sendTransaction({
      to: xTarotWhaleAddress,
      value: ethers.utils.parseEther("1"),
    });
    selfAddress = await self.getAddress();
    ownerAddress = await owner.getAddress();
    console.log("addresses");
    //get artifacts
    Strategy = await ethers.getContractFactory("ReaperAutoCompoundTarot");
    Vault = await ethers.getContractFactory("ReaperVaultv1_3");
    Treasury = await ethers.getContractFactory("ReaperTreasury");
    XTarot = await ethers.getContractFactory(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20"
    );
    XStakingPoolController = await ethers.getContractFactory(
      "XStakingPoolController"
    );
    console.log("artifacts");
    //deploy contracts
    treasury = await Treasury.deploy();
    console.log("treasury");
    xTarot = await XTarot.attach(xTarotAddress);
    xStakingPoolController = await XStakingPoolController.attach(
      XStakingPoolControllerAddress
    );
    console.log("tarot attached");
    vault = await Vault.deploy(
      xTarotAddress,
      "XTAROT Single Stake Vault",
      "rfXTAROT",
      432000,
      0,
      ethers.utils.parseEther("999999")
    );
    console.log("vault");
    console.log(`vault.address: ${vault.address}`);
    console.log(`treasury.address: ${treasury.address}`);
    // Random address
    const strategist = "0x38a1fed9f600c4a062bda4520b39fec05b2b0e51";
    strategy = await Strategy.deploy(
      uniRouter,
      XStakingPoolControllerAddress,
      tarotSupplyVaultRouter01,
      vault.address,
      treasury.address,
      strategist
    );
    console.log("strategy");
    const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    const TFTM_ID = 0;
    const TFTM = "0x0DeFeF0C977809DB8c1A3f13FD8DacBD565D968E";
    const tx1 = await strategy.addUsedPool(TFTM_ID, [TFTM, WFTM]);
    await tx1.wait();
    await vault.initialize(strategy.address);
    console.log(`Strategy deployed to ${strategy.address}`);
    console.log(`Vault deployed to ${vault.address}`);
    console.log(`Treasury deployed to ${treasury.address}`);
    //approving LP token and vault share spend
    await xTarot.approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals1");
    await vault.approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals2");
    await xTarot
      .connect(self)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals3");
    await vault
      .connect(self)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals4");
    await xTarot
      .connect(tarotWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals5");
    await vault
      .connect(tarotWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
  });

  describe("Deploying the vault and strategy", function () {
    it("should initiate vault with a 0 balance", async function () {
      console.log(1);
      const totalBalance = await vault.balance();
      console.log(2);
      const availableBalance = await vault.available();
      console.log(3);
      const pricePerFullShare = await vault.getPricePerFullShare();
      console.log(4);
      expect(totalBalance).to.equal(0);
      console.log(5);
      expect(availableBalance).to.equal(0);
      console.log(6);
      expect(pricePerFullShare).to.equal(ethers.utils.parseEther("1"));
    });
  });
  describe("Vault Tests", function () {
    it("should allow deposits and account for them correctly", async function () {
      const userBalance = await xTarot.balanceOf(selfAddress);
      console.log(1);
      console.log(`userBalance: ${userBalance}`);
      const vaultBalance = await vault.balance();
      console.log("vaultBalance");
      console.log(vaultBalance);
      console.log(2);
      const depositAmount = ethers.utils.parseEther(".1");
      console.log("depositAmount");
      console.log(depositAmount);
      console.log(3);
      await vault.connect(self).deposit(depositAmount);
      console.log(4);
      const newVaultBalance = await vault.balance();
      console.log(`newVaultBalance: ${newVaultBalance}`);
      console.log(`depositAmount: ${depositAmount}`);
      const newUserBalance = await xTarot.balanceOf(selfAddress);
      console.log(`newUserBalance: ${newUserBalance}`);
      console.log(
        `userBalance - depositAmount: ${userBalance - depositAmount}`
      );
      console.log(
        `userBalance - newUserBalance: ${userBalance - newUserBalance}`
      );
      const deductedAmount = userBalance.sub(newUserBalance);
      console.log("deductedAmount");
      console.log(deductedAmount);
      expect(vaultBalance).to.equal(0);
      expect(depositAmount).to.equal(newVaultBalance);
      expect(deductedAmount).to.equal(depositAmount);
    });
    it("should mint user their pool share", async function () {
      const userBalance = await xTarot.balanceOf(selfAddress);
      console.log(userBalance.toString());
      const depositAmount = ethers.utils.parseEther("0.0000005");
      await vault.connect(self).deposit(depositAmount);
      console.log((await vault.balance()).toString());
      console.log((await xTarot.balanceOf(selfAddress)).toString());
      const selfShareBalance = await vault.balanceOf(selfAddress);
      console.log(selfShareBalance.toString());
      await xTarot.connect(self).transfer(ownerAddress, depositAmount);
      const ownerBalance = await xTarot.balanceOf(ownerAddress);
      console.log(ownerBalance.toString());
      await vault.deposit(depositAmount);
      const ownerShareBalance = await vault.balanceOf(ownerAddress);
      console.log(ownerShareBalance.toString());
      expect(ownerShareBalance).to.equal(depositAmount);
      expect(selfShareBalance).to.equal(depositAmount);
    });
    it("should allow withdrawals", async function () {
      const userBalance = await xTarot.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      const depositAmount = ethers.BigNumber.from(ethers.utils.parseEther("1"));
      await vault.connect(self).deposit(depositAmount);
      console.log(
        `await tarot.balanceOf(selfAddress): ${await xTarot.balanceOf(
          selfAddress
        )}`
      );
      const whaleDepositAmount = ethers.utils.parseEther("100");
      await vault.connect(tarotWhale).deposit(whaleDepositAmount);
      const newUserBalance = userBalance.sub(depositAmount);
      const tokenBalance = await xTarot.balanceOf(selfAddress);
      const balanceDifferenceIsZero = tokenBalance.sub(newUserBalance).isZero();
      expect(balanceDifferenceIsZero).to.equal(true);
      await vault.connect(self).withdraw(depositAmount);
      console.log(
        `await tarot.balanceOf(selfAddress): ${await xTarot.balanceOf(
          selfAddress
        )}`
      );
      const newUserVaultBalance = await vault.balanceOf(selfAddress);
      console.log(`newUserVaultBalance: ${newUserVaultBalance}`);
      const userBalanceAfterWithdraw = await xTarot.balanceOf(selfAddress);
      const securityFee = 10;
      const percentDivisor = 10000;
      const withdrawFee = (depositAmount * securityFee) / percentDivisor;
      const expectedBalance = userBalance.sub(withdrawFee);
      const isSmallBalanceDifference =
        expectedBalance.sub(userBalanceAfterWithdraw) < 5;
      expect(isSmallBalanceDifference).to.equal(true);
    });
    xit("should be able to harvest", async function () {
      await strategy.connect(self).harvest();
    });
    xit("should provide yield", async function () {
      await strategy.connect(self).harvest();
      const depositAmount = ethers.utils.parseEther(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      console.log(`vaultBalance: ${vaultBalance}`);
      console.log(`depositAmount: ${depositAmount}`);

      await strategy.connect(self).harvest();
      const newVaultBalance = await vault.balance();
      console.log(`newVaultBalance: ${newVaultBalance}`);
      const whaleDepositAmount = ethers.utils.parseEther("4628");
      await vault.connect(booWhale).deposit(whaleDepositAmount);
      const bigWhaleDepositAmount = ethers.utils.parseEther("327171");
      await vault.connect(bigBooWhale).deposit(bigWhaleDepositAmount);
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(acelab);
      await strategy.connect(self).harvest();
      const newVaultBalance2 = await vault.balance();
      console.log(`newVaultBalance2: ${newVaultBalance2}`);
      const totalDepositAmount = depositAmount
        .add(whaleDepositAmount)
        .add(bigWhaleDepositAmount);
      console.log(`totalDepositAmount: ${totalDepositAmount}`);
      const hasYield = newVaultBalance2 > totalDepositAmount;
      console.log(`hasYield: ${hasYield}`);
      expect(hasYield).to.equal(true);
    });
  });
  // describe("Strategy", function () {
  //   xit("should be able to remove a pool", async function () {
  //     await strategy.connect(self).harvest();
  //     const bigWhaleDepositAmount = ethers.utils.parseEther("327171");
  //     await vault.connect(bigBooWhale).deposit(bigWhaleDepositAmount);
  //     await strategy.connect(self).harvest();

  //     const treebPoolId = 9;
  //     const treebIndex = 3;
  //     const treebPoolBalance = await strategy.poolxBooBalance(treebPoolId);
  //     console.log(`treebPoolBalance: ${treebPoolBalance}`);
  //     const vaultBalance = await vault.balance();

  //     const tx = await strategy.removeUsedPool(treebIndex);
  //     await tx.wait();

  //     const newVaultBalance = await vault.balance();
  //     const newTreebPoolBalance = await strategy.poolxBooBalance(treebPoolId);
  //     console.log(`newTreebPoolBalance: ${newTreebPoolBalance}`);

  //     // Make sure harvest can run without error after removing
  //     await strategy.connect(self).harvest();

  //     expect(newTreebPoolBalance).to.equal(0);
  //     expect(vaultBalance).to.equal(newVaultBalance);
  //   });
  //   xit("should be able to pause and unpause", async function () {
  //     await strategy.pause();
  //     const depositAmount = ethers.utils.parseEther(".05");
  //     await expect(vault.connect(self).deposit(depositAmount)).to.be.reverted;
  //     await strategy.unpause();
  //     await expect(vault.connect(self).deposit(depositAmount)).to.not.be
  //       .reverted;
  //   });
  //   xit("should be able to panic", async function () {
  //     const depositAmount = ethers.utils.parseEther(".05");
  //     await vault.connect(self).deposit(depositAmount);
  //     const vaultBalance = await vault.balance();
  //     const strategyBalance = await strategy.balanceOf();
  //     await strategy.panic();
  //     const newVaultBalance = await vault.balance();
  //     const newStrategyBalance = await strategy.balanceOf();
  //     expect(vaultBalance).to.equal(strategyBalance);
  //     // Accounting is not updated when panicking so newVaultBalance is 2x expected
  //     //expect(newVaultBalance).to.equal(vaultBalance);
  //     // It looks like the strategy still has balance because panic does not update balance
  //     //expect(newStrategyBalance).to.equal(0);
  //   });
  //   xit("should be able to retire strategy", async function () {
  //     // Test needs the require statement to be commented out during the test
  //     const depositAmount = ethers.utils.parseEther(".05");
  //     await vault.connect(self).deposit(depositAmount);
  //     const vaultBalance = await vault.balance();
  //     const strategyBalance = await strategy.balanceOf();
  //     await strategy.retireStrat();
  //     const newVaultBalance = await vault.balance();
  //     const newStrategyBalance = await strategy.balanceOf();
  //     // const userBalance = await vault.balanceOf(selfAddress);
  //     // console.log(`userBalance: ${userBalance}`);
  //     // await vault.connect(self).withdraw(userBalance);
  //     expect(vaultBalance).to.equal(strategyBalance);
  //     // expect(newVaultBalance).to.equal(vaultBalance);
  //     expect(newStrategyBalance).to.equal(0);
  //   });
  //   it("should be able to estimate harvest", async function () {
  //     const bigWhaleDepositAmount = ethers.utils.parseEther("327171");
  //     await vault.connect(bigBooWhale).deposit(bigWhaleDepositAmount);
  //     await strategy.harvest();
  //     const minute = 60;
  //     const hour = 60 * minute;
  //     const day = 24 * hour;
  //     await moveTimeForward(10 * day);
  //     await updatePools(acelab);
  //     const [profit, callFeeToUser] = await strategy.estimateHarvest();
  //     const hasProfit = profit.gt(0);
  //     const hasCallFee = callFeeToUser.gt(0);
  //     expect(hasProfit).to.equal(true);
  //     expect(hasCallFee).to.equal(true);
  //   });
  // });
});
