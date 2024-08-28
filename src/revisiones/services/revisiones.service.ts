import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess } from 'src/assets/formatDate';
import { CreateRevisionDto, RevisionSearchDto } from '../dto/create-revision.dto';
import { UpdateRevisionDto } from '../dto/update-revision.dto';
import { RevisionEntity } from '../entities/revision.entity';

@Injectable()
export class RevisionesService {

    constructor(private accessService: AccessService) { }

    async findAll(): Promise<RevisionEntity[]> {
        const query = `SELECT TOP 50 re.id_revision,
                        re.id_cuentacobro,
                        re.id_autor,
                        TRIM((pe.nombre & ' ' & pe.apellidos)) AS nombre_autor,
                        us.rol AS rol_autor,
                        re.descripcion,
                        re.fecha_creacion,
                        re.fecha_modificacion,
                        re.estado
                       FROM ((Revisiones re
                        INNER JOIN Usuarios us ON us.id_usuario = re.id_autor)
                        INNER JOIN Personas pe ON re.id_autor = pe.id_persona)
                       WHERE [re.estado] = 1
                       ORDER BY [id_revision] DESC;`
        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result) == '[]') throw new NotFoundException("Revision(es) no encontrada(s)");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async findOne(id: number) {
        const query = `SELECT re.id_revision,
                        re.id_cuentacobro,
                        re.id_autor,
                        TRIM((pe.nombre & ' ' & pe.apellidos)) AS nombre_autor,
                        us.rol AS rol_autor,
                        re.descripcion,
                        re.fecha_creacion,
                        re.fecha_modificacion,
                        re.estado
                       FROM ((Revisiones re
                        INNER JOIN Usuarios us ON us.id_usuario = re.id_autor)
                        INNER JOIN Personas pe ON re.id_autor = pe.id_persona)
                       WHERE [re.id_revision] = ${id} AND [re.estado] = 1
                       ORDER BY [id_revision] DESC;`

        const result = await this.accessService.executeQuery(query);
        if (JSON.stringify(result) == '[]') throw new NotFoundException("Revision no encontrada");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async findOneByAccountReceivableOrAuthor({ id_cuentacobro, nombre_autor }: RevisionSearchDto) {
        const query = `SELECT TOP 50
                        re.id_revision,
                        re.id_cuentacobro,
                        re.id_autor,
                        TRIM((pe.nombre & ' ' & pe.apellidos)) AS nombre_autor,
                        us.rol AS rol_autor,
                        re.descripcion,
                        re.fecha_creacion,
                        re.fecha_modificacion,
                        re.estado
                       FROM ((Revisiones re
                        INNER JOIN Usuarios us ON us.id_usuario = re.id_autor)
                        INNER JOIN Personas pe ON re.id_autor = pe.id_persona)
                       WHERE ( re.id_cuentacobro = ${id_cuentacobro} OR pe.nombre & ' ' & pe.apellidos LIKE '%${nombre_autor}%' ) AND [re.estado] = 1
                       ORDER BY [id_revision] DESC;`

        const result = await this.accessService.executeQuery(query);
        if (JSON.stringify(result) == '[]') throw new NotFoundException("Revision(es) no encontrada(s)");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async findOneByAccountReceivable(id_cuentacobro: number) {
        const query = `SELECT TOP 50
                        re.id_revision,
                        re.id_cuentacobro,
                        re.id_autor,
                        TRIM((pe.nombre & ' ' & pe.apellidos)) AS nombre_autor,
                        us.rol AS rol_autor,
                        re.descripcion,
                        re.fecha_creacion,
                        re.fecha_modificacion,
                        re.estado
                       FROM ((Revisiones re
                        INNER JOIN Usuarios us ON us.id_usuario = re.id_autor)
                        INNER JOIN Personas pe ON re.id_autor = pe.id_persona)
                       WHERE re.id_cuentacobro = ${id_cuentacobro} AND [re.estado] = 1
                       ORDER BY [id_revision] DESC;`

        const result = await this.accessService.executeQuery(query);
        if (JSON.stringify(result) == '[]') throw new NotFoundException("Revision(es) no encontrada(s)");
        if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async reviewExists(body: UpdateRevisionDto) {
        const { id_cuentacobro, id_autor, descripcion } = body;

        const query = `SELECT COUNT(*) as count
                       FROM Revisiones
                       WHERE [id_cuentacobro] = ${id_cuentacobro} AND [id_autor] = ${id_autor} AND [descripcion] = '${descripcion}'
                        AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);
        return result[0].count > 0;
    }

    async reviewExistsById(id: number) {
        const query = `SELECT COUNT(*) as count
                       FROM Revisiones
                       WHERE [id_revision] = ${id} AND [estado] = 1;`
        const result = await this.accessService.executeQuery(query);
        return result[0].count > 0;
    }

    async create(revision: CreateRevisionDto) {
        const { id_cuentacobro, id_autor, descripcion, fecha_creacion } = revision;

        let f_creacion = null;

        if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
        f_creacion = formatDateForAccess(fecha_creacion.toString());

        const query = `INSERT INTO Revisiones(id_cuentacobro, id_autor, descripcion, fecha_creacion, estado)
                        VALUES ( ${id_cuentacobro}, ${id_autor}, '${descripcion}', ${f_creacion}, 1 )`

        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async update(id: number, revision: UpdateRevisionDto) {
        const { id_cuentacobro, id_autor, descripcion, fecha_modificacion } = revision;

        let f_modificacion = null;

        if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
        f_modificacion = formatDateForAccess(fecha_modificacion.toString());

        const query = `UPDATE Revisiones SET
                        [id_cuentacobro] = ${id_cuentacobro},
                        [id_autor] = ${id_autor},
                        [descripcion] = '${descripcion}',
                        [fecha_modificacion] = ${f_modificacion}
                       WHERE [id_revision] = ${id};`

        const result = await this.accessService.executeQuery(query);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

        return result;
    }

    async delete(id: number) {
        const query = `DELETE FROM Revisiones WHERE [id_revision] = ${id}`;
        const result = await this.accessService.executeQuery(query);
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));
        return result;
    }

    async deleteByIdAccountReceivable(id: number) {
        const query = `DELETE FROM Revisiones WHERE [id_cuentacobro] = ${id}`;
        const result = await this.accessService.executeQuery(query);
        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));
        return result;
    }

}
