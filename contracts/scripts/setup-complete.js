require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("🚀 Complete Setup Starting...\n");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // 1. Deploy
  console.log("📝 Step 1: Deploying InsurancePool...");
  const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
  const pool = await InsurancePool.deploy();
  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();
  console.log("✅ Deployed to:", poolAddress);

  // 2. Grant roles
  console.log("\n🔐 Step 2: Granting roles...");
  const ORACLE_ROLE = await pool.ORACLE_ROLE();
  const UNDERWRITER_ROLE = await pool.UNDERWRITER_ROLE();
  
  await pool.grantRole(ORACLE_ROLE, deployer.address);
  console.log("✅ Oracle role granted to deployer");
  
  await pool.grantRole(UNDERWRITER_ROLE, deployer.address);
  console.log("✅ Underwriter role granted to deployer");

  // 3. Fund pools
  console.log("\n💰 Step 3: Funding pools...");
  let tx = await pool.depositToPool({ value: hre.ethers.parseEther("10.0") });
  await tx.wait();
  console.log("✅ Main pool funded: 10 ETH");

  tx = await pool.depositToEmergencyPool({ value: hre.ethers.parseEther("1.0") });
  await tx.wait();
  console.log("✅ Emergency pool funded: 1 ETH");

  // 4. Verify
  console.log("\n📊 Step 4: Verifying setup...");
  const balance = await pool.getPoolBalance();
  const emergencyBalance = await pool.emergencyPoolBalance();
  const hasOracleRole = await pool.hasRole(ORACLE_ROLE, deployer.address);
  const hasUnderwriterRole = await pool.hasRole(UNDERWRITER_ROLE, deployer.address);

  console.log("Total Balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("Emergency Pool:", hre.ethers.formatEther(emergencyBalance), "ETH");
  console.log("Oracle Role:", hasOracleRole ? "✅" : "❌");
  console.log("Underwriter Role:", hasUnderwriterRole ? "✅" : "❌");

  console.log("\n🎉 Setup Complete!\n");
  console.log("Add to your backend/.env:");
  console.log(`INSURANCE_POOL_ADDRESS=${poolAddress}`);
  console.log(`PRIVATE_KEY=${process.env.PRIVATE_KEY || "your-oracle-private-key"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
