import { Module } from '@nestjs/common';
import { ContratosService } from './services/contratos.service';
import { ContratosController } from './controllers/contratos.controller';
import { AccessService } from 'src/access/access.service';
import { ContratistasService } from 'src/contratistas/services/contratistas.service';

@Module({
  controllers: [ContratosController],
  providers: [ContratosService, AccessService, ContratistasService],
})
export class ContratosModule {}
