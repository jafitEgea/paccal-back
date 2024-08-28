import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess, formatOnlyDateForAccess, getDateAccessFormat } from 'src/assets/formatDate';
import { CreateCuentasCobroDto, CuentaCobroSearch } from '../dto/create-cuentas-cobro.dto';
import { UpdateCuentasCobroDto } from '../dto/update-cuentas-cobro.dto';
import { CuentasCobroEntity } from '../entities/cuentas-cobro.entity';

@Injectable()
export class CuentasCobroService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<CuentasCobroEntity[]> {
    const query = `SELECT TOP 10
                    cc.id_cuentacobro,
                    c.id_contratista,
                    TRIM((p1.nombre & ' ' & p1.apellidos)) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    TRIM((p2.nombre & ' ' & p2.apellidos)) AS nombre_aprobador,
                    emp.cargo AS cargo_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    TRIM((p3.nombre & ' ' & p3.apellidos)) AS nombre_revisor,
                    us.cargo AS cargo_revisor,                    
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.fecha_creacion,
                    cc.fecha_modificacion,
                    cc.estado
                   FROM (((((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Contratistas ca ON c.id_contratista = ca.id_contratista )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Empleados emp ON p2.id_persona = emp.id_empleado )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                    INNER JOIN Usuarios us ON p3.id_persona = us.id_usuario )
                   WHERE cc.[estado] = 1
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    return result;
  }

  async findAllByType(tipo: string): Promise<CuentasCobroEntity[]> {
    const query = `SELECT TOP 50
                    cc.id_cuentacobro,
                    c.id_contratista,
                    TRIM((p1.nombre & ' ' & p1.apellidos)) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    TRIM((p2.nombre & ' ' & p2.apellidos)) AS nombre_aprobador,
                    emp.cargo AS cargo_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    TRIM((p3.nombre & ' ' & p3.apellidos)) AS nombre_revisor,
                    us.cargo AS cargo_revisor,                    
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.fecha_creacion,
                    cc.fecha_modificacion,
                    cc.estado
                   FROM (((((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Contratistas ca ON c.id_contratista = ca.id_contratista )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Empleados emp ON p2.id_persona = emp.id_empleado )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                    INNER JOIN Usuarios us ON p3.id_persona = us.id_usuario )
                   WHERE ca.[tipo] LIKE '%${tipo}%' AND cc.[estado] = 1
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    for (let item of result) {
      let id_cuentacobro = item.id_cuentacobro;
      let query2 = `SELECT ccr.id_cuentacobro_requisito,
                      ccr.id_cuentacobro,
                      ccr.id_requisito,
                      r.nombre,
                      ccr.marcado
                    FROM ( CuentasCobroRequisitos ccr
                      INNER JOIN Requisitos r ON ccr.id_requisito = r.id_requisito )
                    WHERE ccr.[id_cuentacobro] = ${id_cuentacobro} AND r.[estado] = 1 ;`
      item.requisitos = await this.accessService.executeQuery(query2);
    }

    return result;
  }

  // async findAll(): Promise<CuentasCobroEntity[]> {
  //   const query = `SELECT * FROM CuentasCobro WHERE [estado] = 1 ORDER BY [id_cuentacobro] DESC;`;
  //   const result = await this.accessService.executeQuery(query);

  //   if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
  //   if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
  //   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

  //   for (let item of result) {
  //     let id_cuentacobro = item.id_cuentacobro;
  //     let query2 = `SELECT * FROM CuentasCobroRequisitos
  //                    WHERE [id_cuentacobro] = ${id_cuentacobro} ;`
  //     item.requisitos = await this.accessService.executeQuery(query2);
  //   }

  //   return result;
  // }

  // async findOne(id: number) {
  //   const query = `SELECT
  //                   cc.id_cuentacobro,
  //                   c.id_contratista,
  //                   TRIM((p1.nombre & ' ' & p1.apellidos)) AS nombre_contratista,
  //                   cc.id_contrato,
  //                   c.num_contrato,
  //                   c.objeto,
  //                   cc.id_aprobador,
  //                   TRIM((p2.nombre & ' ' & p2.apellidos)) AS nombre_aprobador,
  //                   emp.cargo AS cargo_aprobador,
  //                   cc.fecha_aprobacion,
  //                   cc.id_revisor,
  //                   TRIM((p3.nombre & ' ' & p3.apellidos)) AS nombre_revisor,
  //                   us.cargo AS cargo_revisor,  
  //                   cc.observaciones,
  //                   cc.oficina_receptora,
  //                   cc.fecha_inicial,
  //                   cc.fecha_final,
  //                   cc.periodo,
  //                   cc.url,
  //                   cc.fecha_creacion,
  //                   cc.fecha_modificacion,
  //                   cc.estado
  //                  FROM ((((CuentasCobro cc
  //                   INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
  //                   INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
  //                   INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
  //                   INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
  //                  WHERE cc.id_cuentacobro = ${id} AND cc.[estado] = 1;`;
  //   let result = await this.accessService.executeQuery(query);

  //   if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
  //   if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
  //   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

  //   const query2 = `SELECT * FROM CuentasCobroRequisitos
  //                   WHERE [id_cuentacobro] = ${id} ;`
  //   result[0].requisitos = await this.accessService.executeQuery(query2);

  //   return result;
  // }

  async findOne(id: number) {
    const query = `SELECT TOP 50
                    cc.id_cuentacobro,
                    c.id_contratista,
                    TRIM((p1.nombre & ' ' & p1.apellidos)) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    TRIM((p2.nombre & ' ' & p2.apellidos)) AS nombre_aprobador,
                    emp.cargo AS cargo_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    TRIM((p3.nombre & ' ' & p3.apellidos)) AS nombre_revisor,
                    us.cargo AS cargo_revisor,                    
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.fecha_creacion,
                    cc.fecha_modificacion,
                    cc.estado
                   FROM (((((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Contratistas ca ON c.id_contratista = ca.id_contratista )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Empleados emp ON p2.id_persona = emp.id_empleado )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                    INNER JOIN Usuarios us ON p3.id_persona = us.id_usuario )
                   WHERE [id_cuentacobro] = ${id} AND cc.[estado] = 1
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    const query2 = `SELECT ccr.id_cuentacobro_requisito,
                      ccr.id_cuentacobro,
                      ccr.id_requisito,
                      r.nombre,
                      ccr.marcado
                    FROM ( CuentasCobroRequisitos ccr
                      INNER JOIN Requisitos r ON ccr.id_requisito = r.id_requisito )
                    WHERE ccr.[id_cuentacobro] = ${id} AND r.[estado] = 1 ;`
    result[0].requisitos = await this.accessService.executeQuery(query2);

    return result;
  }

  async findByParams({ id_cuentacobro, nombre_contratista, num_contrato, nombre_revisor }: CuentaCobroSearch, tipo: string) {
    const query = `SELECT TOP 50
                    cc.id_cuentacobro,
                    c.id_contratista,
                    TRIM((p1.nombre & ' ' & p1.apellidos)) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    TRIM((p2.nombre & ' ' & p2.apellidos)) AS nombre_aprobador,
                    emp.cargo AS cargo_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    TRIM((p3.nombre & ' ' & p3.apellidos)) AS nombre_revisor,
                    us.cargo AS cargo_revisor,                    
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.fecha_creacion,
                    cc.fecha_modificacion,
                    cc.estado
                   FROM (((((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Contratistas ca ON c.id_contratista = ca.id_contratista )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Empleados emp ON p2.id_persona = emp.id_empleado )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                    INNER JOIN Usuarios us ON p3.id_persona = us.id_usuario )
                   WHERE ( 
                    cc.id_cuentacobro = ${id_cuentacobro} OR
                    c.num_contrato LIKE '%${num_contrato}%' OR
                    p1.nombre & ' ' & p1.apellidos LIKE '%${nombre_contratista}%' OR
                    p3.nombre & ' ' & p3.apellidos LIKE '%${nombre_revisor}%' 
                    ) 
                    AND ca.[tipo] LIKE '%${tipo}%' AND cc.[estado] = 1
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    for (let item of result) {
      let id_cuentacobro = item.id_cuentacobro;
      let query2 = `SELECT ccr.id_cuentacobro_requisito,
                      ccr.id_cuentacobro,
                      ccr.id_requisito,
                      r.nombre,
                      ccr.marcado
                    FROM ( CuentasCobroRequisitos ccr
                      INNER JOIN Requisitos r ON ccr.id_requisito = r.id_requisito )
                    WHERE ccr.[id_cuentacobro] = ${id_cuentacobro} AND r.[estado] = 1 ;`
      item.requisitos = await this.accessService.executeQuery(query2);
    }

    // const id_cuentacobro = result[0].id_cuentacobro;
    // const query2 = `SELECT * FROM CuentasCobroRequisitos
    //                 WHERE [id_cuentacobro] = ${id_cuentacobro} ;`
    // result[0].requisitos = await this.accessService.executeQuery(query2);

    return result;

  }

  // async findByIdContractor(id_contratista: number) {
  //   const query = `SELECT * FROM CuentasCobro
  //                  WHERE [id_contratista] = ${id_contratista} AND [estado] = 1;`;
  //   let result = await this.accessService.executeQuery(query);

  //   if (JSON.stringify(result) == '[]') throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
  //   if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
  //   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));


  //   return result;

  // }

  async accountReceivableExistsForUpdate(body: UpdateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, fecha_creacion, fecha_modificacion, requisitos } = body;

    let f_inicial = null, f_final = null, f_aprobacion = null, f_creacion = null, f_modificacion = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    let f_aprobacion_cond = null, f_creacion_cond = null, f_modificacion_cond = null;
    if (fecha_aprobacion) {
      f_aprobacion = formatOnlyDateForAccess(fecha_aprobacion.toString());
      f_aprobacion_cond = `AND [fecha_aprobacion] = ${f_aprobacion}`;
    } else {
      f_aprobacion_cond = 'AND [fecha_aprobacion] IS NULL';
    }

    if (fecha_creacion) {
      f_creacion = formatDateForAccess(fecha_creacion.toString());
      f_creacion_cond = `AND [fecha_creacion] = ${f_creacion}`;
    } else {
      f_creacion_cond = 'AND [fecha_creacion] IS NULL';
    }

    if (fecha_modificacion) {
      f_modificacion = formatDateForAccess(fecha_modificacion.toString());
      f_modificacion_cond = `AND [fecha_modificacion] = ${f_modificacion}`;
    } else {
      f_modificacion_cond = 'AND [fecha_modificacion] IS NULL';
    }

    let observaciones_cond = observaciones ? `AND [observaciones] = '${observaciones}'` : 'AND [observaciones] IS NULL';

    let periodo_cond = periodo ? `AND [periodo] = '${periodo}'` : 'AND [periodo] IS NULL';

    let url_cond = url ? `AND [url] = '${url}'` : 'AND [url] IS NULL';

    const query = `SELECT Count(*) AS [count]
                   FROM CuentasCobro 
                   WHERE [id_contrato] = ${id_contrato} 
                    AND [id_aprobador] = ${id_aprobador}
                    ${f_aprobacion_cond}
                    AND [id_revisor] = ${id_revisor}
                    ${observaciones_cond}
                    AND [oficina_receptora] = '${oficina_receptora}'
                    AND [fecha_inicial] = ${f_inicial} 
                    AND [fecha_final] = ${f_final}
                    ${periodo_cond}
                    ${url_cond}
                    ${f_creacion_cond}
                    ${f_modificacion_cond}
                    AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    return result[0].count > 0;
  }

  async accountReceivableExists(body: UpdateCuentasCobroDto) {
    const { id_contrato, fecha_inicial, fecha_final } = body;

    let f_inicial = null, f_final = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    const query = `SELECT Count(*) AS [count]
                   FROM CuentasCobro 
                   WHERE [id_contrato] = ${id_contrato} 
                    AND [fecha_inicial] = ${f_inicial} 
                    AND [fecha_final] = ${f_final}
                    AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  async accountReceivableExistsById(id: number) {
    const query = `SELECT Count(*) AS [count]
                   FROM CuentasCobro WHERE [id_cuentacobro] = ${id} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  /* FUNCIONES DE VALIDACION */
  async maxDatesAccountReceivable(id_contrato: number) {

    const query = `SELECT 
                    MAX(fecha_inicial) As fecha_inicial_max,
                    MAX(fecha_final) As fecha_final_max
                   FROM CuentasCobro
                   WHERE [id_contrato] = ${id_contrato} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    const response = {
      fecha_inicial_max: result[0].fecha_inicial_max ?? null,
      fecha_final_max: result[0].fecha_final_max ?? null,
    }

    return response;
  }

  async datesAccountReceivable(id_ccobro: number) {
    const query = `SELECT fecha_inicial, fecha_final
                   FROM CuentasCobro
                   WHERE [id_cuentacobro] = ${id_ccobro} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    const response = {
      fecha_inicial_actual: result[0].fecha_inicial ?? null,
      fecha_final_actual: result[0].fecha_final ?? null,
    }
    return response;
  }

  async datesContract(id_contrato: number) {
    const query = `SELECT fecha_inicial, fecha_final
                   FROM Contratos
                   WHERE [id_contrato] = ${id_contrato} AND [estado] = 1;`
    const result = await this.accessService.executeQuery(query);

    const response = {
      fecha_inicial_contrato: result[0].fecha_inicial ?? null,
      fecha_final_contrato: result[0].fecha_final ?? null,
    }
    return response;
  }

  /* ------------------- */

  async create(cuentaCobro: CreateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, fecha_creacion, requisitos } = cuentaCobro;

    let f_inicial = null, f_final = null, f_aprobacion = null, f_creacion = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_aprobacion) f_aprobacion = formatDateForAccess(fecha_aprobacion.toString());

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    // VALIDACION DE FECHAS
    // const { fecha_inicial_max, fecha_final_max } = await this.maxDatesAccountReceivable(id_contrato);
    // FECHAS PARA IMPRIMIR
    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));
    // const f_inicial_max_format = getDateAccessFormat(String(fecha_inicial_max));
    // const f_final_max_format = getDateAccessFormat(String(fecha_final_max));

    if (f_inicial_format >= f_final_format) {
      throw new BadRequestException(`La fecha final debe ser mayor que la fecha inicial`);
    }

    // //VERIFICO EL CRUZAMIENTO DE FECHAS
    // if ((f_inicial_format <= f_inicial_max_format) || (f_inicial_format >= f_inicial_max_format && f_inicial_format <= f_final_max_format)) {
    //   throw new BadRequestException(`La fecha de inicio (${f_inicial_format}) debe ser posterior a (${f_final_max_format})`);
    // }

    // if (f_final_format <= f_final_max_format) {
    //   throw new BadRequestException(`La fecha de terminación (${f_final_format}) debe ser posterior a ${f_final_max_format}`);
    // }

    //VERIFICO LIMITES DEL CONTRATO DE LA CUENTA
    const { fecha_final_contrato, fecha_inicial_contrato } = await this.datesContract(id_contrato);
    const f_inicial_contrato_format = getDateAccessFormat(String(fecha_inicial_contrato));
    const f_final_contrato_format = getDateAccessFormat(String(fecha_final_contrato));

    if (f_inicial_format < f_inicial_contrato_format) {
      throw new BadRequestException(`La fecha inicial (${f_inicial_format}) es anterior a la fecha de inicio del contrato (${f_inicial_contrato_format}).`);
    }

    if (f_inicial_format > f_final_contrato_format) {
      throw new BadRequestException(`La fecha inicial (${f_inicial_format}) es posterior a la fecha de terminación del contrato (${f_final_contrato_format}). Considere crear un nuevo contrato.`);
    }

    if (f_final_format < f_inicial_contrato_format) {
      throw new BadRequestException(`La fecha final (${f_final_format}) es anterior a la fecha de inicio del contrato (${f_inicial_contrato_format}).`);
    }

    if (f_final_format > f_final_contrato_format) {
      throw new BadRequestException(`La fecha final (${f_final_format}) es posterior a la fecha de terminación del contrato (${f_final_contrato_format}). Considere crear un nuevo contrato.`);
    }

    // <! --------------------- >

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const query = `INSERT INTO CuentasCobro(id_contrato, id_aprobador, fecha_aprobacion, id_revisor, observaciones,
                                            oficina_receptora, fecha_inicial, fecha_final, periodo, url, fecha_creacion, estado)
                   VALUES( ${id_contrato}, ${id_aprobador}, ${f_aprobacion}, ${id_revisor}, '${observaciones}',
                           '${oficina_receptora}', ${f_inicial}, ${f_final}, '${periodo}', '${url}', ${f_creacion}, 1);`;
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
      await this.accessService.rollbackTransaction();
      throw new InternalServerErrorException(JSON.stringify(result));
    }

    const querySelect = `SELECT [id_cuentacobro] FROM CuentasCobro
                         WHERE [id_contrato] = ${id_contrato}
                          AND [fecha_inicial] = ${f_inicial}
                          AND [fecha_final] = ${f_final}
                          AND [fecha_creacion] = ${f_creacion}
                         ORDER BY [id_cuentacobro] DESC;`;
    result = await this.accessService.executeQuery(querySelect);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
      await this.accessService.rollbackTransaction();
      throw new InternalServerErrorException(JSON.stringify(result));
    }

    const id_cuentacobro = result[0].id_cuentacobro;

    let queryRequisito = null;
    for (let item of requisitos) {
      queryRequisito = `INSERT INTO CuentasCobroRequisitos(id_cuentacobro, id_requisito, marcado)
                        VALUES( ${id_cuentacobro}, ${item.id_requisito}, ${item.marcado} )`
      result = await this.accessService.executeQuery(queryRequisito);

      if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
        await this.accessService.rollbackTransaction();
        throw new InternalServerErrorException(JSON.stringify(result));
      }

    }

    // END TRANSACTION
    await this.accessService.commitTransaction();

    return result;
  }

  async update(id: number, cuentaCobro: UpdateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor, observaciones,
      oficina_receptora, fecha_inicial, fecha_final, periodo, url, fecha_modificacion, requisitos } = cuentaCobro;
    let f_inicial = null, f_final = null, f_aprobacion = null, f_modificacion = null;
    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_aprobacion) f_aprobacion = formatDateForAccess(fecha_aprobacion.toString());

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    // VALIDACION DE FECHAS
    // const { fecha_inicial_actual, fecha_final_actual } = await this.datesAccountReceivable(id);
    // const { fecha_inicial_max, fecha_final_max } = await this.maxDatesAccountReceivable(id_contrato);
    // FECHAS PARA IMPRIMIR
    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));
    // const f_inicial_max_format = getDateAccessFormat(String(fecha_inicial_max));
    // const f_final_max_format = getDateAccessFormat(String(fecha_final_max));
    // const f_inicial_actual_format = getDateAccessFormat(String(fecha_inicial_actual));
    // const f_final_actual_format = getDateAccessFormat(String(fecha_final_actual));

    if (f_inicial_format >= f_final_format) {
      throw new BadRequestException(`La fecha final debe ser mayor que la fecha inicial`);
    }

    //VERIFICO EL CRUZAMIENTO DE FECHAS
    // if ((f_inicial_format <= f_inicial_max_format) || (f_inicial_format >= f_inicial_max_format && f_inicial_format <= f_final_max_format)) {
    //   // VERIFICO SI ES EL MISMO EL QUE SE VA A MODIFICAR
    //   if (f_inicial_format < f_inicial_actual_format || f_final_format > f_final_actual_format)
    //     throw new BadRequestException(`La fecha de inicio (${f_inicial_format}) debe ser posterior a (${f_final_max_format})`);
    // }

    // if (f_final_format <= f_final_max_format) {
    //   throw new BadRequestException(`La fecha de terminación (${f_final_format}) debe ser posterior a ${f_final_max_format}`);
    // }

    //VERIFICO LIMITES DEL CONTRATO DE LA CUENTA
    const { fecha_final_contrato, fecha_inicial_contrato } = await this.datesContract(id_contrato);
    const f_inicial_contrato_format = getDateAccessFormat(String(fecha_inicial_contrato));
    const f_final_contrato_format = getDateAccessFormat(String(fecha_final_contrato));

    if (f_inicial_format < f_inicial_contrato_format) {
      throw new BadRequestException(`La fecha inicial (${f_inicial_format}) es anterior a la fecha de inicio del contrato (${f_inicial_contrato_format}).`);
    }

    if (f_inicial_format > f_final_contrato_format) {
      throw new BadRequestException(`La fecha inicial (${f_inicial_format}) es posterior a la fecha de terminación del contrato (${f_final_contrato_format}). Considere crear un nuevo contrato.`);
    }

    if (f_final_format < f_inicial_contrato_format) {
      throw new BadRequestException(`La fecha final (${f_final_format}) es anterior a la fecha de inicio del contrato (${f_inicial_contrato_format}).`);
    }

    if (f_final_format > f_final_contrato_format) {
      throw new BadRequestException(`La fecha final (${f_final_format}) es posterior a la fecha de terminación del contrato (${f_final_contrato_format}). Considere crear un nuevo contrato.`);
    }

    // <! --------------------- >

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const query = `UPDATE CuentasCobro SET
                    [id_contrato] = ${id_contrato},
                    [id_aprobador] = ${id_aprobador},
                    [fecha_aprobacion] = ${f_aprobacion},
                    [id_revisor] = ${id_revisor},
                    [observaciones] = '${observaciones}',
                    [oficina_receptora] = '${oficina_receptora}',
                    [fecha_inicial] = ${f_inicial},
                    [fecha_final] = ${f_final},
                    [periodo] = '${periodo}',
                    [url] = '${url}',
                    [fecha_modificacion] = ${f_modificacion}
                   WHERE [id_cuentacobro] = ${id};`
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
      await this.accessService.rollbackTransaction();
      throw new InternalServerErrorException(JSON.stringify(result));
    }

    let queryRequisito = null;
    if (requisitos) {
      for (let item of requisitos) {
        queryRequisito = `UPDATE CuentasCobroRequisitos SET
                           [marcado] = ${item.marcado}
                          WHERE [id_cuentacobro] = ${id} AND [id_requisito] = ${item.id_requisito};`
        result = await this.accessService.executeQuery(queryRequisito);

        if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
          await this.accessService.rollbackTransaction();
          throw new InternalServerErrorException(JSON.stringify(result));
        }

      }
    }

    // END TRANSACTION
    await this.accessService.commitTransaction();

    return result;
  }

  async delete(id: number) {

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const query2 = `DELETE FROM CuentasCobroRequisitos WHERE [id_cuentacobro] = ${id}`;
    let result = await this.accessService.executeQuery(query2);
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
      await this.accessService.rollbackTransaction();
      throw new InternalServerErrorException(JSON.stringify(result));
    }

    const query = `DELETE FROM CuentasCobro WHERE id_cuentacobro = ${id}`;
    result = await this.accessService.executeQuery(query);
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
      await this.accessService.rollbackTransaction();
      throw new InternalServerErrorException(JSON.stringify(result));
    }

    // END TRANSACTION
    await this.accessService.commitTransaction();

    return result;
  }
}
