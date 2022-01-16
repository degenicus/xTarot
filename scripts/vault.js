const getVault = async () => {
  const vaultAddress = "0x38740F0b12D14f27BEC34Ee5F8D3Dc54A0D3a799";
  const Vault = await ethers.getContractFactory("ReaperVaultv1_3");
  const vault = Vault.attach(vaultAddress);
  return vault;
};

module.exports = { getVault };
