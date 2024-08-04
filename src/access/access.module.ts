import { Module } from '@nestjs/common';
import { AccessService } from './access.service';

@Module({
  controllers: [],
  providers: [AccessService],
})
export class AccessModule {}
