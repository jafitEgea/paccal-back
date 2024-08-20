import { Module } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { AuditoriaController } from './controllers/auditoria.controller';
import { AuditoriaService } from './services/auditoria.service';

@Module({
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AccessService],
})
export class AuditoriaModule { }
