/**
 * ============================================================================
 * CUENTAS COBRO SERVICE — BUILDER (GoF)
 * ============================================================================
 *
 * PATRÓN: BUILDER (Creación)
 *
 * PROBLEMA (ANTES):
 *   El mismo SELECT de ~35 líneas con 7 INNER JOIN estaba copiado en 4 métodos:
 *   async findAll() {
 *     const query = `
 *       SELECT cc.id_cuentacobro, c.id_contratista, ...
 *       FROM (((((((CuentasCobro cc
 *       INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato)
 *       ... 7 JOINs ...
 *       WHERE cc.estado = 1
 *     `;
 *     // ... mismas 35 líneas copiadas
 *   }
 *   → Duplicación masiva; causó un bug real (nombre_receptor faltante).
 *
 * SOLUCIÓN (DESPUÉS):
 *   Los métodos usan Builders con interfaz fluida:
 *   new CuentasCobroSelectBuilder().top(10).build()
 *   new CuentasCobroSelectBuilder().top(50).whereTipoContratista(tipo).build()
 *   → El SELECT está centralizado en CuentasCobroSelectBuilder.
 *   → Si agrego un campo, se agrega una vez y beneficia a los 4 métodos.
 *
 * NOTA SOBRE ERRORES:
 *   El chequeo de "Internal server error" / "Error al ejecutar la consulta"
 *   que existía aquí antes ya no hace falta: AccessService (Adapter) ahora
 *   LANZA la excepción directamente. El 404 por resultado vacío lo maneja
 *   ThrowIfNotFoundInterceptor (Decorator) aplicado en el controlador.
 * ============================================================================
 */

import { BadRequestException, Injectable } from '@nestjs/common';
import { AccessService } from 'src/access/access.service';
import { formatDateForAccess, formatOnlyDateForAccess, getDateAccessFormat } from 'src/assets/formatDate';
import { CreateCuentasCobroDto, CuentaCobroSearch } from '../dto/create-cuentas-cobro.dto';
import { UpdateCuentasCobroDto } from '../dto/update-cuentas-cobro.dto';
import { CuentasCobroEntity } from '../entities/cuentas-cobro.entity';
import { CuentasCobroDeleteBuilder } from '../query/cuentas-cobro-delete.builder';
import { CuentasCobroInsertBuilder } from '../query/cuentas-cobro-insert.builder';
import { CuentasCobroSelectBuilder } from '../query/cuentas-cobro-select.builder';
import { CuentasCobroUpdateBuilder } from '../query/cuentas-cobro-update.builder';
import { CuentasCobroValidationSelectBuilder } from '../query/cuentas-cobro-validation-select.builder';

@Injectable()
export class CuentasCobroService {

  constructor(private accessService: AccessService) { }

  /**
   * BUILDER: Construye SELECT con TOP 10.
   * ANTES: 35 líneas de SQL copiadas.
   * DESPUÉS: new CuentasCobroSelectBuilder().top(10).build()
   */
  async findAll(): Promise<CuentasCobroEntity[]> {
    const query = new CuentasCobroSelectBuilder().top(10).build();
    return this.accessService.executeQuery(query);
  }

  /**
   * BUILDER: Construye SELECT con TOP 50 + WHERE por tipo.
   * ANTES: 35 líneas de SQL copiadas + validación de resultado vacío.
   * DESPUÉS: Builder + ThrowIfNotFoundInterceptor (Decorator) en controlador.
   */
  async findAllByType(tipo: string): Promise<CuentasCobroEntity[]> {
    const query = new CuentasCobroSelectBuilder().top(50).whereTipoContratista(tipo).build();
    const result = await this.accessService.executeQuery<CuentasCobroEntity & { requisitos?: any[] }>(query);

    for (const item of result) {
      const requisitosQuery = CuentasCobroSelectBuilder.buildRequisitosQuery(item.id_cuentacobro);
      item.requisitos = await this.accessService.executeQuery(requisitosQuery);
    }

    return result;
  }

