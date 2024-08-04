import { Module } from '@nestjs/common';
import { CuentasCobroService } from './services/cuentas-cobro.service';
import { CuentasCobroController } from './controllers/cuentas-cobro.controller';
import { AccessService } from 'src/access/access.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { EmpleadosService } from 'src/empleados/services/empleados.service';
import { ContratosService } from 'src/contratos/services/contratos.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';

@Module({
  controllers: [CuentasCobroController],
  providers: [CuentasCobroService, ContratosService, UsuariosService, EmpleadosService, AccessService, RequisitosService],
})
export class CuentasCobroModule {}
