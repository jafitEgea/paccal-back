import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { CreateRequisitoDto } from '../dto/create-requisito.dto';
import { UpdateRequisitoDto } from '../dto/update-requisito.dto';
import { RequisitoEntity } from '../entities/requisito.entity';

@Injectable()
export class RequisitosService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<RequisitoEntity[]> {
    const query = `SELECT TOP 50 * FROM Requisitos WHERE [estado] = 1 ORDER BY [id_requisito] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Requisito(s) no encontrado(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOne(id: number): Promise<RequisitoEntity> {
    const query = `SELECT * FROM Requisitos
                   WHERE [id_requisito] = ${id} AND [estado] = 1 ORDER BY [id_requisito] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Requisito no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;

  }

  async findByType(tipo: string): Promise<RequisitoEntity[]> {
    const query = `SELECT * FROM Requisitos WHERE [tipo] LIKE '%${tipo}%' AND [estado] = 1 ORDER BY [nombre] ASC;`

    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Requisito(s) no encontrado(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOneByName(nombre: string): Promise<RequisitoEntity[]> {
    const query = `SELECT * FROM Requisitos WHERE [nombre] LIKE '%${nombre}%' AND [estado] = 1 ORDER BY [id_requisito] DESC;`

    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Requisito(s) no encontrado(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async requirementExists(body: UpdateRequisitoDto) {
    const { nombre, tipo } = body;
    const query = `SELECT COUNT(*) AS count
                   FROM Requisitos 
                   WHERE [nombre] = '${nombre}' AND [tipo] = '${tipo}' AND [estado] = 1`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;

  }

  async requirementExistsById(id: number) {
    const query = `SELECT COUNT(*) AS count
                   FROM Requisitos 
                   WHERE [id_requisito] = ${id} AND [estado] = 1`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async create(requisito: CreateRequisitoDto) {
    const { nombre, tipo, predeterminado } = requisito;

    const queryInsert = `INSERT INTO Requisitos(nombre, tipo, predeterminado, estado)
                         VALUES( '${nombre}', '${tipo}', ${predeterminado}, 1 )`;
    const result = await this.accessService.executeQuery(queryInsert);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async update(id: number, requisito: UpdateRequisitoDto) {
    const { nombre, tipo, predeterminado } = requisito;

    const query = `UPDATE Requisitos SET
                    [nombre] = '${nombre}',
                    [tipo] = '${tipo}',
                    [predeterminado] = ${predeterminado}
                   WHERE [id_requisito] = ${id};`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async delete(id: number) {
    const query = `DELETE FROM Requisitos WHERE id_requisito = ${id}`;
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));
    console.log(result)
    return result;
  }
}
