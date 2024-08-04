import { Module } from '@nestjs/common';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuariosService } from './services/usuarios.service';
import { AccessService } from 'src/access/access.service';

@Module({
  imports: [],
  providers: [UsuariosService, AccessService],
  controllers: [UsuariosController],
  exports: [ UsuariosService ]
})
export class UsuariosModule {}
