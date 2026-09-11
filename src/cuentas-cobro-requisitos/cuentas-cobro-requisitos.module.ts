import { Module } from '@nestjs/common';
import { CuentasCobroService } from 'src/cuentas-cobro/services/cuentas-cobro.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { CuentasCobroRequisitosController } from './controllers/cuentas-cobro-requisitos.controller';
import { CuentasCobroRequisitosService } from './services/cuentas-cobro-requisitos.service';

@Module({
  controllers: [CuentasCobroRequisitosController],
  providers: [CuentasCobroRequisitosService, CuentasCobroService, RequisitosService],
})
export class CuentasCobroRequisitosModule {}
