import { Module } from '@nestjs/common';
import { ContratistasService } from 'src/contratistas/services/contratistas.service';
import { ContratosController } from './controllers/contratos.controller';
import { ContratosService } from './services/contratos.service';

@Module({
  controllers: [ContratosController],
  providers: [ContratosService, ContratistasService],
})
export class ContratosModule {}
