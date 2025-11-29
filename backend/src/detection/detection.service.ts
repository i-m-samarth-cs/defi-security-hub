import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DetectionService {
  async scoreTransaction(payload: any) {
    const mlEndpoint = process.env.ML_ENDPOINT_URL;
    
    // Quick heuristic scoring
    let score = 0;
    const reasons = [];
    
    if (payload.approvalFlag && payload.approvalAmount === 'infinite') {
      score += 0.3;
      reasons.push('Infinite approval detected');
    }
    
    if (payload.originDomain && !this.isWhitelisted(payload.originDomain)) {
      score += 0.2;
      reasons.push('Unknown domain');
    }
    
    if (payload.recentTxCountForRecipient < 10) {
      score += 0.2;
      reasons.push('New contract with few transactions');
    }

    // Call ML endpoint for detailed scoring
    try {
      const mlResponse = await axios.post(mlEndpoint, payload, { timeout: 3000 });
      score = Math.max(score, mlResponse.data.score);
      reasons.push(...mlResponse.data.reasons);
    } catch (err) {
      console.error('ML endpoint error:', err.message);
    }

    const recommended_action = score >= 0.8 ? 'block' : score >= 0.5 ? 'warn' : 'allow';

    return { score, reasons, recommended_action };
  }

  private isWhitelisted(domain: string): boolean {
    const whitelist = ['uniswap.org', 'aave.com', 'compound.finance'];
    return whitelist.some(d => domain.includes(d));
  }
}
