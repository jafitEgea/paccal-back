import { Module } from '@nestjs/common';
import { RequisitosController } from './controllers/requisitos.controller';
import { RequisitosService } from './services/requisitos.service';

@Module({
  controllers: [RequisitosController],
  providers: [RequisitosService],
})
export class RequisitosModule {}
