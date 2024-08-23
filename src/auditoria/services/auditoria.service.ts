import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess, formatOnlyDateForAccess } from 'src/assets/formatDate';
import { AuditoriaSearch, CreateAuditoriaDto } from '../dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from '../dto/update-auditoria.dto';
import { AuditoriaEntity } from '../entities/auditoria.entity';

@Injectable()
export class AuditoriaService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<AuditoriaEntity[]> {
    const query = `SELECT TOP 100 *
                   FROM Auditoria
                   ORDER BY [id_auditoria] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Pistas de auditoría no encontrada");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOne(id: number) {
    const query = `SELECT TOP 50 *
                   FROM Auditoria
                   WHERE [id_auditoria] = ${id}
                   ORDER BY [id_auditoria] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Pistas de auditoría no encontrada");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findByParams({ id_usuario, nombre_usuario, fecha }: AuditoriaSearch) {

    let fec = null;
    if (fecha) {
      fec = formatOnlyDateForAccess(fecha.toString());
    }

    const query = `SELECT TOP 50 *
                   FROM Auditoria
                   WHERE [id_usuario] = ${id_usuario} OR [nombre_usuario] LIKE '%${nombre_usuario}%' OR DateValue([fecha]) = ${fec}
                   ORDER BY [id_auditoria] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Pistas de auditoría no encontradas");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async create(auditoria: CreateAuditoriaDto) {
    const { id_usuario, nombre_usuario, fecha, accion, descripcion } = auditoria;

    if (!fecha) throw new BadRequestException("fecha faltante");
    const fec = formatDateForAccess(fecha.toString());

    const queryInsert = `INSERT INTO Auditoria(id_usuario, nombre_usuario, fecha, accion, descripcion)
                         VALUES( ${id_usuario}, '${nombre_usuario}', ${fec}, '${accion}', '${descripcion}' )`;

    const result = await this.accessService.executeQuery(queryInsert);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  update(id: number, updateAuditoriaDto: UpdateAuditoriaDto) {
    return `This action updates a #${id} auditoria`;
  }

  remove(id: number) {
    return `This action removes a #${id} auditoria`;
  }
}