  /**
   * BUILDER: Construye SELECT con WHERE por ID.
   * ANTES: 35 líneas de SQL copiadas + validación de resultado vacío.
   * DESPUÉS: Builder + ThrowIfNotFoundInterceptor (Decorator) en controlador.
   */
  async findOne(id: number) {
    const query = new CuentasCobroSelectBuilder().whereId(id).build();
    const result = await this.accessService.executeQuery<CuentasCobroEntity & { requisitos?: any[] }>(query);

    if (result.length === 0) return null;

    const requisitosQuery = CuentasCobroSelectBuilder.buildRequisitosQuery(id);
    result[0].requisitos = await this.accessService.executeQuery(requisitosQuery);

    return result;
  }

  /**
   * BUILDER: Construye SELECT con TOP 50 + WHERE por múltiples criterios.
   * ANTES: 35 líneas de SQL copiadas + validación de resultado vacío.
   * DESPUÉS: Builder + ThrowIfNotFoundInterceptor (Decorator) en controlador.
   */
  async findByParams(search: CuentaCobroSearch, tipo: string) {
    const query = new CuentasCobroSelectBuilder().top(50).whereBusqueda(search).whereTipoContratista(tipo).build();

    const result = await this.accessService.executeQuery<CuentasCobroEntity & { requisitos?: any[] }>(query);

    for (const item of result) {
      const requisitosQuery = CuentasCobroSelectBuilder.buildRequisitosQuery(item.id_cuentacobro);
      item.requisitos = await this.accessService.executeQuery(requisitosQuery);
    }

    return result;
  }

  async accountReceivableExistsForUpdate(body: UpdateCuentasCobroDto) {
    const {
      id_contrato,
      id_aprobador,
      fecha_aprobacion,
      id_revisor,
      observaciones,
      oficina_receptora,
      nombre_receptor,
      fecha_recibido,
      fecha_inicial,
      fecha_final,
      periodo,
      url,
      fecha_creacion,
      fecha_modificacion,
    } = body;

    if (!fecha_inicial) throw new BadRequestException("fecha_inicial faltante");
    if (!fecha_final) throw new BadRequestException("fecha_final faltante");
    if (!fecha_recibido) throw new BadRequestException("fecha_recibido faltante");
    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");

    const f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());
    const f_final = formatOnlyDateForAccess(fecha_final.toString());
    const f_recibido = formatDateForAccess(fecha_recibido.toString());

    const f_aprobacion = fecha_aprobacion
      ? formatDateForAccess(fecha_aprobacion.toString())
      : null;

    const f_creacion = formatDateForAccess(fecha_creacion.toString());
    const f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    const query = new CuentasCobroValidationSelectBuilder()
      .count()
      .whereNumber('id_contrato', id_contrato)
      .whereNumber('id_aprobador', id_aprobador)
      .whereRawNullOrEquals('fecha_aprobacion', f_aprobacion)
      .whereNumber('id_revisor', id_revisor)
      .whereStringNullOrEquals('observaciones', observaciones)
      .whereStringNullOrEquals('oficina_receptora', oficina_receptora)
      .whereStringNullOrEquals('nombre_receptor', nombre_receptor)
      .whereRaw('fecha_recibido', f_recibido)
      .whereRaw('fecha_inicial', f_inicial)
      .whereRaw('fecha_final', f_final)
      .whereStringNullOrEquals('periodo', periodo)
      .whereStringNullOrEquals('url', url)
      .whereRaw('fecha_creacion', f_creacion)
      .whereRaw('fecha_modificacion', f_modificacion)
      .whereEstadoActivo()
      .build();

    const result = await this.accessService.executeQuery<{ count: number }>(query);

