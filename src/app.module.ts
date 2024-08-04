import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AuthModule } from './auth/auth.module';
import { ContratistasModule } from './contratistas/contratistas.module';
import { ContratosModule } from './contratos/contratos.module';
import { CuentasCobroRequisitosModule } from './cuentas-cobro-requisitos/cuentas-cobro-requisitos.module';
import { CuentasCobroModule } from './cuentas-cobro/cuentas-cobro.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { RequisitosModule } from './requisitos/requisitos.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    AccessModule,
    AuthModule,
    ContratistasModule,
    ContratosModule,
    CuentasCobroRequisitosModule,
    CuentasCobroModule,
    EmpleadosModule,
    RequisitosModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
