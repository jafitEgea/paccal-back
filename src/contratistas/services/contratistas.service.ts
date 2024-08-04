import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess } from 'src/assets/formatDate';
import { CreateContratistaDto } from '../dto/create-contratista.dto';
import { UpdateContratistaDto } from '../dto/update-contratista.dto';
import { ContratistaEntity } from '../entities/contratista.entity';

@Injectable()
export class ContratistasService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<ContratistaEntity[]> {
    const query = `SELECT TOP 50
                    Contratistas.id_contratista,
                    Personas.nombre,
                    Personas.apellidos,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Contratistas.tipo,
                    Personas.fecha_creacion,
                    Personas.fecha_modificacion,
                    Personas.estado
                   FROM Personas INNER JOIN Contratistas ON Personas.id_persona = Contratistas.id_contratista
                   WHERE [estado] = 1
                   ORDER BY [id_contratista] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contratista(s) no encontrado(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOne(id: number) {
    const query = `SELECT Contratistas.id_contratista,
                    Personas.nombre,
                    Personas.apellidos,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Contratistas.tipo,
                    Personas.fecha_creacion,
                    Personas.fecha_modificacion,
                    Personas.estado
                   FROM Personas INNER JOIN Contratistas ON Personas.id_persona = Contratistas.id_contratista
                   WHERE Contratistas.id_contratista = ${id} AND [estado] = 1`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contratista no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOneByName(name: string) {
    const query = `SELECT Contratistas.id_contratista,
                    Personas.nombre,
                    Personas.apellidos,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Contratistas.tipo,
                    Personas.fecha_creacion,
                    Personas.fecha_modificacion,
                    Personas.estado
                   FROM Personas INNER JOIN Contratistas ON Personas.id_persona = Contratistas.id_contratista
                   WHERE [nombre] & ' ' & [apellidos] LIKE '%${name}%' AND [estado] = 1`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contratista no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async contractorExists(body: UpdateContratistaDto) {
    const { nombre, apellidos, tipo } = body;
    const query = `SELECT COUNT(*) AS count 
                   FROM Personas INNER JOIN Contratistas ON Personas.id_persona = Contratistas.id_contratista
                   WHERE [nombre] = '${nombre}' AND [apellidos] = '${apellidos}' AND [tipo] = '${tipo}' AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async contractorExistsById(id: number) {
    const query = `SELECT COUNT(*) AS count 
                   FROM Personas INNER JOIN Contratistas ON Personas.id_persona = Contratistas.id_contratista
                   WHERE [id_contratista] = ${id} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async create(contratista: CreateContratistaDto) {
    const { nombre, apellidos, tipo, fecha_creacion } = contratista;
    let f_creacion = null;

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const queryInsert = `INSERT INTO Personas(nombre, apellidos, fecha_creacion, estado)
                         VALUES( '${nombre}', '${apellidos}', ${f_creacion}, 1 )`;
    await this.accessService.executeQuery(queryInsert);

    const querySelect = `SELECT [id_persona] FROM [Personas] 
                         WHERE [fecha_creacion] = ${f_creacion} 
                         ORDER BY [id_persona] DESC;`;
    const result = await this.accessService.executeQuery(querySelect);
    const id_persona = result[0].id_persona;

    const queryInsert2 = `INSERT INTO Contratistas(id_contratista, tipo)
                          VALUES( ${id_persona}, '${tipo}')`;
    const result2 = await this.accessService.executeQuery(queryInsert2);

    // END TRANSACTION
    await this.accessService.commitTransaction();

    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result2;
  }

  async update(id: number, contratista: UpdateContratistaDto) {
    const { nombre, apellidos, tipo, fecha_modificacion } = contratista;
    let f_modificacion = null;

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const query = `UPDATE Personas SET 
                    [nombre] = '${nombre}', 
                    [apellidos] = '${apellidos}',
                    [fecha_modificacion] = ${f_modificacion}
                   WHERE [id_persona] = ${id};`;
    await this.accessService.executeQuery(query);

    const query2 = `UPDATE Contratistas SET
                    [tipo] = '${tipo}'
                    WHERE [id_contratista] = ${id}`;

    const result = await this.accessService.executeQuery(query2);

    // END TRANSACTION
    await this.accessService.commitTransaction();

    return result;

  }

  async delete(id: number) {
    const query = `UPDATE Personas SET estado = 0 WHERE id_persona = ${id}`;
    await this.accessService.executeQuery(query);

    const query2 = `DELETE FROM Contratistas WHERE id_contratista = ${id}`;
    const result = await this.accessService.executeQuery(query2);
    return result;
  }
}
