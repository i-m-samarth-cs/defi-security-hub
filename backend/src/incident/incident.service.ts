import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';
// import { create } from 'ipfs-http-client';

@Injectable()
export class IncidentService {
  private supabase;
  private ipfs;
  private provider;
  private wallet;
  private poolContract;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_KEY || 'placeholder-key'
    );
    
    // this.ipfs = create({ url: process.env.IPFS_API_URL });
    this.ipfs = { add: async (data: string) => ({ cid: { toString: () => 'QmMockCID' + Date.now() } }) }; // Mock IPFS for now
    
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    const poolAbi = [
      'function reserveClaim(address,bytes32,uint256) returns (uint256)',
      'function emergencyPayout(uint256,uint256)',
    ];
    this.poolContract = new ethers.Contract(
      process.env.INSURANCE_POOL_ADDRESS,
      poolAbi,
      this.wallet
    );
  }

  async createIncident(data: any) {
    const evidenceBundle = {
      txHash: data.txHash,
      from: data.from,
      to: data.to,
      originDomain: data.originDomain,
      timestamp: new Date().toISOString(),
      screenshot: data.screenshot,
    };

    const { cid } = await this.ipfs.add(JSON.stringify(evidenceBundle));
    const cidString = cid.toString();

    const { data: incident, error } = await this.supabase
      .from('incidents')
      .insert({
        wallet_address: data.from,
        tx_hash: data.txHash,
        evidence_cid: cidString,
        score: data.score,
        status: 'reported',
      })
      .select()
      .single();

    if (error) throw error;
    return { incidentId: incident.id, cid: cidString };
  }

  async reserveClaim(incidentId: string) {
    const { data: incident } = await this.supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    const cidHash = ethers.id(incident.evidence_cid);
    const reserveAmount = ethers.parseEther('1.0');

    const tx = await this.poolContract.reserveClaim(
      incident.wallet_address,
      cidHash,
      reserveAmount
    );
    const receipt = await tx.wait();

    await this.supabase
      .from('incidents')
      .update({ status: 'reserved', on_chain_claim_id: receipt.logs[0].args[0] })
      .eq('id', incidentId);

    return { claimId: receipt.logs[0].args[0], txHash: receipt.hash };
  }

  async processEmergencyPayout(incidentId: string, amount: string) {
    const { data: incident } = await this.supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();

    const tx = await this.poolContract.emergencyPayout(
      incident.on_chain_claim_id,
      ethers.parseEther(amount)
    );
    await tx.wait();

    await this.supabase
      .from('incidents')
      .update({ emergency_payout_amount: amount })
      .eq('id', incidentId);

    return { success: true };
  }

  async initiateTakedown(incidentId: string) {
    return { message: 'Takedown initiated', incidentId };
  }
}
