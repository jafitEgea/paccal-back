import { Module } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { ContratosService } from 'src/contratos/services/contratos.service';
import { EmpleadosService } from 'src/empleados/services/empleados.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { RevisionesService } from 'src/revisiones/services/revisiones.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { CuentasCobroController } from './controllers/cuentas-cobro.controller';
import { CuentasCobroService } from './services/cuentas-cobro.service';

@Module({
  controllers: [CuentasCobroController],
  providers: [CuentasCobroService, ContratosService, UsuariosService, EmpleadosService, AccessService, RequisitosService, RevisionesService],
})
export class CuentasCobroModule { }
