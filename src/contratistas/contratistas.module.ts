import { Module } from '@nestjs/common';
import { ContratistasService } from './services/contratistas.service';
import { ContratistasController } from './controllers/contratistas.controller';
import { AccessService } from 'src/access/access.service';

@Module({
  controllers: [ContratistasController],
  providers: [ContratistasService, AccessService],
})
export class ContratistasModule {}
