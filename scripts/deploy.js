const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const usdtAddress = "0x55d398326f99059fF775485246999027B3197955";
  const gbrAddress = "0xa970cae9fa1d7cca913b7c19df45bf33d55384a9";

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ContractFactory = await hre.ethers.getContractFactory("GBRSwapToken");
  const contract = await ContractFactory.deploy(usdtAddress, gbrAddress);

  await contract.deployed();

  console.log("GBRSwapToken deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
