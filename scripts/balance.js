const { getVault } = require("./vault");

async function main() {
  const vaultAddress = "0x38740F0b12D14f27BEC34Ee5F8D3Dc54A0D3a799";
  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");
  contract = new ethers.Contract(
    vaultAddress,
    Contract.interface,
    ethers.getDefaultProvider()
  );
  const vault = Vault.attach(vaultAddress);
  const options = { gasPrice: 1000000000000, gasLimit: 9000000 };
  const balance = await vault.balance(options);
  console.log(`balance: ${balance}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
