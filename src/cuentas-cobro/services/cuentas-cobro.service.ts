import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatOnlyDateForAccess } from 'src/assets/formatDate';
import { CreateCuentasCobroDto } from '../dto/create-cuentas-cobro.dto';
import { UpdateCuentasCobroDto } from '../dto/update-cuentas-cobro.dto';
import { CuentasCobroEntity } from '../entities/cuentas-cobro.entity';

@Injectable()
export class CuentasCobroService {

  constructor(private accessService: AccessService) { }

  async findAll(): Promise<CuentasCobroEntity[]> {
    const query = `SELECT
                    cc.id_cuentacobro,
                    c.id_contratista,
                    (p1.nombre & ' ' & p1.apellidos) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    (p2.nombre & ' ' & p2.apellidos) AS nombre_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    (p3.nombre & ' ' & p3.apellidos) AS nombre_revisor,
                    cc.fecha_revision,
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.estado
                   FROM ((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                   WHERE cc.[estado] = 1
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    const result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    for (let item of result) {
      let id_cuentacobro = item.id_cuentacobro;
      let query2 = `SELECT * FROM CuentasCobroRequisitos
                   WHERE [id_cuentacobro] = ${id_cuentacobro} ;`
      item.requisitos = await this.accessService.executeQuery(query2);
    }

    return result;
  }

  // async findAll(): Promise<CuentasCobroEntity[]> {
  //   const query = `SELECT * FROM CuentasCobro WHERE [estado] = 1 ORDER BY [id_cuentacobro] DESC;`;
  //   const result = await this.accessService.executeQuery(query);

  //   if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
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
  //                   (p1.nombre & ' ' & p1.apellidos) AS nombre_contratista,
  //                   cc.id_contrato,
  //                   c.num_contrato,
  //                   c.objeto,
  //                   cc.id_aprobador,
  //                   (p2.nombre & ' ' & p2.apellidos) AS nombre_aprobador,
  //                   cc.fecha_aprobacion,
  //                   cc.id_revisor,
  //                   (p3.nombre & ' ' & p3.apellidos) AS nombre_revisor,
  //                   cc.fecha_revision,
  //                   cc.observaciones,
  //                   cc.oficina_receptora,
  //                   cc.fecha_inicial,
  //                   cc.fecha_final,
  //                   cc.periodo,
  //                   cc.url,
  //                   cc.estado
  //                  FROM ((((CuentasCobro cc
  //                   INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
  //                   INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
  //                   INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
  //                   INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
  //                  WHERE cc.id_cuentacobro = ${id} AND cc.[estado] = 1;`;
  //   let result = await this.accessService.executeQuery(query);

  //   if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
  //   if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
  //   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

  //   const query2 = `SELECT * FROM CuentasCobroRequisitos
  //                   WHERE [id_cuentacobro] = ${id} ;`
  //   result[0].requisitos = await this.accessService.executeQuery(query2);

  //   return result;
  // }

  async findOne(id: number) {
    const query = `SELECT * FROM CuentasCobro
                   WHERE [id_cuentacobro] = ${id} AND [estado] = 1;`;
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    const query2 = `SELECT * FROM CuentasCobroRequisitos
                    WHERE [id_cuentacobro] = ${id} ;`
    result[0].requisitos = await this.accessService.executeQuery(query2);

    return result;
  }

  async findByIdContractor(id_contratista: number) {
    const query = `SELECT
                    cc.id_cuentacobro,
                    c.id_contratista,
                    (p1.nombre & ' ' & p1.apellidos) AS nombre_contratista,
                    cc.id_contrato,
                    c.num_contrato,
                    c.objeto,
                    cc.id_aprobador,
                    (p2.nombre & ' ' & p2.apellidos) AS nombre_aprobador,
                    cc.fecha_aprobacion,
                    cc.id_revisor,
                    (p3.nombre & ' ' & p3.apellidos) AS nombre_revisor,
                    cc.fecha_revision,
                    cc.observaciones,
                    cc.oficina_receptora,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.estado
                   FROM ((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                   WHERE c.id_contratista = ${id_contratista} AND cc.[estado] = 1;`;
    let result = await this.accessService.executeQuery(query);

    if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
    if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
    if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));

