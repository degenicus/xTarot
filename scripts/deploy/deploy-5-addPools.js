async function main() {
  const strategyAddress = "0x88DbE71408DC20C82Ce44d919D7f521717352636";

  const Strategy = await ethers.getContractFactory("ReaperAutoCompoundXTarot");
  const strategy = Strategy.attach(strategyAddress);

  const TFTM_ID = 0;
  const WFTM = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";

  const tx1 = await strategy.addUsedPool(TFTM_ID, [WFTM, WFTM]);
  await tx1.wait();
  console.log("Pools added to strategy");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
