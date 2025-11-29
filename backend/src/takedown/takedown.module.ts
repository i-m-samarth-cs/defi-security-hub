import { Module } from '@nestjs/common';
import { TakedownService } from './takedown.service';

@Module({
  providers: [TakedownService],
  exports: [TakedownService],
})
export class TakedownModule {}
