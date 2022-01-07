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
  const i = 0;
  let Vault;
  let Strategy;
  let Treasury;
  let Boo;
  let Acelab;
  let vault;
  let strategy;
  let treasury;
  let boo;
  let booAddress = "0x841FAD6EAe12c286d1Fd18d1d525DFfA75C7EFFE";
  let xBooAddress = "0xa48d959AE2E88f1dAA7D5F611E01908106dE7598";
  let acelab;
  let self;
  let booWhale;
  let bigBooWhale;
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
            blockNumber: 26880530,
          },
        },
      ],
    });
    console.log("providers");
    //get signers
    [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();
    const booHolder = "0xb76922bd6747a5a80088f62560e195f17c43e4dd";
    const booWhaleAddress = "0x7ccf7aa75f05f811c478569f939bd325b15cd1bf";
    const bigBooWhaleAddress = "0xe0c15e9fe90d56472d8a43da5d3ef34ae955583c";
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [booHolder],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [booWhaleAddress],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [bigBooWhaleAddress],
    });
    self = await ethers.provider.getSigner(booHolder);
    booWhale = await ethers.provider.getSigner(booWhaleAddress);
    bigBooWhale = await ethers.provider.getSigner(bigBooWhaleAddress);
    await self.sendTransaction({
      to: bigBooWhaleAddress,
      value: ethers.utils.parseEther("0.1"),
    });
    selfAddress = await self.getAddress();
    ownerAddress = await owner.getAddress();
    console.log("addresses");

    //get artifacts
    Strategy = await ethers.getContractFactory("ReaperAutoCompoundXBoo");
    Vault = await ethers.getContractFactory("ReaperVaultv1_3");
    Treasury = await ethers.getContractFactory("ReaperTreasury");
    Boo = await ethers.getContractFactory("SpookyToken");
    Acelab = await ethers.getContractFactory("AceLab");
    console.log("artifacts");

    //deploy contracts
    treasury = await Treasury.deploy();
    console.log("treasury");
    boo = await Boo.attach(booAddress);
    const aceLabAddress = "0x2352b745561e7e6FCD03c093cE7220e3e126ace0";
    acelab = await Acelab.attach(aceLabAddress);
    console.log("boo attached");
    vault = await Vault.deploy(
      booAddress,
      "XBOO Single Stake Vault",
      "rfXBOO",
      432000,
      0,
      ethers.utils.parseEther("999999")
    );
    console.log("vault");

    const uniRouter = "0xF491e7B69E4244ad4002BC14e878a34207E38c29";
    console.log(`vault.address: ${vault.address}`);
    console.log(`treasury.address: ${treasury.address}`);

    const WFTM_ID = 2;
    const FOO_ID = 3;
    const WOO_ID = 8;
    const TREEB_ID = 9;
    const FONT_ID = 10;
    const LQDR_ID = 11;
    const YEL_ID = 16;
    const TUSD_ID = 17;
    const YOSHI_ID = 18;
    const SPA_ID = 19;
    const HEC_ID = 21;
    const OOE_ID = 22;

    const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
    const FOO = "0xFbc3c04845162F067A0B6F8934383E63899c3524";
    const WOO = "0x6626c47c00F1D87902fc13EECfaC3ed06D5E8D8a";
    const TREEB = "0xc60D7067dfBc6f2caf30523a064f416A5Af52963";
    const FONT = "0xbbc4A8d076F4B1888fec42581B6fc58d242CF2D5";
    const LQDR = "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9";
    const YEL = "0xD3b71117E6C1558c1553305b44988cd944e97300";
    const TUSD = "0x9879aBDea01a879644185341F7aF7d8343556B7a";
    const YOSHI = "0x3dc57B391262e3aAe37a08D91241f9bA9d58b570";
    const SPA = "0x5602df4A94eB6C680190ACCFA2A475621E0ddBdc";
    const HEC = "0x5C4FDfc5233f935f20D2aDbA572F770c2E377Ab0";
    const OOE = "0x9d8F97A3C2f9f397B6D46Cbe2d39CC1D8Cf19010";

    // Intermediate tokens
    const USDC = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
    const DAI = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e";

    strategy = await Strategy.deploy(
      uniRouter,
      aceLabAddress,
      booAddress,
      xBooAddress,
      vault.address,
      treasury.address
    );
    console.log("strategy");

    const TUSD_PATHS = [TUSD, USDC, WFTM];
    const SPA_PATHS = [SPA, DAI, WFTM];
    const HEC_PATHS = [HEC, DAI, WFTM];

    const tx1 = await strategy.addUsedPool(WFTM_ID, [WFTM, WFTM]);
    const tx2 = await strategy.addUsedPool(FOO_ID, [FOO, WFTM]);
    const tx3 = await strategy.addUsedPool(WOO_ID, [WOO, WFTM]);
    const tx4 = await strategy.addUsedPool(TREEB_ID, [TREEB, WFTM]);
    const tx5 = await strategy.addUsedPool(FONT_ID, [FONT, WFTM]);
    const tx6 = await strategy.addUsedPool(LQDR_ID, [LQDR, WFTM]);
    const tx7 = await strategy.addUsedPool(YEL_ID, [YEL, WFTM]);
    const tx8 = await strategy.addUsedPool(TUSD_ID, TUSD_PATHS);
    const tx9 = await strategy.addUsedPool(YOSHI_ID, [YOSHI, WFTM]);
    const tx10 = await strategy.addUsedPool(SPA_ID, SPA_PATHS);
    const tx11 = await strategy.addUsedPool(HEC_ID, HEC_PATHS);
    const tx12 = await strategy.addUsedPool(OOE_ID, [OOE, WFTM]);
    await tx1.wait();
    await tx2.wait();
    await tx3.wait();
    await tx4.wait();
    await tx5.wait();
    await tx6.wait();
    await tx7.wait();
    await tx8.wait();
    await tx9.wait();
    await tx10.wait();
    await tx11.wait();
    await tx12.wait();

    await vault.initialize(strategy.address);

    console.log(`Strategy deployed to ${strategy.address}`);
    console.log(`Vault deployed to ${vault.address}`);
    console.log(`Treasury deployed to ${treasury.address}`);

    //approving LP token and vault share spend
    await boo.approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals1");
    await vault.approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals2");
    await boo
      .connect(self)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvalsi");
    await vault
      .connect(self)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals4");
    await boo
      .connect(booWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals5");
    await vault
      .connect(booWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    await boo
      .connect(bigBooWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals5");
    await vault
      .connect(bigBooWhale)
      .approve(vault.address, ethers.utils.parseEther("1000000000"));
    console.log("approvals6");
  });

  xdescribe("Deploying the vault and strategy", function () {
    xit("should initiate vault with a 0 balance", async function () {
      console.log(1);
      const totalBalance = await vault.balance();
      console.log(2);
      const availableBalance = await vault.available();
      console.log(i);
      const pricePerFullShare = await vault.getPricePerFullShare();
      console.log(4);
      expect(totalBalance).to.equal(0);
      console.log(5);
      expect(availableBalance).to.equal(0);
      console.log(6);
      expect(pricePerFullShare).to.equal(ethers.utils.parseEther("1"));
    });
  });
  xdescribe("Vault Tests", function () {
    xit("should allow deposits and account for them correctly", async function () {
      const userBalance = await boo.balanceOf(selfAddress);
      console.log(1);
      console.log(`userBalance: ${userBalance}`);
      const vaultBalance = await vault.balance();
      console.log("vaultBalance");
      console.log(vaultBalance);
      console.log(2);
      const depositAmount = ethers.utils.parseEther(".1");
      console.log("depositAmount");
      console.log(depositAmount);
      console.log(i);
      await vault.connect(self).deposit(depositAmount);
      console.log(4);
      const newVaultBalance = await vault.balance();
      console.log(`newVaultBalance: ${newVaultBalance}`);
      console.log(`depositAmount: ${depositAmount}`);
      const newUserBalance = await boo.balanceOf(selfAddress);

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
      const isSmallBalanceDifference = depositAmount.sub(newVaultBalance) < 5;
      expect(vaultBalance).to.equal(0);
      expect(isSmallBalanceDifference).to.equal(true);
      expect(deductedAmount).to.equal(depositAmount);
    });
    it("should mint user their pool share", async function () {
      console.log("---------------------------------------------");
      const userBalance = await boo.balanceOf(selfAddress);
      console.log(userBalance.toString());
      const selfDepositAmount = ethers.utils.parseEther("0.005");
      await vault.connect(self).deposit(selfDepositAmount);
      console.log((await vault.balance()).toString());

      const whaleDepositAmount = ethers.utils.parseEther("100");
      await vault.connect(booWhale).deposit(whaleDepositAmount);
      console.log((await vault.balance()).toString());
      // console.log((await boo.balanceOf(selfAddress)).toString());
      // const selfBooBalance = await vault.balanceOf(selfAddress);
      // console.log(selfBooBalance.toString());
      const ownerDepositAmount = ethers.utils.parseEther("5");
      await boo.connect(self).transfer(ownerAddress, ownerDepositAmount);
      const ownerBalance = await boo.balanceOf(ownerAddress);

      console.log(ownerBalance.toString());
      await vault.deposit(ownerDepositAmount);
      console.log((await vault.balance()).toString());
      const ownerVaultBooBalance = await vault.balanceOf(ownerAddress);
      console.log(ownerVaultBooBalance.toString());
      await vault.withdraw(ownerVaultBooBalance);
      const ownerBooBalance = await boo.balanceOf(ownerAddress);
      console.log(`ownerBooBalance: ${ownerBooBalance}`);
      const ownerVaultBooBalanceAfterWithdraw = await vault.balanceOf(
        ownerAddress
      );
      console.log(
        `ownerVaultBooBalanceAfterWithdraw: ${ownerVaultBooBalanceAfterWithdraw}`
      );
      // expect(ownerBooBalance).to.equal(ownerDepositAmount);
      // expect(selfBooBalance).to.equal(selfDepositAmount);
    });
    xit("should allow withdrawals", async function () {
      const userBalance = await boo.balanceOf(selfAddress);
      console.log(`userBalance: ${userBalance}`);
      const depositAmount = ethers.BigNumber.from(ethers.utils.parseEther("1"));
      await vault.connect(self).deposit(depositAmount);
      console.log(
        `await boo.balanceOf(selfAddress): ${await boo.balanceOf(selfAddress)}`
      );
      const whaleDepositAmount = ethers.utils.parseEther("100");
      await vault.connect(booWhale).deposit(whaleDepositAmount);
      const newUserBalance = userBalance.sub(depositAmount);
      const tokenBalance = await boo.balanceOf(selfAddress);
      const balanceDifferenceIsZero = tokenBalance.sub(newUserBalance).isZero();
      expect(balanceDifferenceIsZero).to.equal(true);
      await vault.connect(self).withdraw(depositAmount);
      console.log(
        `await boo.balanceOf(selfAddress): ${await boo.balanceOf(selfAddress)}`
      );
      const newUserVaultBalance = await vault.balanceOf(selfAddress);
      console.log(`newUserVaultBalance: ${newUserVaultBalance}`);
      const userBalanceAfterWithdraw = await boo.balanceOf(selfAddress);
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
  describe("Strategy", function () {
    xit("should be able to remove a pool", async function () {
      await strategy.connect(self).harvest();
      const bigWhaleDepositAmount = ethers.utils.parseEther("327171");
      await vault.connect(bigBooWhale).deposit(bigWhaleDepositAmount);
      await strategy.connect(self).harvest();

      const treebPoolId = 9;
      const treebIndex = 3;
      const treebPoolBalance = await strategy.poolxBooBalance(treebPoolId);
      console.log(`treebPoolBalance: ${treebPoolBalance}`);
      const vaultBalance = await vault.balance();

      const tx = await strategy.removeUsedPool(treebIndex);
      await tx.wait();

      const newVaultBalance = await vault.balance();
      const newTreebPoolBalance = await strategy.poolxBooBalance(treebPoolId);
      console.log(`newTreebPoolBalance: ${newTreebPoolBalance}`);

      // Make sure harvest can run without error after removing
      await strategy.connect(self).harvest();

      expect(newTreebPoolBalance).to.equal(0);
      expect(vaultBalance).to.equal(newVaultBalance);
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
      const newVaultBalance = await vault.balance();
      const newStrategyBalance = await strategy.balanceOf();
      expect(vaultBalance).to.equal(strategyBalance);
      // Accounting is not updated when panicking so newVaultBalance is 2x expected
      //expect(newVaultBalance).to.equal(vaultBalance);
      // It looks like the strategy still has balance because panic does not update balance
      //expect(newStrategyBalance).to.equal(0);
    });
    xit("should be able to retire strategy", async function () {
      // Test needs the require statement to be commented out during the test
      const depositAmount = ethers.utils.parseEther(".05");
      await vault.connect(self).deposit(depositAmount);
      const vaultBalance = await vault.balance();
      const strategyBalance = await strategy.balanceOf();
      await strategy.retireStrat();
      const newVaultBalance = await vault.balance();
      const newStrategyBalance = await strategy.balanceOf();
      // const userBalance = await vault.balanceOf(selfAddress);
      // console.log(`userBalance: ${userBalance}`);
      // await vault.connect(self).withdraw(userBalance);
      expect(vaultBalance).to.equal(strategyBalance);
      // expect(newVaultBalance).to.equal(vaultBalance);
      expect(newStrategyBalance).to.equal(0);
    });
    it("should be able to estimate harvest", async function () {
      const bigWhaleDepositAmount = ethers.utils.parseEther("327171");
      await vault.connect(bigBooWhale).deposit(bigWhaleDepositAmount);
      await strategy.harvest();
      const minute = 60;
      const hour = 60 * minute;
      const day = 24 * hour;
      await moveTimeForward(10 * day);
      await updatePools(acelab);
      const [profit, callFeeToUser] = await strategy.estimateHarvest();
      const hasProfit = profit.gt(0);
      const hasCallFee = callFeeToUser.gt(0);
      expect(hasProfit).to.equal(true);
      expect(hasCallFee).to.equal(true);
    });
  });
});
