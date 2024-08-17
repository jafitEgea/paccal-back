import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess } from 'src/assets/formatDate';
import { CreateUsuarioDto, UserSearchDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UsuarioEntity } from '../entities/usuario.entity';

import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsuariosService {

    constructor(private accessService: AccessService) { }

    async findAll(): Promise<UsuarioEntity[]> {
        const query = `SELECT TOP 50 Usuarios.id_usuario, 
                        Personas.nombre AS nombres, 
                        Personas.apellidos, 
                        Usuarios.nombre_usuario, 
                        Usuarios.contraseña,
                        Usuarios.rol,
                        Personas.fecha_creacion,
                        Personas.fecha_modificacion,
                        Personas.estado
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE [estado] = 1
                       ORDER BY [id_usuario] DESC;`;
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Usuario(s) no encontrado(s)");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));


        return result;
    }

    async findOne(id: number): Promise<UsuarioEntity> {
        const query = `SELECT Usuarios.id_usuario, 
                        Personas.nombre AS nombres, 
                        Personas.apellidos, 
                        Usuarios.nombre_usuario, 
                        Usuarios.contraseña,
                        Usuarios.rol, 
                        Personas.fecha_creacion,
                        Personas.fecha_modificacion,
                        Personas.estado
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE [id_persona] = ${id} AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Usuario no encontrado");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async findOneByUserName(username: string): Promise<UsuarioEntity> {
        const query = `SELECT Usuarios.id_usuario, 
                        Personas.nombre AS nombres, 
                        Personas.apellidos, 
                        Usuarios.nombre_usuario, 
                        Usuarios.contraseña,
                        Usuarios.rol,
                        Personas.fecha_creacion,
                        Personas.fecha_modificacion,
                        Personas.estado
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE [nombre_usuario] = '${username}' AND [estado] = 1;`;
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Usuario no encontrado");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async findOneByFullName(fullName: string): Promise<UsuarioEntity> {
        const query = `SELECT Usuarios.id_usuario, 
                        Personas.nombre AS nombres, 
                        Personas.apellidos, 
                        Usuarios.nombre_usuario, 
                        Usuarios.contraseña,
                        Usuarios.rol,
                        Personas.fecha_creacion,
                        Personas.fecha_modificacion,
                        Personas.estado
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE [nombre] & ' ' & [apellidos] LIKE '%${fullName}%' AND [estado] = 1;`;
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Usuario no encontrado");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    //TODO: LA CONTRASEÑA NO SERA OBTENIDA PUESTO QUE ES UN HASH. CAMPO EDITAR CONTRASEÑA VACIO

    async findOneByNameOrUserName(body: UserSearchDto): Promise<UsuarioEntity> {
        const fullName = body.nombre, username = body.nombre_usuario;
        const query = `SELECT Usuarios.id_usuario, 
                        Personas.nombre AS nombres, 
                        Personas.apellidos, 
                        Usuarios.nombre_usuario, 
                        Usuarios.contraseña,
                        Usuarios.rol,
                        Personas.fecha_creacion,
                        Personas.fecha_modificacion,
                        Personas.estado
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE ( [nombre] & ' ' & [apellidos] LIKE '%${fullName}%' OR [nombre_usuario] LIKE '%${username}%' )
                        AND [estado] = 1;`;
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Usuario no encontrado");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async userExistsById(id: number) {
        const query = `SELECT COUNT(*) AS count 
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE [id_persona] = ${id} AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);
        return result[0].count > 0;
    }

    async userExistsByUserName(username: string) {
        const query = `SELECT COUNT(*) AS count 
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE StrComp([nombre_usuario], '${username}',0) = 0 AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);
        return result[0].count > 0;
    }

    async createdUserExistsByUserName(username: string, id: number) {
        const query = `SELECT COUNT(*) AS count 
                       FROM Personas INNER JOIN Usuarios ON Personas.id_persona = Usuarios.id_usuario
                       WHERE StrComp([nombre_usuario], '${username}',0) = 0 AND [id_usuario] = ${id} AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);
        return result[0].count > 0;
    }

    async create(usuario: CreateUsuarioDto) {
        const { nombres, apellidos, nombre_usuario, contraseña, rol, fecha_creacion } = usuario;
        let f_creacion = null;

        if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");

        f_creacion = formatDateForAccess(fecha_creacion.toString());

        // BEGIN TRANSACTION
        await this.accessService.executeTransaction();

        const queryInsert = `INSERT INTO Personas(nombre, apellidos, fecha_creacion, estado)
                             VALUES( '${nombres}', '${apellidos}', ${f_creacion}, 1 )`;
        let result = await this.accessService.executeQuery(queryInsert);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(result));
        }

        const querySelect = `SELECT [id_persona] FROM [Personas] 
                             WHERE [fecha_creacion] = ${f_creacion} 
                             ORDER BY [id_persona] DESC;`;
        result = await this.accessService.executeQuery(querySelect);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(result));
        }

        const id_persona = result[0].id_persona;

        const contraseñaHash = await bcryptjs.hash(contraseña, 10);

        const queryInsert2 = `INSERT INTO Usuarios(id_usuario, nombre_usuario, contraseña, rol)
                              VALUES( ${id_persona} , '${nombre_usuario}', '${contraseñaHash}', '${rol}' )`;
        const result2 = await this.accessService.executeQuery(queryInsert2);

        // END TRANSACTION
        await this.accessService.commitTransaction();

        return result2;
    }

    //TODO: DESDE EL FRONTED, CAPTURAR EL ERROR CUANDO SE QUIERE ACTULIZAR EL USERNAME POR OTRO USERNAME DE OTRO USUARIO
    async update(id: number, usuario: UpdateUsuarioDto) {
        const { nombres, apellidos, nombre_usuario, contraseña, rol, fecha_modificacion } = usuario;
        let f_modificacion = null;

        if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
        f_modificacion = formatDateForAccess(fecha_modificacion.toString());

        // BEGIN TRANSACTION
        await this.accessService.executeTransaction();

        const query = `UPDATE Personas SET 
                        [nombre] = '${nombres}', 
                        [apellidos] = '${apellidos}',
                        [fecha_modificacion] = ${f_modificacion}
                       WHERE [id_persona] = ${id};`;

        let result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(result));
        }

        let cond = null;
        if (contraseña) {
            const contraseñaHash = await bcryptjs.hash(contraseña, 10);

            cond = `[nombre_usuario] = '${nombre_usuario}',
                    [contraseña] = '${contraseñaHash}',
                    [rol] = '${rol}'`
        } else {
            cond = `[nombre_usuario] = '${nombre_usuario}',
                    [rol] = '${rol}'`
        }

        const query2 = `UPDATE Usuarios SET
                          ${cond}
                        WHERE [id_usuario] = ${id}`;

        result = await this.accessService.executeQuery(query2);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(result));
        }

        // END TRANSACTION
        await this.accessService.commitTransaction();

        return result;
    }

    async delete(id: number) {
        // BEGIN TRANSACTION
        await this.accessService.executeTransaction();
        // const query =  `DELETE FROM Personas WHERE id_persona = ${id}`;
        const query = `UPDATE Personas SET estado = 0 WHERE id_persona = ${id}`;
        await this.accessService.executeQuery(query);
        if (JSON.stringify(query).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(query));
        }

        const query2 = `DELETE FROM Usuarios WHERE id_usuario = ${id}`;
        const result = await this.accessService.executeQuery(query2);
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
            await this.accessService.rollbackTransaction();
            throw new InternalServerErrorException(JSON.stringify(result));
        }

        // END TRANSACTION
        await this.accessService.commitTransaction();

        return result;
    }

}
