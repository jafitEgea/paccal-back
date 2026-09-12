import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess } from 'src/assets/formatDate';
import { CreateEmpleadoDto } from '../dto/create-empleado.dto';
import { UpdateEmpleadoDto } from '../dto/update-empleado.dto';
import { EmpleadoEntity } from '../entities/empleado.entity';

@Injectable()
export class EmpleadosService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<EmpleadoEntity[]> {
    const query = `SELECT TOP 50 
                    Empleados.id_empleado,
                    Personas.nombre AS nombres,
                    Personas.apellidos,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Empleados.cargo,
                    Personas.fecha_creacion,
                    Personas.fecha_modificacion,
                    Personas.estado
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE [estado] = 1
                   ORDER BY [id_empleado] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Empleados no encontrados");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOne(id: number) {
    const query = `SELECT Empleados.id_empleado,
                    Personas.nombre AS nombres,
                    Personas.apellidos, 
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Empleados.cargo, 
                    Personas.fecha_creacion, 
                    Personas.fecha_modificacion, 
                    Personas.estado
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE Empleados.id_empleado = ${id} AND [estado] = 1
                   ORDER BY [id_empleado] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Empleado no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOneByFullName(fullName: string) {
    const query = `SELECT Empleados.id_empleado,
                    Personas.nombre AS nombres,
                    Personas.apellidos, 
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo,
                    Empleados.cargo, 
                    Personas.fecha_creacion, 
                    Personas.fecha_modificacion, 
                    Personas.estado
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE [nombre] & ' ' & [apellidos] LIKE '%${fullName}%' AND [estado] = 1
                   ORDER BY [id_empleado] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Empleado no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findNamesByFullName(fullName: string) {
    const query = `SELECT Empleados.id_empleado, 
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_completo
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE [nombre] & ' ' & [apellidos] LIKE '%${fullName}%' AND [estado] = 1
                   ORDER BY [id_empleado] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Empleado no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }


  async employeeExists(body: UpdateEmpleadoDto) {
    const { nombres, apellidos, cargo } = body;
    const query = `SELECT COUNT(*) AS count 
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE [nombre] = '${nombres}' AND [apellidos] = '${apellidos}' AND [cargo] = '${cargo}' AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async employeeExistsById(id: number) {
    const query = `SELECT COUNT(*) AS count 
                   FROM Personas INNER JOIN Empleados ON Personas.id_persona = Empleados.id_empleado
                   WHERE [id_empleado] = ${id} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async create(empleado: CreateEmpleadoDto) {
    const { nombres, apellidos, cargo, fecha_creacion } = empleado;
    let f_creacion = null;

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    return this.accessService.transaction(async (tx) => {
      const queryInsert = `INSERT INTO Personas(nombre, apellidos, fecha_creacion, estado)
                           VALUES( '${nombres}', '${apellidos}', ${f_creacion}, 1 )`;
      await tx.execute(queryInsert);

      const resultId = await tx.query<{ id_persona: number }>(
        'SELECT @@IDENTITY AS id_persona;'
      );

      const id_persona = resultId[0].id_persona;

      const queryInsert2 = `INSERT INTO Empleados(id_empleado, cargo)
                            VALUES( ${id_persona}, '${cargo}')`;
      return tx.execute(queryInsert2);
    });
  }

  async update(id: number, empleado: UpdateEmpleadoDto) {
    const { nombres, apellidos, cargo, fecha_modificacion } = empleado;
    let f_modificacion = null;

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    return this.accessService.transaction(async (tx) => {
      const query = `UPDATE Personas SET 
                      [nombre] = '${nombres}', 
                      [apellidos] = '${apellidos}',
                      [fecha_modificacion] = ${f_modificacion}
                     WHERE [id_persona] = ${id};`;
      await tx.execute(query);

      const query2 = `UPDATE Empleados SET
                      [cargo] = '${cargo}'
                      WHERE [id_empleado] = ${id}`;
      return await tx.execute(query2);
    });
  }

  async delete(id: number) {
    return this.accessService.transaction(async (tx) => {
      const query = `DELETE FROM Personas WHERE id_persona = ${id}`;
      await tx.execute(query);

      const query2 = `DELETE FROM Empleados WHERE id_empleado = ${id}`;
      return await tx.execute(query2);
    });
  }
}
