import { Controller, Post, Body } from '@nestjs/common';
import { DetectionService } from './detection.service';

@Controller('api/detect')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  @Post()
  async detectPhishing(@Body() payload: any) {
    return this.detectionService.scoreTransaction(payload);
  }

  @Post('scan-page')
  async scanPage(@Body() payload: any) {
    const { domain, url, title } = payload;
    
    // Check against known phishing patterns
    const suspiciousKeywords = ['uniswap', 'pancakeswap', 'metamask', 'opensea', 'coinbase', 'binance'];
    const legitimateDomains = ['uniswap.org', 'pancakeswap.finance', 'metamask.io', 'opensea.io', 'coinbase.com', 'binance.com'];
    
    const isImpersonating = suspiciousKeywords.some(keyword => 
      domain.includes(keyword) && !legitimateDomains.some(legit => domain === legit || domain.endsWith('.' + legit))
    );
    
    if (isImpersonating) {
      return {
        isThreat: true,
        reason: `Domain "${domain}" appears to be impersonating a legitimate service`,
        severity: 'high'
      };
    }
    
    return { isThreat: false };
  }

  @Post('scan-wallet')
  async scanWallet(@Body() payload: any) {
    const { wallets, results } = payload;
    console.log('Wallet scan completed:', wallets);
    
    // Store scan results (in production, save to database)
    return {
      success: true,
      message: 'Wallet scan logged successfully'
    };
  }
}
