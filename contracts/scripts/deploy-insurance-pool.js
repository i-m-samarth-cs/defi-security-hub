const hre = require("hardhat");

async function main() {
  console.log("Deploying InsurancePool contract...");

  const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy();

  await insurancePool.deployed();

  console.log("InsurancePool deployed to:", insurancePool.address);
  
  // Initial setup
  console.log("\nInitial pool configuration:");
  console.log("- Emergency cap per claim: 0.5 ETH");
  console.log("- Max reserve per claim: 5 ETH");
  console.log("- Cooldown period: 7 days");
  console.log("- Fee percentage: 2.5%");
  
  // Optionally replenish emergency pool
  const replenishAmount = hre.ethers.utils.parseEther("10");
  console.log("\nReplenishing emergency pool with 10 ETH...");
  const tx = await insurancePool.replenishPool({ value: replenishAmount });
  await tx.wait();
  console.log("Emergency pool replenished!");

  console.log("\n✅ Deployment complete!");
  console.log("\nContract address:", insurancePool.address);
  console.log("\nAdd this address to your .env file:");
  console.log(`INSURANCE_POOL_ADDRESS=${insurancePool.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
