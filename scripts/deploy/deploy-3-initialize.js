async function main() {
  const vaultAddress = "0x38740F0b12D14f27BEC34Ee5F8D3Dc54A0D3a799";
  const strategyAddress = "0x88DbE71408DC20C82Ce44d919D7f521717352636";

  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");
  const vault = Vault.attach(vaultAddress);

  //const options = { gasPrice: 2000000000000, gasLimit: 9000000 };
  await vault.initialize(strategyAddress);
  console.log("Vault initialized");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
