import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto, LoginDto } from 'src/usuarios/dto/create-usuario.dto';
import { UsuariosService } from 'src/usuarios/services/usuarios.service';

import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {

    constructor(
        private readonly usuariosService: UsuariosService,
        private readonly jwtService: JwtService,
    ) { }

    async register(usuario: CreateUsuarioDto) {
        const { nombres, apellidos, contraseña, nombre_usuario, cargo, rol, fecha_creacion } = usuario;
        if (await this.usuariosService.userExistsByUserName(nombre_usuario)) {
            throw new BadRequestException("Usuario ya existente");
        }

        // const contraseñaHash = await bcryptjs.hash(contraseña, 10);

        return await this.usuariosService.create({
            nombres,
            apellidos,
            nombre_usuario,
            contraseña,
            cargo,
            rol,
            fecha_creacion,
        });
    }

    async login({ nombre_usuario, contraseña }: LoginDto) {
        if (!(await this.usuariosService.userExistsByUserName(nombre_usuario))) {
            throw new UnauthorizedException("Nombre de usuario incorrecto");
        }

        let usuario = await this.usuariosService.findOneByUserName(nombre_usuario);

        const contraseñaValida = await bcryptjs.compare(contraseña, usuario[0].contraseña);
        if (!contraseñaValida) {
            throw new UnauthorizedException("Contraseña incorrecta");
        }
        delete usuario[0].contraseña;

        const payload = { nombre: usuario[0].nombres, nombre_usuario: usuario[0].nombre_usuario }

        const token = this.jwtService.sign(payload);

        const response = {
            success: true,
            statusCode: 200,
            data: usuario[0],
            token
        }

        return response;
    }

}