    for (let item of result) {
      let id_cuentacobro = item.id_cuentacobro;
      let query2 = `SELECT * FROM CuentasCobroRequisitos
                     WHERE [id_cuentacobro] = ${id_cuentacobro} ;`
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

  //   if (JSON.stringify(result).includes('[]')) throw new NotFoundException("Cuenta(s) de cobro no encontrada(s)");
  //   if (JSON.stringify(result).includes('Internal server error')) throw new InternalServerErrorException('Error interno');
  //   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) throw new InternalServerErrorException(JSON.stringify(result));


  //   return result;

  // }

  async accountReceivableExistsForUpdate(body: UpdateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor, fecha_revision,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, requisitos } = body;

    let f_inicial = null, f_final = null, f_aprobacion = null, f_revision = null;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    let f_aprobacion_cond = null, f_revision_cond = null;
    if (fecha_aprobacion) {
      f_aprobacion = formatOnlyDateForAccess(fecha_aprobacion.toString());
      f_aprobacion_cond = `AND [fecha_aprobacion] = ${f_aprobacion}`;
    } else {
      f_aprobacion_cond = 'AND [fecha_aprobacion] IS NULL';
    }
    if (fecha_revision) {
      f_revision = formatOnlyDateForAccess(fecha_revision.toString());
      f_revision_cond = `AND [fecha_revision] = ${f_revision}`;
    } else {
      f_revision_cond = 'AND [fecha_revision] IS NULL';
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
                    ${f_revision_cond}
                    ${observaciones_cond}
                    AND [oficina_receptora] = '${oficina_receptora}'
                    AND [fecha_inicial] = ${f_inicial} 
                    AND [fecha_final] = ${f_final}
                    ${periodo_cond}
                    ${url_cond}
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

  async create(cuentaCobro: CreateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor, fecha_revision,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, requisitos } = cuentaCobro;

    let f_inicial = null, f_final = null, f_aprobacion = null, f_revision = null;
    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");

    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_aprobacion) f_aprobacion = formatOnlyDateForAccess(fecha_aprobacion.toString());
    if (fecha_revision) f_revision = formatOnlyDateForAccess(fecha_revision.toString());

    // BEGIN TRANSACTION
    await this.accessService.executeTransaction();

    const query = `INSERT INTO CuentasCobro(id_contrato, id_aprobador, fecha_aprobacion, id_revisor, fecha_revision, 
                                            observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, estado)
                   VALUES( ${id_contrato}, ${id_aprobador}, ${f_aprobacion}, ${id_revisor}, ${f_revision}, 
                          '${observaciones}', '${oficina_receptora}', ${f_inicial}, ${f_final}, '${periodo}', '${url}', 1);`;
    await this.accessService.executeQuery(query);

    const querySelect = `SELECT [id_cuentacobro] FROM CuentasCobro
                         WHERE [id_contrato] = ${id_contrato}
                          AND [fecha_inicial] = ${f_inicial}
                          AND [fecha_final] = ${f_final}
                         ORDER BY [id_cuentacobro] DESC;`;
    const result = await this.accessService.executeQuery(querySelect);
    const id_cuentacobro = result[0].id_cuentacobro;

    let queryRequisito = null, result2 = null;
    for (let item of requisitos) {
      queryRequisito = `INSERT INTO CuentasCobroRequisitos(id_cuentacobro, id_requisito, marcado)
                        VALUES( ${id_cuentacobro}, ${item.id_requisito}, ${item.marcado} )`
      result2 = await this.accessService.executeQuery(queryRequisito);
    }

    // END TRANSACTION
    await this.accessService.commitTransaction();

    return result2;
  }

  async update(id: number, cuentaCobro: UpdateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor, fecha_revision,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, requisitos } = cuentaCobro;
    let f_inicial = null, f_final = null, f_aprobacion = null, f_revision = null;
    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");

    f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_aprobacion) f_aprobacion = formatOnlyDateForAccess(fecha_aprobacion.toString());
    if (fecha_revision) f_revision = formatOnlyDateForAccess(fecha_revision.toString());

    const query = `UPDATE CuentasCobro SET
                    [id_contrato] = ${id_contrato},
                    [id_aprobador] = ${id_aprobador},
                    [fecha_aprobacion] = ${f_aprobacion},
                    [id_revisor] = ${id_revisor},
                    [fecha_revision] = ${f_revision},
                    [observaciones] = '${observaciones}',
                    [oficina_receptora] = '${oficina_receptora}',
                    [fecha_inicial] = ${f_inicial},
                    [fecha_final] = ${f_final},
                    [periodo] = '${periodo}',
                    [url] = '${url}'
                   WHERE [id_cuentacobro] = ${id};`
    let result = await this.accessService.executeQuery(query);

    let queryRequisito = null;
    if (requisitos) {
      for (let item of requisitos) {
        queryRequisito = `UPDATE CuentasCobroRequisitos SET
                           [marcado] = ${item.marcado}
                          WHERE [id_cuentacobro] = ${id} AND [id_requisito] = ${item.id_requisito};`
        result = await this.accessService.executeQuery(queryRequisito);
      }
    }

    return result;
  }

  async delete(id: number) {
    const query = `UPDATE CuentasCobro SET estado = 0 WHERE id_cuentacobro = ${id}`;
    let result = await this.accessService.executeQuery(query);

    const query2 = `DELETE FROM CuentasCobroRequisitos WHERE [id_cuentacobro] = ${id}`;
    result = await this.accessService.executeQuery(query2);

    return result;
  }
}
