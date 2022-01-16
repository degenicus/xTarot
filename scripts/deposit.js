const hre = require("hardhat");

async function main() {
  const vaultAddress = "0x38740F0b12D14f27BEC34Ee5F8D3Dc54A0D3a799";
  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");
  const vault = Vault.attach(vaultAddress);
  const options = { gasPrice: 1000000000000, gasLimit: 9000000 };
  await vault.deposit(ethers.utils.parseEther("0.01"), options);
  console.log("deposited!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
