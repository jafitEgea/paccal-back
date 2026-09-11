import { Module } from '@nestjs/common';
import { UsuariosController } from './controllers/usuarios.controller';
import { UsuariosService } from './services/usuarios.service';

@Module({
  providers: [UsuariosService],
  controllers: [UsuariosController],
  exports: [ UsuariosService ]
})
export class UsuariosModule {}
