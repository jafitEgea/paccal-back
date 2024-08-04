import { Module } from '@nestjs/common';
import { EmpleadosService } from './services/empleados.service';
import { EmpleadosController } from './controllers/empleados.controller';
import { AccessService } from 'src/access/access.service';

@Module({
  controllers: [EmpleadosController],
  providers: [EmpleadosService, AccessService],
})
export class EmpleadosModule {}
