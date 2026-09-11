import { Module } from '@nestjs/common';
import { ContratistasController } from './controllers/contratistas.controller';
import { ContratistasService } from './services/contratistas.service';

@Module({
  controllers: [ContratistasController],
  providers: [ContratistasService],
})
export class ContratistasModule {}
