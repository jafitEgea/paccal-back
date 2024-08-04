import { Module } from '@nestjs/common';
import { CuentasCobroRequisitosService } from './services/cuentas-cobro-requisitos.service';
import { CuentasCobroRequisitosController } from './controllers/cuentas-cobro-requisitos.controller';
import { CuentasCobroService } from 'src/cuentas-cobro/services/cuentas-cobro.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { AccessService } from 'src/access/access.service';

@Module({
  controllers: [CuentasCobroRequisitosController],
  providers: [CuentasCobroRequisitosService, CuentasCobroService, RequisitosService, AccessService],
})
export class CuentasCobroRequisitosModule {}
