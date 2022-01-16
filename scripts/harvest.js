const hre = require("hardhat");

async function main() {
  const strategyAddress = "0x88DbE71408DC20C82Ce44d919D7f521717352636";
  const Strategy = await ethers.getContractFactory("ReaperAutoCompoundXBoo");
  const strategy = Strategy.attach(strategyAddress);
  const options = { gasPrice: 1000000000000, gasLimit: 9000000 };
  await strategy.harvest(options);
  console.log("harvested!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
