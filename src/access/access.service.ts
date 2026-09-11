/**
 * ============================================================================
 * ACCESS SERVICE — ADAPTER (GoF) — Fachada del dominio
 * ============================================================================
 *
 * PATRÓN: ADAPTER (Estructural)
 *
 * PROBLEMA (ANTES):
 *   El servicio original devolvía strings de error, y cada consumidor debía
 *   parsearlos para detectar errores:
 *   const result = await this.accessService.executeQuery(query);
 *   if (JSON.stringify(result).includes('Error al ejecutar la consulta')) {
 *     throw new InternalServerErrorException('Error');
 *   }
 *   → Repetido ~20 veces en el proyecto. Frágil y violación de DRY.
 *
 * SOLUCIÓN (DESPUÉS):
 *   AccessService depende de la INTERFAZ DatabaseGateway (no de OdbcDatabaseGateway).
 *   El adaptador OdbcDatabaseGateway ahora LANZA excepciones NestJS reales.
 *   → Los consumidores ya no parsean strings; reciben resultados o excepciones.
 *
 * USO:
 *   const result = await this.accessService.executeQuery<T>(query);
 *   // Si hay error → se lanza InternalServerErrorException automáticamente
 *   // Si está vacío → ThrowIfEmptyInterceptor lanza NotFoundException (Decorator)
 * ============================================================================
 */

import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_GATEWAY, DatabaseGateway, TransactionContext } from 'src/assets/db/interfaces/database-gateway.interface';

@Injectable()
export class AccessService {

  constructor(
    @Inject(DATABASE_GATEWAY)  // ← ADAPTER: inyecta por INTERFAZ, no por clase
    private readonly gateway: DatabaseGateway,
  ) { }

  async executeQuery<T = any>(query: string): Promise<T[]> {
    return this.gateway.query(query);
  }

  async execute(sql: string): Promise<void> {
    return this.gateway.execute(sql);
  }

  async transaction<T>(callback: (tx: TransactionContext) => Promise<T>,): Promise<T> {
    return this.gateway.transaction(callback);
  }
}