import { Module } from '@nestjs/common';
import { RequisitosService } from './services/requisitos.service';
import { RequisitosController } from './controllers/requisitos.controller';
import { AccessService } from 'src/access/access.service';

@Module({
  controllers: [RequisitosController],
  providers: [RequisitosService, AccessService],
})
export class RequisitosModule {}
