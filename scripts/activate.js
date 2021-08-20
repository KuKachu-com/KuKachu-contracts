// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const KuKachuBSC = await hre.ethers.getContractFactory("KuKachuBSC");
  const token = KuKachuBSC.attach("0x980E6D8f53ae7d49e3C007A0Ff24ebA41D30213D");
 
  const result = await token.activate({ from: deployer.address });
  console.log('***** result => ', result);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