    return result[0].count > 0;
  }

  async accountReceivableExists(body: UpdateCuentasCobroDto) {
    const { id_contrato, fecha_inicial, fecha_final } = body;

    const f_inicial = fecha_inicial ? formatOnlyDateForAccess(fecha_inicial.toString()) : null;

    const f_final = fecha_final ? formatOnlyDateForAccess(fecha_final.toString()) : null;

    const query = new CuentasCobroValidationSelectBuilder()
      .count()
      .whereNumber('id_contrato', id_contrato)
      .whereRaw('fecha_inicial', f_inicial)
      .whereRaw('fecha_final', f_final)
      .whereEstadoActivo()
      .build();

    const result = await this.accessService.executeQuery<{ count: number }>(query);

    return result[0].count > 0;
  }

  async accountReceivableExistsById(id: number) {
    const query = new CuentasCobroValidationSelectBuilder()
      .count()
      .whereNumber('id_cuentacobro', id)
      .whereEstadoActivo()
      .build();
    const result = await this.accessService.executeQuery(query);
    return result[0].count > 0;
  }

  /* FUNCIONES DE VALIDACION */
  async maxDatesAccountReceivable(id_contrato: number) {
    const query = new CuentasCobroValidationSelectBuilder()
      .select(
        'MAX([fecha_inicial]) AS [fecha_inicial_max]',
        'MAX([fecha_final]) AS [fecha_final_max]',
      )
      .whereNumber('id_contrato', id_contrato)
      .whereEstadoActivo()
      .build();

    const result = await this.accessService.executeQuery<{
      fecha_inicial_max: any;
      fecha_final_max: any;
    }>(query);

    return {
      fecha_inicial_max: result[0].fecha_inicial_max ?? null,
      fecha_final_max: result[0].fecha_final_max ?? null,
    };
  }

  async datesAccountReceivable(id_ccobro: number) {
    const query = new CuentasCobroValidationSelectBuilder()
      .select('[fecha_inicial]', '[fecha_final]',)
      .whereNumber('id_cuentacobro', id_ccobro)
      .whereEstadoActivo()
      .build();

    const result = await this.accessService.executeQuery<{
      fecha_inicial: any;
      fecha_final: any;
    }>(query);

    return {
      fecha_inicial_actual: result[0]?.fecha_inicial ?? null,
      fecha_final_actual: result[0]?.fecha_final ?? null,
    };
  }

  async datesContract(id_contrato: number) {
    const query = new CuentasCobroValidationSelectBuilder()
      .select('[fecha_inicial]', '[fecha_final]')
      .from('Contratos')
      .whereNumber('id_contrato', id_contrato)
      .whereEstadoActivo()
      .build();

    const result = await this.accessService.executeQuery<{
      fecha_inicial: any;
      fecha_final: any;
    }>(query);

    return {
      fecha_inicial_contrato: result[0]?.fecha_inicial ?? null,
      fecha_final_contrato: result[0]?.fecha_final ?? null,
    };
  }

  /**
   * BUILDER: Construye INSERT con interfaz fluida.
   * ANTES: String crudo con interpolación.
   * DESPUÉS: new CuentasCobroInsertBuilder().into('CuentasCobro').setNumber(...).build()
   */
  async create(cuentaCobro: CreateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor,
      observaciones, oficina_receptora, fecha_inicial, fecha_final, periodo, url, fecha_creacion, requisitos } = cuentaCobro;

    let f_inicial = null, f_final = null, f_aprobacion = null, f_creacion = null;

    if (fecha_inicial) f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (fecha_final) f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_aprobacion) f_aprobacion = formatDateForAccess(fecha_aprobacion.toString());

    if (!fecha_creacion) throw new BadRequestException("fecha_creacion faltante");
    f_creacion = formatDateForAccess(fecha_creacion.toString());

    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));

    if (f_inicial_format > f_final_format) {
      throw new BadRequestException(`La fecha final debe ser mayor o igual que la fecha inicial`);
    }

    return this.accessService.transaction(async (tx) => {
      const query = new CuentasCobroInsertBuilder()
        .into('CuentasCobro')
        .setNumber('id_contrato', id_contrato)
        .setNumber('id_aprobador', id_aprobador)
        .setRaw('fecha_aprobacion', f_aprobacion)
        .setNumber('id_revisor', id_revisor)
        .setString('observaciones', observaciones)
        .setString('oficina_receptora', oficina_receptora)
        .setRaw('fecha_inicial', f_inicial)
        .setRaw('fecha_final', f_final)
        .setString('periodo', periodo)
        .setString('url', url)
        .setRaw('fecha_creacion', f_creacion)
        .setNumber('estado', 1)
        .build();

      await tx.execute(query);

      const resultId = await tx.query<{ id_cuentacobro: number }>(
        'SELECT @@IDENTITY AS id_cuentacobro;'
      );

      const id_cuentacobro = resultId[0].id_cuentacobro;

      let result: any;

      for (const item of requisitos) {
        const queryRequisito = new CuentasCobroInsertBuilder()
          .into('CuentasCobroRequisitos')
          .setNumber('id_cuentacobro', id_cuentacobro)
          .setNumber('id_requisito', item.id_requisito)
          .setNumber('marcado', item.marcado)
          .build();

        result = await tx.execute(queryRequisito);
      }

      return result;
    });
  }

  /**
   * BUILDER: Construye UPDATE con interfaz fluida.
   * ANTES: String crudo con interpolación.
   * DESPUÉS: new CuentasCobroUpdateBuilder().table('CuentasCobro').setNumber(...).build()
   */
  async update(id: number, cuentaCobro: UpdateCuentasCobroDto) {
    const { id_contrato, id_aprobador, fecha_aprobacion, id_revisor, observaciones,
      oficina_receptora, nombre_receptor, fecha_recibido, fecha_inicial, fecha_final, periodo, url, fecha_modificacion, requisitos } = cuentaCobro;

    let f_inicial = null, f_final = null, f_recibido = null, f_aprobacion = null, f_modificacion = null;
    if (fecha_inicial) f_inicial = formatOnlyDateForAccess(fecha_inicial.toString());

    if (fecha_final) f_final = formatOnlyDateForAccess(fecha_final.toString());

    if (fecha_recibido) f_recibido = formatDateForAccess(fecha_recibido.toString());

    if (fecha_aprobacion) f_aprobacion = formatDateForAccess(fecha_aprobacion.toString());

    if (!fecha_modificacion) throw new BadRequestException("fecha_modificacion faltante");
    f_modificacion = formatDateForAccess(fecha_modificacion.toString());

    const f_inicial_format = getDateAccessFormat(String(fecha_inicial));
    const f_final_format = getDateAccessFormat(String(fecha_final));

    if (f_inicial_format > f_final_format) {
      throw new BadRequestException(`La fecha final debe ser mayor o igual que la fecha inicial`);
    }

    const query = new CuentasCobroUpdateBuilder()
      .table('CuentasCobro')
      .setNumber('id_contrato', id_contrato)
      .setNumber('id_aprobador', id_aprobador)
      .setRaw('fecha_aprobacion', f_aprobacion)
      .setNumber('id_revisor', id_revisor)
      .setString('observaciones', observaciones)
      .setString('oficina_receptora', oficina_receptora)
      .setString('nombre_receptor', nombre_receptor)
      .setRaw('fecha_recibido', f_recibido)
      .setRaw('fecha_inicial', f_inicial)
      .setRaw('fecha_final', f_final)
      .setString('periodo', periodo)
      .setString('url', url)
      .setRaw('fecha_modificacion', f_modificacion)
      .whereNumber('id_cuentacobro', id)
      .build();

    return this.accessService.transaction(async (tx) => {
      let result: any;

      // UPDATE CuentasCobro
      result = await tx.execute(query);

      // UPDATE CuentasCobroRequisitos
      if (requisitos) {
        for (const item of requisitos) {
          const queryRequisito = new CuentasCobroUpdateBuilder()
            .table('CuentasCobroRequisitos')
            .setNumber('marcado', item.marcado)
            .whereNumber('id_cuentacobro', id)
            .whereNumber('id_requisito', item.id_requisito)
            .build();

          result = await tx.execute(queryRequisito);
        }
      }

      return result;

    });
  }

  /**
   * BUILDER: Construye DELETE con interfaz fluida.
   * ANTES: String crudo con interpolación.
   * DESPUÉS: new CuentasCobroDeleteBuilder().from('CuentasCobro').whereNumber(...).build()
   */
  async delete(id: number) {

    return this.accessService.transaction(async (tx) => {

      const requisitosQuery = new CuentasCobroDeleteBuilder()
        .from('CuentasCobroRequisitos')
        .whereNumber('id_cuentacobro', id)
        .build();

      await tx.execute(requisitosQuery);

      const cuentaQuery = new CuentasCobroDeleteBuilder()
        .from('CuentasCobro')
        .whereNumber('id_cuentacobro', id)
        .build();

      return tx.execute(cuentaQuery);

    });
  }
}