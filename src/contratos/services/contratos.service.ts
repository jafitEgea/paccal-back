import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess, formatOnlyDateForAccess } from 'src/assets/formatDate';
import { ContractSearchDto, CreateContratoDto } from '../dto/create-contrato.dto';
import { UpdateContratoDto } from '../dto/update-contrato.dto';
import { ContratoEntity } from '../entities/contrato.entity';

@Injectable()
export class ContratosService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<ContratoEntity[]> {
    const query = `SELECT TOP 50 
                    Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato(s) no encontrado(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));


    return result;
  }

  async findOne(id: number) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE Contratos.id_contrato = ${id} AND Contratos.[estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findOneByNumContract(num_contract: string) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE Contratos.[num_contrato] LIKE '%${num_contract}%' AND Contratos.[estado] = 1;`
    console.log('hola', query);
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato no encontrado");
    if (JSON.stringify(result).includes('Internal Server Error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findByIdContractor(id_contratista: number) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE Contratos.id_contratista = ${id_contratista} AND Contratos.[estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findByNameContractor(name: string) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE Personas.nombre & ' ' & Personas.apellidos LIKE '%${name}%' AND Contratos.[estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findByNumOrNameContractor({ num_contrato, nombre_contratista }: ContractSearchDto) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato,
                    Contratos.objeto,
                    Contratos.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    Contratos.fecha_inicial,
                    Contratos.fecha_final,
                    Contratos.estado,
                    Contratos.fecha_creacion,
                    Contratos.fecha_modificacion
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE ( [Personas.nombre] & ' ' & [Personas.apellidos] LIKE '%${nombre_contratista}%' OR [num_contrato] LIKE '%${num_contrato}%' )
                    AND Contratos.[estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Contrato o contratista no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async contractExists(body: UpdateContratoDto) {
    const { num_contrato, objeto, id_contratista, fecha_inicial, fecha_final } = body;
    let f_inicial = null, f_final = null;
    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    const query = `SELECT Count(*) AS [count]
                   FROM Contratos
                   WHERE [num_contrato] = '${num_contrato}' AND [objeto] = '${objeto}' AND [id_contratista] = ${id_contratista} 
                   AND [fecha_inicial] = ${f_inicial} AND [fecha_final] = ${f_final} AND [estado] = 1 ;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async contractExistsById(id: number) {
    const query = `SELECT Count(*) AS [count]
                   FROM Contratos WHERE [id_contrato] = ${id} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async contractExistsByNum(num_contrato: string) {
    const query = `SELECT Count(*) AS [count]
                   FROM Contratos WHERE [num_contrato] = '${num_contrato}' AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async createdContractExistsByNum(num_contrato: string, id: number) {
    const query = `SELECT Count(*) AS [count]
                   FROM Contratos WHERE [num_contrato] = '${num_contrato}' AND [id_contrato] = ${id} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async create(contrato: CreateContratoDto) {
    const { num_contrato, objeto, id_contratista, fecha_inicial, fecha_final, fecha_creacion } = contrato;

    let f_inicial = null, f_final = null, f_creacion = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    const query = `INSERT INTO Contratos(num_contrato, objeto, id_contratista, fecha_inicial, fecha_final, estado, fecha_creacion)
                   VALUES( '${num_contrato}', '${objeto}', ${id_contratista}, ${f_inicial}, ${f_final}, 1, ${f_creacion} )`
    const result = await this.accessService.executeQuery(query);

    return result;
  }

  async update(id: number, contrato: UpdateContratoDto) {
    const { num_contrato, objeto, id_contratista, fecha_inicial, fecha_final, fecha_modificacion } = contrato;

    let f_inicial = null, f_final = null, f_modificacion = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    const query = `UPDATE Contratos SET
                    [num_contrato] = '${num_contrato}',
                    [objeto] = '${objeto}',
                    [id_contratista] = ${id_contratista},
                    [fecha_inicial] = ${f_inicial},
                    [fecha_final] = ${f_final},
                    [fecha_modificacion] = ${f_modificacion}
                   WHERE [id_contrato] = ${id};`

    const result = await this.accessService.executeQuery(query);

    return result;
  }

  async delete(id: number) {
    const query = `UPDATE Contratos SET estado = 0 WHERE id_contrato = ${id}`;
    const result = await this.accessService.executeQuery(query);
    return result;
  }
}
