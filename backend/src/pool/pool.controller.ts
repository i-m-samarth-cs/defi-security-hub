import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { PoolService } from './pool.service';

@Controller('api/pool')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @Get('overview')
  async getPoolOverview() {
    return this.poolService.getPoolOverview();
  }

  @Get('activity')
  async getRecentActivity() {
    return this.poolService.getRecentActivity();
  }

  @Post('deposit')
  async deposit(@Body() data: { lpAddress: string; amount: number; asset: string; txHash: string }) {
    return this.poolService.processDeposit(data);
  }

  @Post('withdraw')
  async requestWithdraw(@Body() data: { lpAddress: string; amount: number }) {
    return this.poolService.requestWithdraw(data);
  }

  @Get('lp/:address')
  async getLPPosition(@Param('address') address: string) {
    return this.poolService.getLPPosition(address);
  }

  @Get('lp/:address/transactions')
  async getLPTransactions(@Param('address') address: string) {
    return this.poolService.getLPTransactions(address);
  }

  @Get('claims/pending')
  async getPendingClaims() {
    return this.poolService.getPendingClaims();
  }

  @Post('claims/:claimId/emergency-approve')
  async approveEmergencyPayout(@Param('claimId') claimId: string) {
    return this.poolService.approveEmergencyPayout(parseInt(claimId));
  }

  @Post('claims/:claimId/finalize')
  async finalizeClaim(
    @Param('claimId') claimId: string,
    @Body() data: { approved: boolean; payoutAmount: number; underwriter: string }
  ) {
    return this.poolService.finalizeClaim(parseInt(claimId), data);
  }

  @Get('settings')
  async getPoolSettings() {
    return this.poolService.getPoolSettings();
  }

  @Put('settings')
  async updatePoolSettings(@Body() settings: any) {
    return this.poolService.updatePoolSettings(settings);
  }
}
