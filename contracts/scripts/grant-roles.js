require('dotenv').config();
const hre = require("hardhat");

async function main() {
  const poolAddress = process.env.INSURANCE_POOL_ADDRESS;
  const oracleAddress = process.env.ORACLE_WALLET_ADDRESS;
  const underwriterAddress = process.env.UNDERWRITER_WALLET_ADDRESS;

  if (!poolAddress || !oracleAddress || !underwriterAddress) {
    console.error("Missing required addresses in .env");
    process.exit(1);
  }

  const pool = await hre.ethers.getContractAt("InsurancePool", poolAddress);
  
  const ORACLE_ROLE = await pool.ORACLE_ROLE();
  const UNDERWRITER_ROLE = await pool.UNDERWRITER_ROLE();

  console.log("Granting Oracle role to:", oracleAddress);
  let tx = await pool.grantRole(ORACLE_ROLE, oracleAddress);
  await tx.wait();
  console.log("✅ Oracle role granted");

  console.log("Granting Underwriter role to:", underwriterAddress);
  tx = await pool.grantRole(UNDERWRITER_ROLE, underwriterAddress);
  await tx.wait();
  console.log("✅ Underwriter role granted");

  console.log("\nRoles configured successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
