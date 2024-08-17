import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { Constants } from 'src/assets/environment/constants';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateUsuarioDto, UserNameDto, UserSearchDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UsuariosService } from '../services/usuarios.service';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {

    constructor(
        private usuariosService: UsuariosService,
    ) { }

    @Get()
    async getAllUsers() {
        try {
            const data = await this.usuariosService.findAll();
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Usuarios encontrados exitosamente',
            };
        } catch (error) {
            return {
                success: false,
                action: Constants.SELECT,
                message: error.message
            };
        }
    }

    @Get(':id')
    async getUser(@Param('id') id: number) {
        try {
            const data = await this.usuariosService.findOne(+id);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Usuario encontrado exitosamente',
            };
        } catch (error) { throw error }
    }

    @Get('nombre/:nombre')
    async getUserByFullName(@Param('nombre') name: string) {
        try {
            const data = await this.usuariosService.findOneByFullName(name);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Usuario encontrado exitosamente',
            };
        } catch (error) {
            return {
                success: false,
                action: Constants.SELECT,
                message: error.message
            };
        }
    }

    @Get('nombre_usuario/:nombre_usuario')
    async getUserByUserName(@Param('nombre_usuario') userName: string) {
        try {
            const data = await this.usuariosService.findOneByUserName(userName);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Usuario encontrado exitosamente',
            };
        } catch (error) {
            return {
                success: false,
                action: Constants.SELECT,
                message: error.message
            };
        }
    }

    @Post('buscar')
    @ApiBody({ type: UserSearchDto })
    async getUserByNameOrUserName(@Body() body: UserSearchDto) {
        try {
            const data = await this.usuariosService.findOneByNameOrUserName(body);
            return {
                success: true,
                action: Constants.SELECT,
                data,
                message: 'Usuario encontrado exitosamente',
            };
        } catch (error) {
            return {
                success: false,
                action: Constants.SELECT,
                message: error.message
            };
        }
    }

    @Post()
    async createUser(@Body() body: CreateUsuarioDto) {
        const { nombre_usuario } = body;
        try {
            if (await this.usuariosService.userExistsByUserName(nombre_usuario)) {
                throw new BadRequestException("Usuario ya existente");
            }
            const data = await this.usuariosService.create(body);
            return {
                success: true,
                action: Constants.INSERT,
                data,
                message: 'Usuario creado exitosamente',
            };
        } catch (error) { throw error }
    }

    @Post('/verify-username')
    async userExistsByUserName(@Body() body: UserNameDto) {
        return await this.usuariosService.userExistsByUserName(body.nombre_usuario);
    }

    @Get('/verify/:id')
    async userExists(@Param('id') id: number) {
        return await this.usuariosService.userExistsById(id);
    }

    @Put(':id')
    @ApiBody({ type: CreateUsuarioDto })
    async updateUser(@Param('id') id: number, @Body() body: UpdateUsuarioDto) {
        try {
            if (!(await this.usuariosService.userExistsById(+id))) {
                throw new BadRequestException("Usuario no encontrado");
            }
            if (!(await this.usuariosService.createdUserExistsByUserName(body.nombre_usuario, id)) && await this.usuariosService.userExistsByUserName(body.nombre_usuario)) {
                throw new BadRequestException("No se puede escoger este nombre de usuario.");
            }
            const data = await this.usuariosService.update(+id, body);
            return {
                success: true,
                action: Constants.UPDATE,
                data,
                message: 'Usuario actualizado exitosamente',
            };
        } catch (error) { throw error }
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: number) {
        try {
            if (!(await this.usuariosService.userExistsById(id))) {
                throw new BadRequestException("Usuario no encontrado");
            }
            const data = await this.usuariosService.delete(id);
            return {
                success: true,
                action: Constants.DELETE,
                data,
                message: 'Usuario eliminado exitosamente',
            };
        } catch (error) {
            if (String(error).includes("includes related records")) {
                const msg = "Existen registros relacionados a este elemento"
                throw new BadRequestException(msg);
            }
            throw error;
        }
    }
}
