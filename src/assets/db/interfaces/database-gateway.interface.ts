/**
 * ============================================================================
 * DATABASE GATEWAY — ADAPTER (GoF)
 * ============================================================================
 *
 * PATRÓN: ADAPTER (Estructural)
 *
 * PROBLEMA (ANTES):
 *   El servicio de acceso a datos llamaba directamente a require('odbc'):
 *   const connection = await require('odbc').connect(...);
 *   → Acoplaba toda la capa de negocio a una librería concreta.
 *   → Cada consumidor debía "adivinar" si el resultado era error parseando texto.
 *
 * SOLUCIÓN (DESPUÉS):
 *   Esta interfaz define el CONTRATO del dominio: query(), execute(), transaction().
 *   El adaptador concreto (OdbcDatabaseGateway) traduce entre ODBC y esta interfaz.
 *   El consumidor (AccessService) depende de la interfaz, no de la implementación.
 *
 * TRANSACTION CALLBACK:
 *   El método transaction() acepta un callback que recibe un TransactionContext.
 *   Si el callback completa sin errores → COMMIT automático.
 *   Si el callback lanza excepción → ROLLBACK automático.
 *   La conexión se cierra siempre (finally).
 *   → Más seguro que begin/commit/rollback manuales.
 *
 * BENEFICIOS:
 *   1. Desacoplamiento: cambiar de BD = nuevo adaptador, sin tocar servicios.
 *   2. Testeabilidad: overrideProvider(DATABASE_GATEWAY) para tests unitarios.
 *   3. Vocabulario unificado: el negocio habla de query/execute, no de odbc.pool.
 * ============================================================================
 */

export interface TransactionContext {
  query<T = any>(sql: string): Promise<T[]>;
  execute(sql: string): Promise<void>;
}

export interface DatabaseGateway {
  /** SELECT: obtiene conexión del pool, ejecuta, devuelve al pool */
  query<T = any>(sql: string): Promise<T[]>;
  /** INSERT, UPDATE, DELETE: lanza excepción si falla */
  execute(sql: string): Promise<void>;
  transaction<T>(callback: (tx: TransactionContext) => Promise<T>,): Promise<T>;
}

/**
 * Token Symbol para inyección de dependencias.
 */
export const DATABASE_GATEWAY = Symbol('DATABASE_GATEWAY');