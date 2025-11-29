import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DetectionModule } from './detection/detection.module';
import { IncidentModule } from './incident/incident.module';
import { TakedownModule } from './takedown/takedown.module';
import { PoolModule } from './pool/pool.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DetectionModule,
    IncidentModule,
    TakedownModule,
    PoolModule,
  ],
})
export class AppModule {}
