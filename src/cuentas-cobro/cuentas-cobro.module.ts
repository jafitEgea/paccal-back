import { Module } from '@nestjs/common';
import { ContratosService } from 'src/contratos/services/contratos.service';
import { EmpleadosService } from 'src/empleados/services/empleados.service';
import { RequisitosService } from 'src/requisitos/services/requisitos.service';
import { RevisionesService } from 'src/revisiones/services/revisiones.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { CuentasCobroController } from './controllers/cuentas-cobro.controller';
import { CuentasCobroService } from './services/cuentas-cobro.service';
import { ContratoExisteValidator } from 'src/contratos/validations/contrato-existe.validator';
import { AprobadorExisteValidator } from 'src/empleados/validations/aprobador-existe.validator';
import { RequisitosExistenValidator } from 'src/requisitos/validations/requisitos-existen.validator';
import { RevisorExisteValidator } from 'src/usuarios/validations/revisor-existe.validator';
import { CuentasCobroValidationChain } from './validations/cuentas-cobro-validation-chain';

@Module({
  controllers: [CuentasCobroController],
  providers: [
    CuentasCobroService, 
    ContratosService, 
    UsuariosService, 
    EmpleadosService, 
    RequisitosService, 
    RevisionesService,

    CuentasCobroValidationChain,
    
    ContratoExisteValidator,
    AprobadorExisteValidator,
    RevisorExisteValidator,
    RequisitosExistenValidator,
  ],
})
export class CuentasCobroModule { }
