import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess, formatOnlyDateForAccess, getDateAccessFormat } from 'src/assets/formatDate';
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

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato(s) no encontrado(s)");
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
                  WHERE Contratos.id_contrato = ${id} AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato no encontrado");
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
                  WHERE Contratos.[num_contrato] LIKE '%${num_contract}%' AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato no encontrado");
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
                  WHERE Contratos.id_contratista = ${id_contratista} AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findMostRecentContractByIdContractor(id_contratista: number) {
    const query = `SELECT c1.id_contrato,
                    c1.num_contrato,
                    c1.objeto,
                    c1.id_contratista,
                    TRIM((Personas.nombre & ' ' & Personas.apellidos)) AS nombre_contratista,
                    c1.fecha_inicial,
                    c1.fecha_final,
                    c1.estado,
                    c1.fecha_creacion,
                    c1.fecha_modificacion
                  FROM ((Contratos AS c1
                   INNER JOIN Contratistas ON c1.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE c1.id_contratista = ${id_contratista} AND 
                    c1.fecha_final = ( SELECT MAX(c2.fecha_final) 
                                       FROM Contratos AS c2 
                                       WHERE c1.id_contratista = c2.id_contratista AND c2.estado = 1)
                    AND c1.estado = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato no encontrado");
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
                  WHERE Personas.nombre & ' ' & Personas.apellidos LIKE '%${name}%' AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato no encontrado");
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
                    AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato o contratista no encontrado");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findNumsByNumAndNameContractor({ num_contrato, nombre_contratista }: ContractSearchDto) {
    const query = `SELECT Contratos.id_contrato,
                    Contratos.num_contrato
                  FROM ((Contratos
                   INNER JOIN Contratistas ON Contratos.id_contratista = Contratistas.id_contratista)
                   INNER JOIN Personas ON Contratistas.id_contratista = Personas.id_persona)
                  WHERE ( [Personas.nombre] & ' ' & [Personas.apellidos] LIKE '%${nombre_contratista}%' AND [num_contrato] LIKE '%${num_contrato}%' )
                    AND Contratos.[estado] = 1
                  ORDER BY [id_contrato] DESC;`
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result) == '[]') throw new NotFoundException("Contrato o contratista no encontrado");
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

  /* FUNCIONES DE VALIDACION */
  async maxDatesContract(id_contratista: number) {
    const query = `SELECT 
                    MAX(fecha_inicial) As fecha_inicial_max,
                    MAX(fecha_final) As fecha_final_max
                   FROM Contratos
                   WHERE [id_contratista] = ${id_contratista} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    const response = {
      fecha_inicial_max: result[0].fecha_inicial_max ?? null,
      fecha_final_max: result[0].fecha_final_max ?? null,
    }
    return response;
  }

  async datesContract(id_contrato: number) {
    const query = `SELECT fecha_inicial, fecha_final
                  FROM Contratos
                   WHERE [id_contrato] = ${id_contrato} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    const response = {
      fecha_inicial_actual: result[0].fecha_inicial ?? null,
      fecha_final_actual: result[0].fecha_final ?? null,
    }
    return response;
  }

  /* -------------------- */

  async create(contrato: CreateContratoDto) {
    const { num_contrato, objeto, id_contratista, fecha_inicial, fecha_final, fecha_creacion } = contrato;

    let f_inicial = null, f_final = null, f_creacion = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    // VALIDACION DE FECHAS
    // const { fecha_inicial_max, fecha_final_max } = await this.maxDatesContract(id_contratista);
    // FECHAS PARA IMPRIMIR
    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));
    // const f_inicial_max_format = getDateAccessFormat(String(fecha_inicial_max));
    // const f_final_max_format = getDateAccessFormat(String(fecha_final_max));

    if (f_inicial_format > f_final_format) {
      throw new BadRequestException(`La fecha de terminación debe ser mayor o igual que la fecha de inicio`);
    }

    // //VERIFICO EL CRUZAMIENTO DE FECHAS
    // if ((f_inicial_format <= f_inicial_max_format) || (f_inicial_format >= f_inicial_max_format && f_inicial_format <= f_final_max_format)) {
    //   throw new BadRequestException(`La fecha de inicio (${f_inicial_format}) debe ser posterior a (${f_final_max_format})`);
    // }

    // if (f_final_format <= f_final_max_format) {
    //   throw new BadRequestException(`La fecha de terminación (${f_final_format}) debe ser posterior a ${f_final_max_format}`);
    // }

    // INSERCION
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


    // VALIDACION DE FECHAS
    // FECHAS PARA COMPARAR
    // const { fecha_inicial_actual, fecha_final_actual } = await this.datesContract(id);
    // const { fecha_inicial_max, fecha_final_max } = await this.maxDatesContract(id_contratista);

    // FECHAS PARA IMPRIMIR
    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));
    // const f_inicial_max_format = getDateAccessFormat(String(fecha_inicial_max));
    // const f_final_max_format = getDateAccessFormat(String(fecha_final_max));
    // const f_inicial_actual_format = getDateAccessFormat(String(fecha_inicial_actual));
    // const f_final_actual_format = getDateAccessFormat(String(fecha_final_actual));

    if (f_inicial_format > f_final_format) {
      throw new BadRequestException(`La fecha de terminación debe ser mayor o igual que la fecha de inicio`);
    }
    // //VERIFICO EL CRUZAMIENTO DE FECHAS
    // if ((f_inicial_format <= f_inicial_max_format) || (f_inicial_format >= f_inicial_max_format && f_inicial_format <= f_final_max_format)) {
    //   // VERIFICO SI ES EL MISMO EL QUE SE VA A MODIFICAR
    //   if (f_inicial_format < f_inicial_actual_format || f_final_format > f_final_actual_format)
    //     throw new BadRequestException(`La fecha de inicio (${f_inicial_format}) debe ser posterior a (${f_final_max_format})`);
    // }

    // if (f_final_format <= f_final_max_format) {
    //   throw new BadRequestException(`La fecha de terminación (${f_final_format}) debe ser posterior a ${f_final_max_format}`);
    // }

    // <! --------------------- >
    const query = `UPDATE Contratos SET
                    [num_contrato] = '${num_contrato}',
                    [objeto] = '${objeto}',
                    [id_contratista] = ${id_contratista},
                    [fecha_inicial] = ${f_inicial},
                    [fecha_final] = ${f_final},
                    [fecha_modificacion] = ${f_modificacion}
                   WHERE [id_contrato] = ${id};`

    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async delete(id: number) {
    const query = `DELETE FROM Contratos WHERE id_contrato = ${id}`;
    const result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));
    return result;
  }
}
