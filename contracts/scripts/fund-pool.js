require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const poolAddress = process.env.INSURANCE_POOL_ADDRESS;
  const mainPoolAmount = process.env.MAIN_POOL_AMOUNT || "10.0";
  const emergencyPoolAmount = process.env.EMERGENCY_POOL_AMOUNT || "1.0";

  if (!poolAddress) {
    console.error("INSURANCE_POOL_ADDRESS not set in .env");
    process.exit(1);
  }

  const [funder] = await hre.ethers.getSigners();
  console.log("Funding pool with account:", funder.address);

  const pool = await hre.ethers.getContractAt("InsurancePool", poolAddress);

  console.log(`\nDepositing ${mainPoolAmount} ETH to main pool...`);
  let tx = await pool.depositToPool({ 
    value: hre.ethers.parseEther(mainPoolAmount) 
  });
  await tx.wait();
  console.log("✅ Main pool funded");

  console.log(`\nDepositing ${emergencyPoolAmount} ETH to emergency pool...`);
  tx = await pool.depositToEmergencyPool({ 
    value: hre.ethers.parseEther(emergencyPoolAmount) 
  });
  await tx.wait();
  console.log("✅ Emergency pool funded");

  const balance = await pool.getPoolBalance();
  const emergencyBalance = await pool.emergencyPoolBalance();
  
  console.log("\n📊 Pool Status:");
  console.log("Total Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Emergency Pool:", hre.ethers.formatEther(emergencyBalance), "ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
