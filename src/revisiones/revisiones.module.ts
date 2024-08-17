import { Module } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { CuentasCobroService } from 'src/cuentas-cobro/services/cuentas-cobro.service';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';
import { RevisionesController } from './controllers/revisiones.controller';
import { RevisionesService } from './services/revisiones.service';

@Module({
    controllers: [RevisionesController,],
    providers: [RevisionesService, AccessService, CuentasCobroService, UsuariosService],
})
export class RevisionesModule { }
