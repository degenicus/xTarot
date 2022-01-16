async function main() {
  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");

  const xTarotAddress = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4";
  const tokenName = "XTAROT Single Stake Vault";
  const tokenSymbol = "rfXTAROT";
  const approvalDelay = 86400;
  const depositFee = 0;
  const tvlCap = ethers.utils.parseEther("3333");

  const vault = await Vault.deploy(
    xTarotAddress,
    tokenName,
    tokenSymbol,
    approvalDelay,
    depositFee,
    tvlCap
  );

  await vault.deployed();
  console.log("Vault deployed to:", vault.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
