// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const KuKachuBSC = await hre.ethers.getContractFactory("KuKachuBSC");
  const token = await KuKachuBSC.deploy();
  await token.deployed();
  console.log("KuKachuBSC deployed to:", token.address);

  await hre.run("verify:verify", {
    address: token.address,
    constructorArguments: [],
  });

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
