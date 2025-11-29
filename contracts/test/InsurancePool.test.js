const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InsurancePool", function () {
  let pool, owner, oracle, underwriter, user;

  beforeEach(async function () {
    [owner, oracle, underwriter, user] = await ethers.getSigners();
    
    const InsurancePool = await ethers.getContractFactory("InsurancePool");
    pool = await InsurancePool.deploy();
    
    const ORACLE_ROLE = await pool.ORACLE_ROLE();
    const UNDERWRITER_ROLE = await pool.UNDERWRITER_ROLE();
    
    await pool.grantRole(ORACLE_ROLE, oracle.address);
    await pool.grantRole(UNDERWRITER_ROLE, underwriter.address);
    
    await pool.depositToPool({ value: ethers.parseEther("10") });
    await pool.depositToEmergencyPool({ value: ethers.parseEther("1") });
  });

  it("Should reserve a claim", async function () {
    const evidenceCID = ethers.id("QmTest123");
    const amount = ethers.parseEther("1");
    
    await expect(pool.connect(oracle).reserveClaim(user.address, evidenceCID, amount))
      .to.emit(pool, "ClaimReserved")
      .withArgs(1, user.address, evidenceCID, amount);
    
    const claim = await pool.claims(1);
    expect(claim.claimant).to.equal(user.address);
    expect(claim.reservedAmount).to.equal(amount);
  });

  it("Should process emergency payout", async function () {
    const evidenceCID = ethers.id("QmTest123");
    await pool.connect(oracle).reserveClaim(user.address, evidenceCID, ethers.parseEther("1"));
    
    const payoutAmount = ethers.parseEther("0.05");
    await expect(pool.connect(oracle).emergencyPayout(1, payoutAmount))
      .to.emit(pool, "EmergencyPayout");
  });

  it("Should finalize claim", async function () {
    const evidenceCID = ethers.id("QmTest123");
    await pool.connect(oracle).reserveClaim(user.address, evidenceCID, ethers.parseEther("1"));
    
    await expect(pool.connect(underwriter).finalizeClaim(1, true, ethers.parseEther("0.8")))
      .to.emit(pool, "ClaimFinalized");
  });
});
