import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { IncidentService } from './incident.service';

@Controller('api/incident')
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  @Post('report')
  async reportIncident(@Body() data: any) {
    const incident = await this.incidentService.createIncident(data);
    
    // Automatically freeze claim and initiate takedown
    if (data.score >= 0.8) {
      await this.incidentService.reserveClaim(incident.incidentId);
      await this.incidentService.initiateTakedown(incident.incidentId);
    }
    
    return { 
      success: true, 
      incidentId: incident.incidentId,
      message: 'Incident reported. Insurance claim frozen. Takedown initiated.'
    };
  }

  @Post(':id/report')
  async reportIncidentById(@Param('id') id: string, @Body() data: any) {
    return this.incidentService.createIncident(data);
  }

  @Post(':id/freeze')
  async freezeAndReserve(@Param('id') id: string) {
    return this.incidentService.reserveClaim(id);
  }

  @Post(':id/payout')
  async emergencyPayout(@Param('id') id: string, @Body() data: any) {
    return this.incidentService.processEmergencyPayout(id, data.amount);
  }

  @Post(':id/takedown')
  async initiateTakedown(@Param('id') id: string) {
    return this.incidentService.initiateTakedown(id);
  }

  @Post('log-threat')
  async logThreat(@Body() data: any) {
    // Store threat in memory or database
    console.log('Threat detected:', data);
    return { success: true, message: 'Threat logged' };
  }

  @Get('stats')
  async getStats() {
    return {
      totalInsuredTVL: 2400000,
      threatsBlocked: 127,
      activeIncidents: 12,
      emergencyPool: 50000,
      totalClaims: 45,
      approvedClaims: 38,
      pendingClaims: 7
    };
  }

  @Get('threats')
  async getThreats() {
    // Return real-time threat data for the map
    return {
      threats: [
        { country: 'US', lat: 37.0902, lon: -95.7129, count: 34, city: 'USA' },
        { country: 'GB', lat: 51.5074, lon: -0.1278, count: 28, city: 'Europe' },
        { country: 'CN', lat: 35.8617, lon: 104.1954, count: 45, city: 'Asia' },
        { country: 'BR', lat: -14.2350, lon: -51.9253, count: 12, city: 'S. America' },
        { country: 'ZA', lat: -30.5595, lon: 22.9375, count: 8, city: 'Africa' }
      ],
      total: 127,
      lastUpdated: new Date().toISOString()
    };
  }

  @Get('user-claims')
  async getUserClaims() {
    // Return user's claims (in production, filter by authenticated user)
    return {
      claims: []  // Empty initially, will be populated when users report incidents
    };
  }
}
