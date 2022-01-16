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

const updatePools = async (_xStakingPoolController) => {
  const tx = await _xStakingPoolController.massUpdatePools();
  await tx.wait();
};

describe("Vaults", function () {
  let Vault;
  let Strategy;
  let Treasury;
  let Tarot;
  let XStakingPoolController;
  let PaymentRouter;
  let vault;
  let strategy;
  let treasury;
  let xTarot;
  let strategist;
  let paymentRouterAddress = "0x603e60d22af05ff77fdcf05c063f582c40e55aae";
  const tarotSupplyVaultRouter01 = "0x3E9F34309B2f046F4f43c0376EFE2fdC27a10251";
  const tarotAddress = "0xC5e2B037D30a390e62180970B3aa4E91868764cD";
  const xTarotAddress = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4";
  const bTarotAddress = "0xe0d10cefc6cdfbbde41a12c8bbe9548587568329";
  const strategistAddress = "0x3b410908e71Ee04e7dE2a87f8F9003AFe6c1c7cE";
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
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [strategistAddress],
    });
    self = await ethers.provider.getSigner(xTarotHolder);
    strategist = await ethers.provider.getSigner(strategistAddress);
    xTarotWhale = await ethers.provider.getSigner(xTarotWhaleAddress);
    await self.sendTransaction({
      to: xTarotWhaleAddress,
      value: ethers.utils.parseEther("1"),
    });
    selfAddress = await self.getAddress();
    ownerAddress = await owner.getAddress();
    console.log("addresses");
    //get artifacts
    Strategy = await ethers.getContractFactory("ReaperAutoCompoundTarot");
    PaymentRouter = await ethers.getContractFactory("PaymentRouter");
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
    const oneDay = 86400;
    vault = await Vault.deploy(
      xTarotAddress,
      "XTAROT Single Stake Vault",
      "rfXTAROT",
      oneDay,
      0,
      ethers.utils.parseEther("999999")
    );
    console.log("vault");
    console.log(`vault.address: ${vault.address}`);
    console.log(`treasury.address: ${treasury.address}`);
    strategy = await Strategy.deploy(
      vault.address,
      [treasury.address, paymentRouterAddress],
      [strategistAddress]
    );
    console.log("strategy");

    paymentRouter = await PaymentRouter.attach(paymentRouterAddress);
    await paymentRouter
      .connect(strategist)
      .addStrategy(strategy.address, [strategistAddress], [100]);
    console.log("payment router");

    const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    const TFTM_ID = 0;
    const TFTM = "0x0DeFeF0C977809DB8c1A3f13FD8DacBD565D968E";
    const tx1 = await strategy.addUsedPool(TFTM_ID, [WFTM, WFTM]);
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
      .connect(xTarotWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals5");
    await vault
      .connect(xTarotWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
  });

  describe("Deploying the vault and strategy", function () {
    xit("should initiate vault with a 0 balance", async function () {
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
    xit("should allow deposits and account for them correctly", async function () {
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
    xit("should mint user their pool share", async function () {
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
    xit("should allow withdrawals", async function () {
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
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
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
    it("should provide yield", async function () {
      await strategy.connect(self).harvest();
      const depositAmount = ethers.utils.parseEther(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      console.log(`vaultBalance: ${vaultBalance}`);
      console.log(`depositAmount: ${depositAmount}`);

      await strategy.connect(self).harvest();
      const newVaultBalance = await vault.balance();
      console.log(`newVaultBalance: ${newVaultBalance}`);
      const whaleDepositAmount = ethers.utils.parseEther("133728");
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(xStakingPoolController);
      await strategy.connect(self).harvest();
      const newVaultBalance2 = await vault.balance();
      console.log(`newVaultBalance2: ${newVaultBalance2}`);
      const totalDepositAmount = depositAmount.add(whaleDepositAmount);
      console.log(`totalDepositAmount: ${totalDepositAmount}`);
      const hasYield = newVaultBalance2 > totalDepositAmount;
      console.log(`hasYield: ${hasYield}`);
      expect(hasYield).to.equal(true);
    });
  });
  describe("Strategy", function () {
    xit("should be able to remove a pool", async function () {
      await strategy.connect(self).harvest();
      const whaleDepositAmount = ethers.utils.parseEther("133728");
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
      await strategy.connect(self).harvest();

      const wftmPoolId = 0;
      const wftmIndex = 0;
      const wftmPoolBalance = await strategy.poolxTarotBalance(wftmPoolId);
      console.log(`wftmPoolBalance: ${wftmPoolBalance}`);
      const vaultBalance = await vault.balance();

      const tx = await strategy.removeUsedPool(wftmIndex);
      await tx.wait();

      const newVaultBalance = await vault.balance();
      const newWftmPoolBalance = await strategy.poolxTarotBalance(wftmPoolId);
      console.log(`newWftmPoolBalance: ${newWftmPoolBalance}`);

      // Make sure harvest can run without error after removing
      await strategy.connect(self).harvest();
      console.log(`vaultBalance: ${vaultBalance}`);
      console.log(`newVaultBalance: ${newVaultBalance}`);

      const isSmallBalanceDifference =
        Math.abs(vaultBalance.sub(newVaultBalance)) < 5;

      expect(newWftmPoolBalance).to.equal(0);
      expect(isSmallBalanceDifference).to.equal(true);
    });
    xit("should be able to pause and unpause", async function () {
      await strategy.pause();
      const depositAmount = ethers.utils.parseEther(".05");
      await expect(vault.connect(self).deposit(depositAmount)).to.be.reverted;
      await strategy.unpause();
      await expect(vault.connect(self).deposit(depositAmount)).to.not.be
        .reverted;
    });
    xit("should be able to panic", async function () {
      const depositAmount = ethers.utils.parseEther(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      await strategy.panic();

      expect(vaultBalance).to.equal(strategyBalance);
      // Accounting is not updated when panicking so newVaultBalance is 2x expected
      await strategy.updateInternalAccounting();
      const newVaultBalance = await vault.balance();
      const newStrategyBalance = await strategy.balanceOf();
      expect(newVaultBalance).to.equal(vaultBalance);
      expect(newStrategyBalance).to.equal(0);
    });
    xit("should be able to retire strategy", async function () {
      const depositAmount = ethers.utils.parseEther(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      expect(vaultBalance).to.equal(strategyBalance);
      // Test needs the require statement to be commented out during the test
      await expect(strategy.retireStrat()).to.not.be.reverted;
      const newVaultBalance = await vault.balance();
      const newStrategyBalance = await strategy.balanceOf();
      expect(newVaultBalance).to.equal(vaultBalance);
      expect(newStrategyBalance).to.equal(0);
    });
    xit("should be able to retire strategy with no balance", async function () {
      // Test needs the require statement to be commented out during the test
      await expect(strategy.retireStrat()).to.not.be.reverted;
    });
    xit("should be able to estimate harvest", async function () {
      const whaleDepositAmount = ethers.utils.parseEther("133728");
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
      await strategy.harvest();
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(xStakingPoolController);
      const [profit, callFeeToUser] = await strategy.estimateHarvest();
      const hasProfit = profit.gt(0);
      const hasCallFee = callFeeToUser.gt(0);
      expect(hasProfit).to.equal(true);
      expect(hasCallFee).to.equal(true);
    });
    xit("should be able to check internal accounting", async function () {
      const whaleDepositAmount = ethers.utils.parseEther("133728");
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
      await strategy.harvest();
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(xStakingPoolController);
      const isAccurate = await strategy.isInternalAccountingAccurate();
      expect(isAccurate).to.equal(true);
    });
    xit("should be able to update internal accounting", async function () {
      const whaleDepositAmount = ethers.utils.parseEther("133728");
      await vault.connect(xTarotWhale).deposit(whaleDepositAmount);
      await strategy.harvest();
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(xStakingPoolController);
      await expect(strategy.updateInternalAccounting()).to.not.be.reverted;
    });
    xit("cannot add pools past the max cap", async function () {
      const TFTM_ID = 0;
      const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

      const maxCap = 15;
      for (let index = 0; index < maxCap; index++) {
        console.log(index);
        if (index < maxCap - 1) {
          await expect(strategy.addUsedPool(TFTM_ID, [WFTM, WFTM])).to.not.be
            .reverted;
        } else {
          await expect(strategy.addUsedPool(TFTM_ID, [WFTM, WFTM])).to.be
            .reverted;
          console.log("reverted");
        }
      }
    });
  });
});
