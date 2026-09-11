import { Module } from '@nestjs/common';
import { AccessModule } from './access/access.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { ContratistasModule } from './contratistas/contratistas.module';
import { ContratosModule } from './contratos/contratos.module';
import { CuentasCobroRequisitosModule } from './cuentas-cobro-requisitos/cuentas-cobro-requisitos.module';
import { CuentasCobroModule } from './cuentas-cobro/cuentas-cobro.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { RequisitosModule } from './requisitos/requisitos.module';
import { RevisionesModule } from './revisiones/revisiones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AccessModule,
    AuditoriaModule,
    AuthModule,
    ContratistasModule,
    ContratosModule,
    CuentasCobroModule,
    CuentasCobroRequisitosModule,
    EmpleadosModule,
    RequisitosModule,
    RevisionesModule,
    UsuariosModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    }
  ],
})
export class AppModule { }
