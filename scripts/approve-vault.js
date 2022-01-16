async function main() {
  const vaultAddress = "0x38740F0b12D14f27BEC34Ee5F8D3Dc54A0D3a799";
  const ERC20 = await ethers.getContractFactory(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol"
  );
  const xTarotAddress = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4";
  const xTarot = await ERC20.attach(xTarotAddress);
  await xTarot.approve(vaultAddress, ethers.utils.parseEther("100"));
  console.log("Boo approved");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
