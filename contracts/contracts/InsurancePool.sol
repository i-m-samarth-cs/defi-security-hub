// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract InsurancePool is ReentrancyGuard, AccessControl {
    bytes32 public constant UNDERWRITER_ROLE = keccak256("UNDERWRITER_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    struct Claim {
        address claimant;
        bytes32 incidentCid;
        uint256 reservedAmount;
        uint256 emergencyPaid;
        uint256 finalPayout;
        bool finalized;
        bool approved;
    }

    // Pool state
    uint256 public totalDeposits;
    uint256 public reservedAmount;
    uint256 public emergencyPoolBalance;
    uint256 public totalShares;
    
    // Pool parameters
    uint256 public emergencyCapPerClaim = 0.5 ether;
    uint256 public maxReservePerClaim = 5 ether;
    uint256 public cooldownPeriod = 7 days;
    uint256 public feePercentage = 250; // 2.5% in basis points
    
    // Mappings
    mapping(address => uint256) public lpShares;
    mapping(address => uint256) public withdrawRequests;
    mapping(address => uint256) public withdrawRequestTime;
    mapping(uint256 => Claim) public claims;
    uint256 public claimCounter;

    // Events
    event Deposit(address indexed lp, uint256 amount, uint256 shares);
    event WithdrawRequested(address indexed lp, uint256 amount, uint256 availableAt);
    event Withdraw(address indexed lp, uint256 amount);
    event ClaimReserved(uint256 indexed claimId, address indexed claimant, bytes32 incidentCid, uint256 amount);
    event EmergencyPayout(uint256 indexed claimId, address indexed to, uint256 amount);
    event ClaimFinalized(uint256 indexed claimId, bool approved, uint256 payoutAmount);
    event PoolReplenished(uint256 amount);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UNDERWRITER_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }

    // LP Functions
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        uint256 shares;
        if (totalShares == 0) {
            shares = msg.value;
        } else {
            shares = (msg.value * totalShares) / availableLiquidity();
        }
        
        lpShares[msg.sender] += shares;
        totalShares += shares;
        totalDeposits += msg.value;
        
        emit Deposit(msg.sender, msg.value, shares);
    }

    function requestWithdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(lpShares[msg.sender] > 0, "No LP position");
        
        uint256 lpValue = (lpShares[msg.sender] * availableLiquidity()) / totalShares;
        require(amount <= lpValue, "Insufficient balance");
        
        withdrawRequests[msg.sender] = amount;
        withdrawRequestTime[msg.sender] = block.timestamp;
        
        emit WithdrawRequested(msg.sender, amount, block.timestamp + cooldownPeriod);
    }

    function withdraw() external nonReentrant {
        uint256 amount = withdrawRequests[msg.sender];
        require(amount > 0, "No pending withdrawal");
        require(block.timestamp >= withdrawRequestTime[msg.sender] + cooldownPeriod, "Cooldown period not met");
        require(amount <= availableLiquidity(), "Insufficient liquidity");
        
        uint256 sharesToBurn = (amount * totalShares) / availableLiquidity();
        
        lpShares[msg.sender] -= sharesToBurn;
        totalShares -= sharesToBurn;
        totalDeposits -= amount;
        
        delete withdrawRequests[msg.sender];
        delete withdrawRequestTime[msg.sender];
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdraw(msg.sender, amount);
    }

    // Claim Functions
    function reserveClaim(
        address claimant,
        bytes32 incidentCid,
        uint256 claimCap
    ) external onlyRole(RELAYER_ROLE) returns (uint256) {
        require(claimCap <= maxReservePerClaim, "Claim cap exceeds maximum");
        require(claimCap <= availableLiquidity(), "Insufficient liquidity");
        
        claimCounter++;
        claims[claimCounter] = Claim({
            claimant: claimant,
            incidentCid: incidentCid,
            reservedAmount: claimCap,
            emergencyPaid: 0,
            finalPayout: 0,
            finalized: false,
            approved: false
        });
        
        reservedAmount += claimCap;
        
        emit ClaimReserved(claimCounter, claimant, incidentCid, claimCap);
        return claimCounter;
    }

    function emergencyPayout(
        uint256 claimId,
        address payable to,
        uint256 amount
    ) external onlyRole(UNDERWRITER_ROLE) nonReentrant {
        Claim storage claim = claims[claimId];
        require(!claim.finalized, "Claim already finalized");
        require(amount <= emergencyCapPerClaim, "Exceeds emergency cap");
        require(amount <= claim.reservedAmount, "Exceeds reserved amount");
        require(claim.emergencyPaid == 0, "Emergency payout already made");
        
        claim.emergencyPaid = amount;
        emergencyPoolBalance -= amount;
        
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit EmergencyPayout(claimId, to, amount);
    }

    function finalizeClaim(
        uint256 claimId,
        bool approved,
        uint256 payoutAmount
    ) external onlyRole(UNDERWRITER_ROLE) nonReentrant {
        Claim storage claim = claims[claimId];
        require(!claim.finalized, "Claim already finalized");
        require(payoutAmount <= claim.reservedAmount, "Payout exceeds reserved");
        
        claim.finalized = true;
        claim.approved = approved;
        claim.finalPayout = payoutAmount;
        
        reservedAmount -= claim.reservedAmount;
        
        if (approved && payoutAmount > claim.emergencyPaid) {
            uint256 remainingPayout = payoutAmount - claim.emergencyPaid;
            (bool success, ) = payable(claim.claimant).call{value: remainingPayout}("");
            require(success, "Transfer failed");
        } else if (!approved && claim.emergencyPaid > 0) {
            // Return emergency payout to pool if claim rejected
            emergencyPoolBalance += claim.emergencyPaid;
        }
        
        emit ClaimFinalized(claimId, approved, payoutAmount);
    }

    // Admin Functions
    function replenishPool() external payable onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyPoolBalance += msg.value;
        emit PoolReplenished(msg.value);
    }

    function updateEmergencyCap(uint256 newCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emergencyCapPerClaim = newCap;
    }

    function updateMaxReserve(uint256 newMax) external onlyRole(DEFAULT_ADMIN_ROLE) {
        maxReservePerClaim = newMax;
    }

    function updateCooldown(uint256 newCooldown) external onlyRole(DEFAULT_ADMIN_ROLE) {
        cooldownPeriod = newCooldown;
    }

    // View Functions
    function availableLiquidity() public view returns (uint256) {
        return totalDeposits - reservedAmount;
    }

    function getLPValue(address lp) external view returns (uint256) {
        if (totalShares == 0) return 0;
        return (lpShares[lp] * availableLiquidity()) / totalShares;
    }

    function getClaim(uint256 claimId) external view returns (Claim memory) {
        return claims[claimId];
    }
}
