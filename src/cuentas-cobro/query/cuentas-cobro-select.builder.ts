/**
 * ============================================================================
 * CUENTAS COBRO SELECT BUILDER — BUILDER (GoF)
 * ============================================================================
 *
 * PATRÓN: BUILDER (Creación)
 *
 * PROBLEMA (ANTES):
 *   El mismo SELECT de ~35 líneas con 7 INNER JOIN estaba copiado en 4 métodos:
 *   - findAll()
 *   - findAllByType()
 *   - findOne()
 *   - findByParams()
 *   → Duplicación masiva; causó un bug real: findAll() no seleccionaba
 *     'nombre_receptor' mientras los otros 3 sí, porque cada copia se editaba a mano.
 *
 * SOLUCIÓN (DESPUÉS):
 *   El SELECT está centralizado en esta clase Builder. Los métodos del service
 *   usan la interfaz fluida:
 *   new CuentasCobroSelectBuilder().top(10).build()
 *   new CuentasCobroSelectBuilder().top(50).whereTipoContratista(tipo).build()
 *   → Si agrego un campo, se agrega una vez y beneficia a los 4 métodos.
 *
 * POR QUÉ BUILDER Y NO FACTORY METHOD:
 *   Factory Method crea objetos de TIPOS DIFERENTES.
 *   Builder construye el MISMO TIPO (string SQL) con VARIACIONES (TOP, WHERE, etc.).
 *   La intención es diferente.
 *
 * VENTAJAS:
 *   1. Centralización: una sola fuente de verdad para el SELECT
 *   2. Interfaz fluida: código legible y expresivo
 *   3. Eliminación de duplicación: 4 copias → 1 clase
 *   4. Bug corregido automáticamente: el campo 'nombre_receptor' ahora está en todos
 * ============================================================================
 */

import { escapeAccessString } from "src/access/utils/escape-access-string";
import { CuentaCobroSearch } from "../dto/create-cuentas-cobro.dto";

export class CuentasCobroSelectBuilder {
    private topRows?: number;
    private readonly whereClauses: string[] = ['cc.[estado] = 1'];

    private static readonly BASE_SELECT = `
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
                    cc.nombre_receptor,
                    cc.fecha_recibido,
                    cc.fecha_inicial,
                    cc.fecha_final,
                    cc.periodo,
                    cc.url,
                    cc.fecha_creacion,
                    cc.fecha_modificacion,
                    cc.estado`;
    
    private static readonly BASE_FROM = `
                    FROM (((((((CuentasCobro cc
                    INNER JOIN Contratos c ON cc.id_contrato = c.id_contrato )
                    INNER JOIN Contratistas ca ON c.id_contratista = ca.id_contratista )
                    INNER JOIN Personas p1 ON c.id_contratista = p1.id_persona )
                    INNER JOIN Personas p2 ON cc.id_aprobador = p2.id_persona )
                    INNER JOIN Empleados emp ON p2.id_persona = emp.id_empleado )
                    INNER JOIN Personas p3 ON cc.id_revisor = p3.id_persona )
                    INNER JOIN Usuarios us ON p3.id_persona = us.id_usuario )`;

    top(n: number): this {
        this.topRows = n;
        return this;
    }

    whereId(id: number): this {
        this.whereClauses.push(`cc.[id_cuentacobro] = ${id}`);
        return this;
    }

    whereTipoContratista(tipo: string): this {
        this.whereClauses.push(`ca.[tipo] LIKE '%${escapeAccessString(tipo)}%'`);
        return this;
    }

    whereBusqueda({ id_cuentacobro, nombre_contratista, num_contrato, nombre_revisor }: CuentaCobroSearch): this {
        this.whereClauses.push(`( 
                    cc.id_cuentacobro = ${id_cuentacobro} OR
                    c.num_contrato LIKE '%${escapeAccessString(num_contrato)}%' OR
                    p1.nombre & ' ' & p1.apellidos LIKE '%${escapeAccessString(nombre_contratista)}%' OR
                    p3.nombre & ' ' & p3.apellidos LIKE '%${escapeAccessString(nombre_revisor)}%' 
                    )`);
        return this;
    }

    build(): string {
        const topClause = this.topRows ? `TOP ${this.topRows} ` : '';

        return `SELECT ${topClause}${CuentasCobroSelectBuilder.BASE_SELECT}${CuentasCobroSelectBuilder.BASE_FROM}
                   WHERE ${this.whereClauses.join(' AND ')}
                   ORDER BY cc.[id_cuentacobro] DESC;`;
    }

    /**
     * Sub-consulta de requisitos marcados de una cuenta de cobro. Antes vivía
     * repetida en findAllByType(), findOne() y findByParams(); ahora un solo
     * lugar la construye para las tres.
     */
    static buildRequisitosQuery(idCuentaCobro: number): string {
        return `SELECT ccr.id_cuentacobro_requisito,
                      ccr.id_cuentacobro,
                      ccr.id_requisito,
                      r.nombre,
                      ccr.marcado
                    FROM ( CuentasCobroRequisitos ccr
                      INNER JOIN Requisitos r ON ccr.id_requisito = r.id_requisito )
                    WHERE ccr.[id_cuentacobro] = ${idCuentaCobro} AND r.[estado] = 1 ;`;
    }
}