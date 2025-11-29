require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
  console.log("Deploying InsurancePool...");
  
  const pool = await InsurancePool.deploy();
  await pool.waitForDeployment();

  const poolAddress = await pool.getAddress();
  console.log("\n✅ InsurancePool deployed to:", poolAddress);
  console.log("\nAdd this to your .env file:");
  console.log(`INSURANCE_POOL_ADDRESS=${poolAddress}`);
  
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${poolAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
